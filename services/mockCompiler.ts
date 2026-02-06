import { ConsoleMessage } from '../types';

// Helper to remove comments but keep line numbers aligned
const stripComments = (code: string): string => {
    const pattern = /("(\\.|[^"])*")|(\/\/.*)|(\/\*[\s\S]*?\*\/)/g;
    return code.replace(pattern, (match, stringGroup) => {
        if (stringGroup) return match; 
        const newlines = match.match(/\n/g);
        return newlines ? newlines.join('') : ''; 
    });
};

type PrintCallback = (msg: ConsoleMessage) => void;
type InputCallback = () => Promise<string>;

// Simple expression evaluator using JS Runtime
const evaluateCondition = (expr: string, vars: Record<string, any>): boolean => {
    try {
        const keys = Object.keys(vars);
        const values = Object.values(vars);
        // eslint-disable-next-line no-new-func
        const func = new Function(...keys, `return ${expr};`);
        return !!func(...values);
    } catch (e) {
        return false;
    }
};

export const compileAndRun = async (
    code: string, 
    onPrint: PrintCallback, 
    onInput: InputCallback
): Promise<void> => {
    
    const timestamp = Date.now();
    const cleanedCode = stripComments(code);
    
    // --- SYNTAX CHECKS ---
    const lines = cleanedCode.split('\n');
    for(let i=0; i<lines.length; i++) {
        const trimmed = lines[i].trim();
        if (!trimmed) continue;
        const isStructural = 
             trimmed.startsWith('using') || trimmed.startsWith('namespace') || trimmed.startsWith('class') || 
             trimmed.startsWith('public') || trimmed.startsWith('private') || trimmed.startsWith('protected') ||
             trimmed.startsWith('static') || trimmed.startsWith('if') || trimmed.startsWith('else') ||
             trimmed.startsWith('for') || trimmed.startsWith('foreach') || trimmed.startsWith('while') ||
             trimmed.endsWith('}') || trimmed.endsWith('{') || trimmed.startsWith('break') || trimmed.startsWith('continue');

        const isMultiLineContinuation = trimmed.endsWith(',') || trimmed.endsWith('=>') || trimmed.endsWith('switch');

        if (!isStructural && !isMultiLineContinuation && !trimmed.endsWith(';')) {
             onPrint({
                  id: crypto.randomUUID(),
                  type: 'error',
                  content: `Error CS1002: ; expected at line ${i + 1}`,
                  suggestion: "Add a semicolon ';' at the end of the line.",
                  timestamp,
                  line: i + 1
              });
              onPrint({ id: crypto.randomUUID(), type: 'system', content: 'Build failed.', timestamp: Date.now() });
              return;
        }
    }

    onPrint({ id: crypto.randomUUID(), type: 'system', content: 'Build started...', timestamp });

    // --- INTERPRETER PREPARATION ---
    const mainMethodRegex = /static\s+void\s+Main\s*\(/;
    let executionLines: string[] = [];

    if (mainMethodRegex.test(cleanedCode)) {
        const linesTrimmed = lines.map(l => l.trim());
        let inMain = false;
        let braceCount = 0;
        let mainStarted = false;

        for(let line of linesTrimmed) {
            if (!mainStarted && /static\s+void\s+Main/.test(line)) {
                mainStarted = true;
                if (line.includes('{')) {
                    inMain = true;
                    braceCount = 1;
                }
                continue;
            }
            if (mainStarted && !inMain) {
                if (line.includes('{')) {
                    inMain = true;
                    braceCount = 1;
                    continue; 
                }
            }
            if (inMain) {
                const openCount = (line.match(/\{/g) || []).length;
                const closeCount = (line.match(/\}/g) || []).length;
                const nextBraceCount = braceCount + openCount - closeCount;
                if (nextBraceCount === 0 && closeCount > 0) {
                    if (line === '}') break; 
                }
                braceCount = nextBraceCount;
                executionLines.push(line);
                if (braceCount <= 0) break;
            }
        }
    } else {
        executionLines = lines.map(l => l.trim()).filter(l => {
            return !l.startsWith('using') && !l.startsWith('namespace') && !l.startsWith('class Program') && l !== '{' && l !== '}';
        });
    }

    if (executionLines.length === 0 && mainMethodRegex.test(cleanedCode)) {
         onPrint({
            id: crypto.randomUUID(),
            type: 'error',
            content: 'Error CS5001: Program does not contain a static \'Main\' method suitable for an entry point',
            suggestion: 'Ensure your Main method is inside a class and has the correct signature: static void Main()',
            timestamp: Date.now()
        });
        return;
    }

    // --- INTERPRETER STATE ---
    const variables: Record<string, any> = {};
    let buffer = ""; 

    const flushBuffer = async () => {
        if (buffer) {
            onPrint({ id: crypto.randomUUID(), type: 'info', content: buffer, timestamp: Date.now() });
            buffer = "";
            // Significant delay to ensure DOM render and state updates propagate before blocking for input
            await new Promise(r => setTimeout(r, 100));
        }
    };

    const log = (text: string, isLine: boolean) => {
        if (text === undefined || text === null) text = "";
        if (typeof text !== 'string') text = String(text);
        if (text.includes('\\n')) text = text.replace(/\\n/g, '\n');
        
        if (text.includes('\n')) {
            const parts = text.split('\n');
            parts.forEach((p, i) => {
                if (i < parts.length - 1) {
                    buffer += p;
                } else {
                    buffer += p;
                }
            });
        } else {
            buffer += text;
        }

        if (isLine) {
            onPrint({
                id: crypto.randomUUID(),
                type: 'info',
                content: buffer,
                timestamp: Date.now()
            });
            buffer = "";
        }
    };

    // --- RECURSION SAFE EVALUATOR ---
    const evaluateValue = (valExpr: string, localVars: any, depth: number = 0): any => {
        if (depth > 10) throw new Error("StackOverflowException: Expression too complex");
        
        valExpr = valExpr.trim();

        // DateTime Mock
        if (valExpr.includes('DateTime.Now')) return new Date().toLocaleString();
        
        // Literals
        const isStringLiteral = (valExpr.startsWith('"') && valExpr.endsWith('"')) || (valExpr.startsWith("'") && valExpr.endsWith("'"));
        if (isStringLiteral) return valExpr.slice(1, -1);
        if (valExpr === 'true') return true;
        if (valExpr === 'false') return false;

        // Runtime Evaluation using JS Function
        try {
            // Check for complex C# specific syntax that JS new Function won't like
            // e.g. switch expressions, lambda arrows, object creation (new ...)
            if (!valExpr.includes('new ') && !valExpr.includes('switch') && !valExpr.includes('=>')) {
                const keys = Object.keys(localVars);
                const values = Object.values(localVars);
                
                // Pass variables as arguments to the dynamic function to ensure current scope values are used
                // eslint-disable-next-line no-new-func
                const func = new Function(...keys, `return ${valExpr};`);
                return func(...values);
            }
        } catch (e) {
            // Fallback for complex expressions or failures
        }

        return resolveExpression(valExpr, localVars, depth + 1);
    };

    const resolveExpression = (expr: string, localVars: any, depth: number = 0): string => {
        if (depth > 10) return expr; 
        expr = expr.trim();
        if (!expr) return "";

        // String Interpolation
        if (expr.startsWith('$')) {
            const content = expr.slice(expr.indexOf('"') + 1, expr.lastIndexOf('"'));
            return content.replace(/\{([^{}]+)\}/g, (_, expression) => {
                // Recursively evaluate the expression inside {}
                const val = evaluateValue(expression, localVars, depth + 1);
                return val !== undefined && val !== null ? String(val) : `{${expression}}`;
            });
        }
        
        if (expr.startsWith('"') && expr.endsWith('"') && !expr.includes('+')) return expr.slice(1, -1);
        if (localVars[expr] !== undefined && !expr.includes('+')) return String(localVars[expr]);
        
        // Fallback for concatenation
        if (expr.includes('+')) {
            const parts = expr.split('+');
            let result = '';
            parts.forEach(part => {
                const trimmed = part.trim();
                if (trimmed.startsWith('"')) {
                     result += trimmed.slice(1, -1);
                } else {
                     const val = evaluateValue(trimmed, localVars, depth + 1);
                     result += (val !== undefined ? val : "");
                }
            });
            return result;
        }

        return expr;
    };

    const skipBody = (linesArr: string[], startIdx: number): number => {
        const nextLineIndex = startIdx + 1;
        if (nextLineIndex >= linesArr.length) return linesArr.length;

        const nextLine = linesArr[nextLineIndex].trim();
        const sameLine = linesArr[startIdx].trim();

        if (sameLine.includes('{')) {
             let depth = 1;
             for (let j = startIdx + 1; j < linesArr.length; j++) {
                if (linesArr[j].includes('{')) depth++;
                if (linesArr[j].includes('}')) depth--;
                if (depth === 0) return j;
             }
             return linesArr.length - 1;
        }
        if (nextLine.startsWith('{')) {
             let depth = 0;
             let foundStart = false;
             for (let j = startIdx; j < linesArr.length; j++) {
                if (linesArr[j].includes('{')) { depth++; foundStart = true; }
                if (linesArr[j].includes('}')) { depth--; }
                if (foundStart && depth === 0) { return j; }
             }
             return linesArr.length - 1;
        }
        return startIdx + 1;
    };

    const executeLines = async (linesToExec: string[]): Promise<'normal' | 'break' | 'continue'> => {
        let lastIfWasTrue = false;

        for (let i = 0; i < linesToExec.length; i++) {
            const line = linesToExec[i];
            if (!line || line.startsWith('//')) continue;
            
            if (line.trim() === 'break;') return 'break';
            if (line.trim() === 'continue;') return 'continue';

            if (line.startsWith('if')) {
                const condMatch = line.match(/if\s*\((.*)\)/);
                if (condMatch) {
                    const condition = condMatch[1];
                    const isTrue = evaluateCondition(condition, variables);
                    lastIfWasTrue = isTrue;
                    if (!isTrue) i = skipBody(linesToExec, i);
                }
                continue;
            }

            if (line.startsWith('else')) {
                if (lastIfWasTrue) i = skipBody(linesToExec, i);
                continue;
            }

            // --- SWITCH ---
            const switchAssignMatch = line.match(/^(int|string|var|bool|double|char|[\w<>]+)\s+(\w+)\s*=\s*(.+)\s+switch$/);
            if (switchAssignMatch) {
                const [_, type, name, switchOnExpr] = switchAssignMatch;
                const switchVal = evaluateValue(switchOnExpr, variables);
                
                const blockEnd = skipBody(linesToExec, i);
                let matched = false;
                let resultValue = null;
                
                for (let j = i + 1; j < blockEnd; j++) {
                    if (matched) break;
                    const armLine = linesToExec[j].trim();
                    if (!armLine || armLine === '{' || armLine === '}' || armLine === '};') continue;
                    
                    const armMatch = armLine.match(/^(.+?)\s*=>\s*(.+?)(,?)$/);
                    
                    if (armMatch) {
                         const [__, pattern, resultExpr] = armMatch;
                         let isMatch = false;
                         if (pattern === '_') isMatch = true;
                         else {
                             const patVal = evaluateValue(pattern, variables);
                             isMatch = (String(patVal) === String(switchVal));
                         }

                         if (isMatch) {
                             if (resultExpr.includes('throw ')) {
                                 const msg = resultExpr.match(/new \w+\((.*)\)/)?.[1] || "Error";
                                 if (resultExpr.trim().startsWith('throw ')) {
                                    throw new Error(`Runtime Error: ${msg.replace(/"/g, '')}`);
                                 }
                             }
                             try {
                                 resultValue = evaluateValue(resultExpr, variables);
                             } catch(e: any) {
                                 throw new Error(`Runtime Error in switch: ${e.message}`);
                             }
                             matched = true;
                         }
                    }
                }
                
                if (matched) variables[name] = resultValue;
                else throw new Error("SwitchExpressionException: Non-exhaustive switch expression");
                
                i = blockEnd;
                continue;
            }

            // --- VARIABLES ---
            const varMatch = line.match(/^(int|string|var|bool|double|char|[\w<>]+)\s+(\w+)\s*=\s*(.*);/);
            if (varMatch) {
                const [_, type, name, valExpr] = varMatch;
                
                if (valExpr.includes('new ') && valExpr.endsWith('()') && !valExpr.includes('Exception')) {
                    variables[name] = {}; 
                } 
                else if (valExpr.includes('Console.ReadLine()') || valExpr.includes('Console.ReadKey()')) {
                    await flushBuffer(); // CRITICAL: Flush output to screen before blocking
                    const userInput = await onInput(); 
                    if (valExpr.includes('ReadKey')) {
                        variables[name] = userInput && userInput.length > 0 ? userInput[0] : '\0';
                    } else if (valExpr.includes('Convert.ToInt32') || type === 'int') {
                        variables[name] = parseInt(userInput) || 0;
                    } else if (valExpr.includes('Convert.ToDouble') || type === 'double') {
                        variables[name] = parseFloat(userInput) || 0.0;
                    } else {
                        variables[name] = userInput;
                    }
                } else {
                    let finalValue = evaluateValue(valExpr, variables);
                    if (type === 'int') {
                         if (typeof finalValue === 'string' || typeof finalValue === 'boolean') throw new Error(`Error CS0029: Cannot implicitly convert type to 'int'`);
                         finalValue = Math.floor(Number(finalValue));
                         if (isNaN(finalValue)) finalValue = 0;
                    } else if (type === 'double') {
                         finalValue = Number(finalValue);
                    }
                    variables[name] = finalValue;
                }
                continue;
            }

            // --- PROPERTY ASSIGNMENT ---
            const propAssignMatch = line.match(/^\s*(\w+)\.(\w+)\s*=\s*(.*);/);
            if (propAssignMatch) {
                const [_, objName, propName, valExpr] = propAssignMatch;
                if (variables[objName]) {
                    variables[objName][propName] = evaluateValue(valExpr, variables);
                }
                continue;
            }

            // --- REASSIGNMENT ---
            const assignMatch = line.match(/^\s*(\w+)\s*=\s*([^=].*);/);
            if (assignMatch) {
                const [_, name, valExpr] = assignMatch;
                if (variables[name] !== undefined) {
                     if (valExpr.includes('Console.ReadLine()') || valExpr.includes('Console.ReadKey()')) {
                        await flushBuffer();
                        const userInput = await onInput();
                        if (valExpr.includes('ReadKey')) {
                             variables[name] = userInput && userInput.length > 0 ? userInput[0] : '\0';
                        } else if (typeof variables[name] === 'number') {
                             variables[name] = parseFloat(userInput) || 0;
                        } else {
                             variables[name] = userInput;
                        }
                     } else {
                        const newVal = evaluateValue(valExpr, variables);
                        if (typeof variables[name] === 'number') {
                            variables[name] = Number(newVal);
                        } else {
                            variables[name] = newVal;
                        }
                     }
                }
                continue;
            }

            // --- CONSOLE OUTPUT ---
            const consoleMatch = line.match(/^Console\.Write(Line)?\((.*)\);/);
            if (consoleMatch) {
                const isLine = consoleMatch[1] === 'Line';
                const args = consoleMatch[2];
                const output = resolveExpression(args, variables);
                log(output, isLine);
                // Artificial delay for visualization
                await new Promise(r => setTimeout(r, 10));
                continue;
            }

            // --- FOR LOOP ---
            if (line.startsWith('for')) {
                const loopHead = line.match(/for\s*\(\s*(?:int\s+)?(\w+)\s*=\s*(\d+|\w+);\s*\w+\s*(<=|<|>=|>)\s*(\w+|\d+);\s*\w+(\+\+|--)\s*\)/);
                if (loopHead) {
                    const [_, loopVar, startRaw, operator, limitRaw, iterator] = loopHead;
                    
                    let start = evaluateValue(startRaw, variables);
                    const limit = evaluateValue(limitRaw, variables);
                    const blockEnd = skipBody(linesToExec, i);
                    const bodyLines = linesToExec.slice(i + 1, blockEnd).filter(l => l !== '{' && l !== '}');
                    
                    let val = Number(start);
                    const check = (v: number) => {
                        const l = Number(limit);
                        if (operator === '<') return v < l;
                        if (operator === '<=') return v <= l;
                        if (operator === '>') return v > l;
                        if (operator === '>=') return v >= l;
                        return false;
                    };

                    let iterCount = 0;
                    while (check(val) && iterCount < 1000) {
                        variables[loopVar] = val;
                        const status = await executeLines(bodyLines);
                        if (status === 'break') break;
                        if (iterator === '++') val++;
                        else val--;
                        iterCount++;
                    }
                    i = blockEnd; 
                }
            }
        }
        return 'normal';
    };

    try {
        await executeLines(executionLines);
        await flushBuffer();
        onPrint({
            id: crypto.randomUUID(),
            type: 'success',
            content: 'Build succeeded. 0 Errors, 0 Warnings.',
            timestamp: Date.now() + 100,
        });
    } catch (e: any) {
         let msg = e.message || 'Runtime Error';
         if (!msg.startsWith('Error')) msg = 'Runtime Error: ' + msg;
         onPrint({
            id: crypto.randomUUID(),
            type: 'error',
            content: msg,
            suggestion: msg.includes('Call stack') ? 'Check for infinite recursion or loops.' : 'Check for syntax errors or invalid variable types.',
            timestamp: Date.now(),
        });
    }
};