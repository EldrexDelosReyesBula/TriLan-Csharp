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

// Simple expression evaluator for the mock interpreter
const evaluateCondition = (expr: string, vars: Record<string, any>): boolean => {
    try {
        let evalStr = expr;
        Object.keys(vars).forEach(key => {
            let val = vars[key];
            if (typeof val === 'string') val = `"${val}"`;
            // specific regex to replace whole word only
            const reg = new RegExp(`\\b${key}\\b`, 'g');
            evalStr = evalStr.replace(reg, val);
        });
        // eslint-disable-next-line no-new-func
        return new Function(`return ${evalStr}`)();
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
    // 1. Semicolon check
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

        if (!isStructural && !trimmed.endsWith(';')) {
             onPrint({
                  id: crypto.randomUUID(),
                  type: 'error',
                  content: `Error CS1002: ; expected at line ${i + 1}`,
                  timestamp,
                  line: i + 1
              });
              onPrint({ id: crypto.randomUUID(), type: 'system', content: 'Build failed.', timestamp: Date.now() });
              return;
        }
    }

    onPrint({ id: crypto.randomUUID(), type: 'system', content: 'Build started...', timestamp });

    // --- INTERPRETER PREPARATION ---
    
    // Determine Entry Point: Explicit Main vs Top-Level Statements
    const mainMethodRegex = /static\s+void\s+Main\s*\(/;
    let executionLines: string[] = [];

    if (mainMethodRegex.test(cleanedCode)) {
        // Explicit Main: Extract the body of Main
        const linesTrimmed = lines.map(l => l.trim());
        let inMain = false;
        let braceCount = 0;
        let mainStarted = false;

        for(let line of linesTrimmed) {
            if (!mainStarted && /static\s+void\s+Main/.test(line)) {
                inMain = true;
                mainStarted = true;
                if (line.includes('{')) braceCount++;
                continue;
            }
            if (inMain) {
                if (line.includes('{')) braceCount++;
                if (line.includes('}')) braceCount--;
                
                if (braceCount <= 0) {
                    inMain = false; 
                    break;
                }
                if (line !== '{' && line !== '}') executionLines.push(line);
            }
        }
    } else {
        // Top-Level Statements: Treat the whole file as execution body
        executionLines = lines.map(l => l.trim()).filter(l => {
            return !l.startsWith('using') && !l.startsWith('namespace') && !l.startsWith('class Program') && l !== '{' && l !== '}';
        });
    }

    // --- INTERPRETER STATE ---
    const variables: Record<string, any> = {};
    let buffer = ""; 

    const flushBuffer = async () => {
        if (buffer) {
            onPrint({ id: crypto.randomUUID(), type: 'info', content: buffer, timestamp: Date.now() });
            buffer = "";
            // Significant delay to ensure DOM render before prompt
            await new Promise(r => setTimeout(r, 50));
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
                    onPrint({
                        id: crypto.randomUUID(),
                        type: 'info',
                        content: buffer + p,
                        timestamp: Date.now()
                    });
                    buffer = "";
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

    // Resolves a string expression (for Console.Write, string building)
    const resolveExpression = (expr: string, localVars: any): string => {
        expr = expr.trim();
        if (!expr) return "";

        // Interpolation $"..."
        if (expr.startsWith('$')) {
            const content = expr.slice(expr.indexOf('"') + 1, expr.lastIndexOf('"'));
            return content.replace(/\{(\w+)\}/g, (_, key) => {
                if (localVars[key] !== undefined) return String(localVars[key]);
                return `{${key}}`; 
            });
        }
        
        // Literal String
        if (expr.startsWith('"') && expr.endsWith('"') && !expr.includes('+')) {
            return expr.slice(1, -1);
        }

        // Variable lookup (simple)
        if (localVars[expr] !== undefined && !expr.includes('+') && !expr.includes('-') && !expr.includes('*')) {
             return String(localVars[expr]);
        }

        // Logic for Math vs String Concatenation
        const containsStringQuote = expr.includes('"');
        // If it looks like math and has no quotes, try to eval it as math
        if (!containsStringQuote) {
             try {
                 let evalStr = expr;
                 // Replace variables with their values
                 for (const [key, val] of Object.entries(localVars)) {
                     const reg = new RegExp(`\\b${key}\\b`, 'g');
                     evalStr = evalStr.replace(reg, String(val));
                 }
                 // Safe-ish eval for math
                 // eslint-disable-next-line no-new-func
                 const result = new Function(`return ${evalStr}`)();
                 return String(result);
             } catch (e) {
                 // Fall through
             }
        }

        // Fallback: Naive Concatenation
        const parts = expr.split('+');
        let result = '';

        parts.forEach(part => {
            part = part.trim();
            if ((part.startsWith('"') && part.endsWith('"'))) {
                result += part.slice(1, -1);
            } else if (localVars[part] !== undefined) {
                result += localVars[part];
            } else if (part.match(/^-?\d+$/)) {
                result += part;
            } else {
                if (localVars[part] !== undefined) result += localVars[part];
                else result += ""; 
            }
        });

        if (result === '') {
            if (localVars[expr] !== undefined) return String(localVars[expr]);
            if (expr.match(/^-?\d+$/)) return expr;
        }

        return result;
    };
    
    // Resolves a value expression preserving types (int, float, bool)
    const evaluateValue = (valExpr: string, localVars: any, typeHint?: string): any => {
        valExpr = valExpr.trim();
        const isStringLiteral = valExpr.startsWith('"');
        const isBoolLiteral = valExpr === 'true' || valExpr === 'false';
        const isNumberLiteral = /^-?\d+(\.\d+)?$/.test(valExpr);

        if (isStringLiteral) {
             return valExpr.slice(1, -1);
        }
        
        if (isBoolLiteral) {
            return valExpr === 'true';
        }
        
        // Math expression or simple number
        if (!isStringLiteral && (isNumberLiteral || valExpr.match(/[\+\-\*\/]/) || localVars[valExpr] !== undefined)) {
            try {
                 let evalStr = valExpr;
                 for (const [key, val] of Object.entries(localVars)) {
                     const reg = new RegExp(`\\b${key}\\b`, 'g');
                     let replacement = val;
                     if (typeof val === 'string') replacement = `"${val}"`;
                     evalStr = evalStr.replace(reg, String(replacement));
                 }
                 // eslint-disable-next-line no-new-func
                 const result = new Function(`return ${evalStr}`)();
                 return result;
            } catch(e) {
                // Fallback
            }
        }

        // Fallback to string if we couldn't parse
        return resolveExpression(valExpr, localVars);
    };

    // Helper to find the end of a block code {...}
    const skipBody = (linesArr: string[], startIdx: number): number => {
        const nextLineIndex = startIdx + 1;
        if (nextLineIndex >= linesArr.length) return linesArr.length;

        const nextLine = linesArr[nextLineIndex].trim();
        const sameLine = linesArr[startIdx].trim();

        // Same line brace
        if (sameLine.includes('{')) {
             let depth = 1;
             for (let j = startIdx + 1; j < linesArr.length; j++) {
                if (linesArr[j].includes('{')) depth++;
                if (linesArr[j].includes('}')) depth--;
                if (depth === 0) return j;
             }
             return linesArr.length - 1;
        }

        // Next line brace
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

        // No braces -> Single line statement, skip next line
        return startIdx + 1;
    };

    // --- RECURSIVE EXECUTION ENGINE ---
    // Returns status: 'normal', 'break', 'continue'
    const executeLines = async (linesToExec: string[]): Promise<'normal' | 'break' | 'continue'> => {
        let lastIfWasTrue = false;

        for (let i = 0; i < linesToExec.length; i++) {
            const line = linesToExec[i];
            if (!line || line.startsWith('//')) continue;
            
            // Break/Continue Check
            if (line.trim() === 'break;') return 'break';
            if (line.trim() === 'continue;') return 'continue';

            // --- CONTROL FLOW ---
            if (line.startsWith('if')) {
                const condMatch = line.match(/if\s*\((.*)\)/);
                if (condMatch) {
                    const condition = condMatch[1];
                    const isTrue = evaluateCondition(condition, variables);
                    lastIfWasTrue = isTrue;
                    
                    if (!isTrue) {
                        i = skipBody(linesToExec, i);
                    }
                }
                continue;
            }

            if (line.startsWith('else')) {
                if (lastIfWasTrue) {
                    i = skipBody(linesToExec, i);
                }
                continue;
            }

            // --- VARIABLE DECLARATION ---
            const varMatch = line.match(/^(int|string|var|bool|double)\s+(\w+)\s*=\s*(.*);/);
            if (varMatch) {
                const [_, type, name, valExpr] = varMatch;
                
                if (valExpr.includes('Console.ReadLine()')) {
                    await flushBuffer();
                    const userInput = await onInput();
                    if (valExpr.includes('Convert.ToInt32') || type === 'int') {
                        variables[name] = parseInt(userInput) || 0;
                    } else if (valExpr.includes('Convert.ToDouble') || type === 'double') {
                        variables[name] = parseFloat(userInput) || 0.0;
                    } else {
                        variables[name] = userInput;
                    }
                } else {
                    let finalValue = evaluateValue(valExpr, variables);
                    
                    if (type === 'int') {
                         // Type check simulation
                         if (typeof finalValue === 'string') throw new Error(`Error CS0029: Cannot implicitly convert type 'string' to 'int'`);
                         if (typeof finalValue === 'boolean') throw new Error(`Error CS0029: Cannot implicitly convert type 'bool' to 'int'`);
                         finalValue = Math.floor(Number(finalValue));
                         if (isNaN(finalValue)) finalValue = 0;
                    } else if (type === 'double') {
                         finalValue = Number(finalValue);
                    }
                    variables[name] = finalValue;
                }
                continue;
            }

            // --- ASSIGNMENT (Reassignment) ---
            const assignMatch = line.match(/^\s*(\w+)\s*=\s*([^=].*);/);
            if (assignMatch) {
                const [_, name, valExpr] = assignMatch;
                if (variables[name] !== undefined) {
                     if (valExpr.includes('Console.ReadLine()')) {
                        await flushBuffer();
                        const userInput = await onInput();
                        if (typeof variables[name] === 'number') {
                             variables[name] = parseFloat(userInput) || 0;
                        } else {
                             variables[name] = userInput;
                        }
                     } else {
                        const newVal = evaluateValue(valExpr, variables);
                        // Basic type preservation
                        if (typeof variables[name] === 'number') {
                            variables[name] = Number(newVal);
                        } else {
                            variables[name] = newVal;
                        }
                     }
                }
                continue;
            }

            // --- COMPOUND ASSIGNMENT (+=, -=) ---
            const compoundMatch = line.match(/^\s*(\w+)\s*(\+|-)=\s*(.*);/);
            if (compoundMatch) {
                const [_, name, op, valExpr] = compoundMatch;
                if (variables[name] !== undefined) {
                    const diff = evaluateValue(valExpr, variables);
                    if (op === '+') variables[name] += diff;
                    if (op === '-') variables[name] -= diff;
                }
                continue;
            }

            // --- INCREMENT / DECREMENT ---
            const incDecMatch = line.match(/^\s*(?:(\w+)(\+\+|--)|(\+\+|--)(\w+))\s*;/);
            if (incDecMatch) {
                // Determine which group matched
                const name = incDecMatch[1] || incDecMatch[4];
                const op = incDecMatch[2] || incDecMatch[3];
                if (variables[name] !== undefined && typeof variables[name] === 'number') {
                    if (op === '++') variables[name]++;
                    if (op === '--') variables[name]--;
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
                // Ensure UI updates (yield)
                await new Promise(r => setTimeout(r, 10));
                continue;
            }

            // --- FOR LOOP ---
            if (line.startsWith('for')) {
                // Regex supports: for (int i = 0; ...), for (i = 0; ...)
                // Group 1: optional 'int', Group 2: variable name, Group 3: start val
                // Group 4: operator, Group 5: limit, Group 6: iterator
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
                        
                        // Recursive Execution!
                        const status = await executeLines(bodyLines);
                        
                        if (status === 'break') break;
                        // continue handled implicitly by loop
                        
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
            timestamp: Date.now(),
        });
    }
};