# TriLan C# Compiler – Update Notes

**Version:** 1.6.0 – Full System Update  
**Date:** 2026-01-31  

---

## 🆕 New Features & Improvements

### 1. Entry Point Detection & UX
- Top-Level Statements (`Console.WriteLine("Hello")`) are fully supported.
- Blank editor no longer triggers CS5001. Instead:
  - Users see a **friendly encouragement message**:  
    *“Start coding by writing your first program 🚀 Try printing something to the console or insert a starter template.”*
- Classic `static void Main()` is fully supported.
- Utilities, classes, and libraries without `Main` now **compile without error**.

---

### 2. Compiler & Runtime Fixes
- Fixed **type checking**: errors like `int x = "hello";` now correctly show **CS0029**.
- Arithmetic operations now evaluate correctly in both snippets and full programs.
- If–Else logic executes both branches reliably.
- Loops (`for`, `foreach`) now iterate correctly.
- Console.WriteLine with variable interpolation evaluated correctly with **temporary variables** (see known issues for `$"{variable}"`).

---

### 3. Console Input & Output
- `Console.ReadLine()` is fully blocking and synchronized with output.
- Multiple prompts in loops **no longer skip inputs**.
- Console output flushing fixed – outputs appear in the correct order.

---

### 4. Mobile Editor UX Enhancements
- **Select All**, multi-line deletion, and undo now work properly.
- Backspace and continuous deletion are smooth without lag.
- Long code lines automatically wrap for mobile screens.
- Notes/highlighting workflow improved: highlighted code is directly inserted into the note editor.

---

### 5. PWA & Offline Improvements
- Installing the app on mobile **adds to home screen** and launches properly.
- Offline usage now supported:
  - App opens correctly without 404 errors.
  - Cached editor and snippets available offline.

---

### 6. Known Issues / Workarounds
1. **String interpolation bug:**  
   - `$"{variable}"` inside loops or after reassignment may **always show the first value**.  
   - **Workarounds:**
     ```csharp
     int current = i;
     Console.WriteLine($"Value: {current}");
     ```
     or
     ```csharp
     Console.WriteLine("Value: " + i);
     ```
   - Full fix is planned for next patch.

2. **Top-Level Statement snippet arithmetic in complex expressions:**  
   - Simple addition/subtraction works; more complex expressions should be verified before release.

---

### 7. Regression Test Highlights
- ✅ Top-Level Statements execute correctly.
- ✅ Classic `Main()` execution works.
- ✅ Loops (`for`, `foreach`) and conditionals execute correctly.
- ✅ Console input/output behaves synchronously.
- ✅ Mobile editor supports select/delete/undo properly.
- ✅ PWA installs and opens offline without errors.
- ✅ Utilities and library code without `Main` build successfully.
- ⚠️ String interpolation requires temporary variables or concatenation.

---

### 8. Notes for Developers
- `$"{variable}"` interpolation in loops is **still evaluated incorrectly** in the snippet engine; requires runtime evaluation fix.
- Consider reviewing **AST transformation or execution wrapper** for deferred evaluation.
- All other compiler, runtime, UX, and PWA fixes are fully implemented and tested.

---

**End of Update**
