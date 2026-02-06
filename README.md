<p align="center">  
  <img src="https://eldrex.landecs.org/squad/trilan-logo.png" alt="TriLan Logo" width="140"/>  
</p>  

<h1 align="center">TriLan C# (Beta)</h1>  

<p align="center">  
  A modern, browser-based C# playground with VS Code–like experience, optimized for learning and experimentation.  
</p>  

<p align="center">
  <a href="https://trilan-c.landecs.org"><strong>🌐 Live Demo</strong></a> •
  <a href="https://github.com/EldrexDelosReyesBula/TriLan-Csharp/wiki"><strong>📚 Documentation</strong></a> •
  <a href="https://github.com/EldrexDelosReyesBula/TriLan-Csharp/issues"><strong>🐛 Report Bug</strong></a> •
</p>

<p align="center">
  <a href="https://github.com/EldrexDelosReyesBula/TriLan-Csharp/stargazers">
    <img src="https://img.shields.io/github/stars/EldrexDelosReyesBula/TriLan-Csharp?style=for-the-badge&logo=github&color=yellow" alt="GitHub stars">
  </a>
  <a href="https://github.com/EldrexDelosReyesBula/TriLan-Csharp/issues">
    <img src="https://img.shields.io/github/issues/EldrexDelosReyesBula/TriLan-Csharp?style=for-the-badge&logo=github" alt="GitHub issues">
  </a>
  <a href="LICENSE">
    <img src="https://img.shields.io/badge/License-MIT-green?style=for-the-badge" alt="MIT License">
  </a>
  <a href="https://trilan-c.landecs.org">
    <img src="https://img.shields.io/badge/Status-Beta-orange?style=for-the-badge" alt="Beta Status">
  </a>
</p>

<div align="center">

**A Web-Based C# IDE That Runs Entirely in Your Browser**

[Try Now](https://trilan-c.landecs.org)  • [Contribute](CONTRIBUTING.md)

</div>

---

## ✨ **Features**

### **🎯 Learning-Focused**
- **Beginner-Friendly Interface** – Clean, intuitive design perfect for students
- **Interactive Tutorials** – Built-in examples and learning exercises
- **Instant Feedback** – Real-time compilation and error reporting
- **No Setup Required** – Start coding immediately in your browser

### **💻 Development Experience**
- **VS Code-like Editor** – Familiar interface with syntax highlighting
- **IntelliSense Support** – Smart code completion and suggestions
- **Multiple Themes** – Customizable light/dark modes
- **Responsive Design** – Works flawlessly on desktop and mobile
- **Project Management** – Save, load, and organize your code projects

### **⚡ Performance & Reliability**
- **Fast Compilation** – Near-instant code execution
- **Offline Capable** – Progressive Web App (PWA) support
- **Privacy First** – Code stays in your browser
- **No Server Dependency** – All processing happens client-side

---

## 🚀 **Quick Start**

### **Online (Recommended)**
1. Visit **[https://trilan-c.landecs.org](https://trilan-c.landecs.org)**
2. Start coding immediately – no signup required!
3. Explore examples from the sidebar

### **Local Development**
```bash
# Clone the repository
git clone https://github.com/EldrexDelosReyesBula/TriLan-Csharp.git
cd TriLan-Csharp

# Install dependencies
npm install

# Start development server
npm run dev

# Open http://localhost:5173 in your browser
```

---

## 📸 **Screenshots**

### **Editor Interface**
![TriLan C# Editor](https://eldrex.landecs.org/squad/trilan-csharp-editor.png)

**Features Visible:**
- Modern, clean editor with syntax highlighting
- Sidebar navigation for projects and examples
- Real-time console output
- Mobile-responsive layout

### **Customization Panel**
![Settings & Appearance Panel](https://eldrex.landecs.org/squad/trilan-customization.png)

**Customization Options:**
- **Theme Selection**: Light, Dark, or System preference
- **Theme Presets**: Cosmic Orange, Ocean Blue, Monochrome
- **Typography**: Adjust editor and UI fonts
- **Layout Preferences**: Tailor the IDE to your workflow

---

## 📚 **Usage Examples**

### **1. Hello World**
```csharp
using System;

class Program
{
    static void Main()
    {
        Console.WriteLine("Hello, TriLan C#!");
        Console.WriteLine($"Current time: {DateTime.Now}");
    }
}
```

### **2. Simple Calculator**
```csharp
using System;

class Calculator
{
    static void Main()
    {
        Console.Write("Enter first number: ");
        double num1 = Convert.ToDouble(Console.ReadLine());
        
        Console.Write("Enter operation (+, -, *, /): ");
        char operation = Console.ReadKey().KeyChar;
        Console.WriteLine();
        
        Console.Write("Enter second number: ");
        double num2 = Convert.ToDouble(Console.ReadLine());
        
        double result = operation switch
        {
            '+' => num1 + num2,
            '-' => num1 - num2,
            '*' => num1 * num2,
            '/' => num2 != 0 ? num1 / num2 : throw new DivideByZeroException(),
            _ => throw new InvalidOperationException("Invalid operation");
        };
        
        Console.WriteLine($"Result: {result}");
    }
}
```

### **3. Learning Exercises Included**
- Fibonacci sequence generator
- Prime number checker
- Basic data structures
- Algorithm implementations
- Object-oriented programming examples

---

## 🏗️ **Project Structure**

```
TriLan-Csharp/
├── components/           # React components
│   ├── Editor.tsx       # Code editor with Monaco
│   ├── Console.tsx      # Output display
│   ├── Sidebar.tsx      # Navigation and projects
│   ├── Settings.tsx     # User preferences
│   └── ...              # Other UI components
├── services/            # Business logic
│   ├── mockCompiler.ts  # Code execution engine
│   └── zipService.ts    # Project import/export
├── public/              # Static assets
└── ...                  # Configuration files
```

---

## 🛠️ **Built With**

- **[React](https://reactjs.org/)** – UI framework
- **[TypeScript](https://www.typescriptlang.org/)** – Type safety
- **[Monaco Editor](https://microsoft.github.io/monaco-editor/)** – VS Code's editor component
- **[Vite](https://vitejs.dev/)** – Build tool and dev server
- **[PWA](https://web.dev/progressive-web-apps/)** – Offline capabilities
- **[CSS Modules](https://github.com/css-modules/css-modules)** – Scoped styling

---

## 🤝 **Contributing**

We welcome contributions! Whether you're fixing bugs, adding features, or improving documentation, your help is appreciated.

### **Getting Started with Contribution**
1. **Fork** the repository
2. **Clone** your fork locally
3. **Create** a feature branch
4. **Make** your changes
5. **Test** thoroughly
6. **Submit** a Pull Request

See our [CONTRIBUTING.md](CONTRIBUTING.md) for detailed guidelines.

### **Good First Issues**
Looking for where to start? Check issues labeled:
- [`good-first-issue`](https://github.com/EldrexDelosReyesBula/TriLan-Csharp/labels/good-first-issue)
- [`help-wanted`](https://github.com/EldrexDelosReyesBula/TriLan-Csharp/labels/help-wanted)
- [`documentation`](https://github.com/EldrexDelosReyesBula/TriLan-Csharp/labels/documentation)

---

## 🐛 **Reporting Issues**

Found a bug or have a feature request? We'd love to hear from you!

### **Bug Reports**
Please include:
1. **Description** of the issue
2. **Steps** to reproduce
3. **Expected** vs **Actual** behavior
4. **Browser/Device** information
5. **Screenshots** if applicable

### **Feedback & Suggestions**
- Use our [Feedback Form](https://docs.google.com/forms/d/e/1FAIpQLSfXyr-WvHlNDZ0wqOdo-hRMTGEKnv1PVGzNK8o-1J289oUsgQ/viewform)
- Join [GitHub Discussions](https://github.com/EldrexDelosReyesBula/TriLan-Csharp/discussions)
- Create an [Issue](https://github.com/EldrexDelosReyesBula/TriLan-Csharp/issues)

---

## ❤️ **Support the Project**

### **Star the Repository**
If you find TriLan C# useful, please consider giving it a star! ⭐

### **Spread the Word**
Share TriLan C# with fellow learners, educators, and developers!

### **Financial Support**
Help us keep TriLan C# free and accessible:

[![Donate](https://img.shields.io/badge/Donate-LanDecs-blue?style=for-the-badge)](https://www.landecs.org/docs/donation)

Your support helps with:
- Server maintenance and hosting
- Feature development
- Documentation improvements
- Community outreach

---

## 📞 **Connect With Us**

- **Website**: [Landecs.org](https://www.landecs.org)
- **Facebook**: [LanDecs Page](https://www.facebook.com/share/16Zpbt8Sfb/)
- **GitHub**: [@EldrexDelosReyesBula](https://github.com/EldrexDelosReyesBula)
- **Email**: [Contact via Website](https://www.landecs.org/contact)

---

## 📄 **License**

TriLan C# is open-source software licensed under the **MIT License**.

```
MIT License

Copyright (c) 2024 LanDecs

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

---

## 🙏 **Acknowledgments**

Special thanks to:

- **Jasmin Tegio** – For inspiring beginner-focused educational tools
- **Ara Bella Rivera** – For motivating our mobile-first approach
- **All Contributors** – For making TriLan C# better every day
- **The Open Source Community** – For the amazing tools we build upon

---

<p align="center">
  <i>TriLan C# – Making C# education accessible to everyone, everywhere.</i>
</p>

<p align="center">
  <a href="https://trilan-c.landecs.org">🌐 Try It Now</a> •
  <a href="https://github.com/EldrexDelosReyesBula/TriLan-Csharp">⭐ Star on GitHub</a> •
  <a href="https://github.com/EldrexDelosReyesBula/TriLan-Csharp/wiki">📖 Read Docs</a>
</p>
