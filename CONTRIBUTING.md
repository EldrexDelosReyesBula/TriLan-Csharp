# 🚀 Contributing to TriLan C#

Thank you for your interest in contributing to **TriLan C#**! This document provides guidelines and instructions for contributing to our browser-based C# compiler and learning platform.

## 📋 **Table of Contents**
- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Setup](#development-setup)
- [Project Structure](#project-structure)
- [Coding Standards](#coding-standards)
- [Pull Request Process](#pull-request-process)
- [Issue Guidelines](#issue-guidelines)
- [Feature Requests](#feature-requests)
- [Testing](#testing)
- [Documentation](#documentation)
- [Community](#community)

---

## 🤝 **Code of Conduct**

By participating in this project, you agree to maintain a respectful and inclusive environment. We are committed to making participation in our project a harassment-free experience for everyone.

**Our Standards:**
- Use welcoming and inclusive language
- Respect different viewpoints and experiences
- Accept constructive criticism gracefully
- Focus on what's best for the community
- Show empathy towards other community members

**Unacceptable Behavior:**
- Harassment, discrimination, or personal attacks
- Trolling, insulting, or derogatory comments
- Publishing others' private information without permission
- Any conduct that could reasonably be considered inappropriate

**Enforcement:** Violations can be reported by contacting the project team at [your-email]. All reports will be reviewed and investigated.

---

## 🚀 **Getting Started**

### **Prerequisites**
- Node.js 16.x or higher
- npm 8.x or higher
- Git
- A GitHub account

### **First Time Setup**
1. **Fork the Repository**
   ```bash
   # Navigate to the main repository
   # Click the "Fork" button in the top-right corner
   ```

2. **Clone Your Fork**
   ```bash
   git clone https://github.com/YOUR-USERNAME/TriLan-Csharp.git
   cd TriLan-Csharp
   ```

3. **Add Upstream Remote**
   ```bash
   git remote add upstream https://github.com/EldrexDelosReyesBula/TriLan-Csharp.git
   ```

4. **Install Dependencies**
   ```bash
   npm install
   ```

5. **Start Development Server**
   ```bash
   npm run dev
   ```

---

## 🏗️ **Development Setup**

### **Environment Setup**
```bash
# Install all dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Run TypeScript type checking
npm run type-check

# Run linter
npm run lint
```

### **Development Workflow**
1. Always work on a new branch
2. Keep your fork updated with upstream changes
3. Write tests for new features
4. Update documentation as needed

### **Updating Your Fork**
```bash
# Fetch upstream changes
git fetch upstream

# Merge changes to your main branch
git checkout main
git merge upstream/main

# Update your feature branch
git checkout your-feature-branch
git merge main
```

---

## 📁 **Project Structure**

```
TriLan-Csharp/
├── components/           # React components
│   ├── About.tsx        # About page component
│   ├── Console.tsx      # Output console component
│   ├── Editor.tsx       # Code editor component
│   ├── Notes.tsx        # User notes component
│   ├── Onboarding.tsx   # Welcome/onboarding component
│   ├── Privacy.tsx      # Privacy policy component
│   ├── ProjectManager.tsx # Project management component
│   ├── Settings.tsx     # Settings/configuration component
│   ├── Sidebar.tsx      # Navigation sidebar component
│   └── Terms.tsx        # Terms of service component
├── services/            # Service layer
│   ├── mockCompiler.ts  # Compiler simulation service
│   └── zipService.ts    # Project export/import service
├── App.tsx              # Main application component
├── constants.ts         # Application constants
├── types.ts            # TypeScript type definitions
├── vite.config.ts      # Vite configuration
├── sw.js               # Service worker
└── ...config files
```

### **Component Architecture**
- Each component should be self-contained
- Use TypeScript interfaces for props
- Follow the container/presenter pattern when appropriate
- Keep components focused on a single responsibility

---

## 💻 **Coding Standards**

### **TypeScript Guidelines**
```typescript
// ✅ Good Example
interface UserSettings {
  theme: 'light' | 'dark' | 'auto';
  fontSize: number;
  autoSave: boolean;
}

const DEFAULT_SETTINGS: UserSettings = {
  theme: 'auto',
  fontSize: 14,
  autoSave: true,
};

// ❌ Avoid
// Any types, implicit any
```

### **React/JSX Standards**
```tsx
// ✅ Good Example
import React, { useState, useEffect } from 'react';

interface Props {
  initialValue: string;
  onChange: (value: string) => void;
}

export const CodeEditor: React.FC<Props> = ({ initialValue, onChange }) => {
  const [code, setCode] = useState(initialValue);
  
  useEffect(() => {
    onChange(code);
  }, [code, onChange]);
  
  return (
    <textarea
      value={code}
      onChange={(e) => setCode(e.target.value)}
      className="code-editor"
    />
  );
};

// ❌ Avoid
// Large components, inline complex logic
```

### **Styling Conventions**
- Use CSS modules or Tailwind-like utility classes
- Keep styles component-scoped
- Follow BEM naming when using plain CSS
- Use CSS variables for theming

### **File Naming**
- Components: `PascalCase.tsx`
- Services/Utilities: `camelCase.ts`
- Constants: `CONSTANT_CASE` in constants.ts
- Types: `PascalCase` in types.ts

### **Commit Message Convention**
```
type(scope): description

Examples:
feat(editor): add auto-completion support
fix(compiler): resolve syntax highlighting issue
docs(readme): update installation instructions
test(console): add unit tests for output formatting
refactor(services): improve error handling in compiler
```

**Types:**
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation
- `style`: Code style changes
- `refactor`: Code refactoring
- `test`: Adding tests
- `chore`: Maintenance tasks

---

## 🔀 **Pull Request Process**

### **Before Submitting a PR**
1. Ensure your code follows our standards
2. Update documentation if needed
3. Add tests for new functionality
4. Verify all tests pass
5. Test the feature manually

### **Creating a PR**
1. **Create a Descriptive Title**
   ```
   feat(editor): implement code folding functionality
   ```

2. **Use the PR Template**
   ```markdown
   ## Description
   Briefly describe the changes

   ## Type of Change
   - [ ] Bug fix
   - [ ] New feature
   - [ ] Breaking change
   - [ ] Documentation update

   ## Checklist
   - [ ] My code follows the style guidelines
   - [ ] I have performed a self-review
   - [ ] I have commented my code
   - [ ] I have updated documentation
   - [ ] My changes generate no new warnings
   - [ ] I have added tests
   - [ ] All tests pass

   ## Screenshots (if applicable)
   ```

3. **Link Related Issues**
   ```
   Closes #123
   Fixes #456
   ```

4. **Request Review**
   - Tag relevant team members
   - Add appropriate labels

### **PR Review Process**
1. **Automated Checks**
   - CI/CD pipeline runs tests
   - Code coverage is calculated
   - Linter checks pass

2. **Manual Review**
   - At least one maintainer reviews
   - Feedback is provided within 48 hours
   - Changes may be requested

3. **Approval & Merge**
   - PR approved by maintainer
   - Squash and merge with descriptive message
   - Delete feature branch

---

## 🐛 **Issue Guidelines**

### **Reporting Bugs**
Use the bug report template:
```markdown
## Bug Description
Clear description of the bug

## Steps to Reproduce
1. Go to '...'
2. Click on '...'
3. Scroll down to '...'
4. See error

## Expected Behavior
What should happen

## Actual Behavior
What actually happens

## Screenshots
If applicable

## Environment
- OS: [e.g., Windows 10]
- Browser: [e.g., Chrome 120]
- Version: [e.g., 1.2.0]

## Additional Context
Any other relevant information
```

### **Bug Triage**
| Label | Description |
|-------|-------------|
| `bug` | Confirmed bug |
| `needs-repro` | Needs reproduction steps |
| `good-first-issue` | Good for new contributors |
| `help-wanted` | Community help needed |
| `priority-high` | Critical bug |

---

## ✨ **Feature Requests**

### **Submitting Features**
```markdown
## Problem Statement
What problem does this solve?

## Proposed Solution
How should it work?

## Alternatives Considered
Other approaches considered

## Additional Context
Screenshots, mockups, or references
```

### **Feature Approval Process**
1. **Discussion Phase**
   - Community feedback gathered
   - Technical feasibility assessed

2. **Design Phase**
   - UI/UX design created
   - API changes documented

3. **Implementation Phase**
   - Assigned to contributor
   - Development and testing

4. **Release Phase**
   - Documentation updated
   - Feature announced

---

## 🧪 **Testing**

### **Test Structure**
```typescript
// Example test file
import { render, screen, fireEvent } from '@testing-library/react';
import { CodeEditor } from '../components/Editor';

describe('CodeEditor', () => {
  test('renders with initial value', () => {
    render(<CodeEditor initialValue="console.log('test')" />);
    expect(screen.getByRole('textbox')).toHaveValue("console.log('test')");
  });

  test('calls onChange when code changes', () => {
    const handleChange = jest.fn();
    render(<CodeEditor onChange={handleChange} />);
    
    fireEvent.change(screen.getByRole('textbox'), {
      target: { value: 'new code' }
    });
    
    expect(handleChange).toHaveBeenCalledWith('new code');
  });
});
```

### **Testing Requirements**
- Unit tests for services and utilities
- Component tests for React components
- Integration tests for critical workflows
- Minimum 80% code coverage for new features

### **Running Tests**
```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

---

## 📚 **Documentation**

### **Documentation Types**
1. **Code Documentation**
   - JSDoc comments for functions
   - Component prop documentation
   - Complex algorithm explanations

2. **User Documentation**
   - README updates
   - Wiki pages
   - API documentation

3. **Developer Documentation**
   - Setup instructions
   - Architecture decisions
   - Contribution guidelines

### **Updating Documentation**
When making changes:
1. Update relevant `.md` files
2. Update TypeScript type definitions
3. Update component prop comments
4. Add or update examples

---

## 🌐 **Community**

### **Communication Channels**
- **GitHub Issues**: Bug reports and feature requests
- **GitHub Discussions**: Questions and ideas
- **Pull Requests**: Code contributions

### **Getting Help**
1. Check the [README](README.md)
2. Search existing issues
3. Ask in Discussions
4. Create a well-documented issue

### **Recognition**
Contributors are recognized in:
- GitHub contributors list
- Release notes
- Project documentation

---

## 🏆 **Good First Issues**

Look for issues labeled with:
- `good-first-issue`: Simple tasks for beginners
- `help-wanted`: Needs community assistance
- `documentation`: Documentation improvements

**Example First Issues:**
- Fix typos in documentation
- Add missing TypeScript types
- Improve test coverage
- Add accessibility attributes

---

## 📦 **Release Process**

### **Versioning**
We follow [Semantic Versioning](https://semver.org/):
- **MAJOR**: Breaking changes
- **MINOR**: New features (backward compatible)
- **PATCH**: Bug fixes

### **Release Checklist**
- [ ] All tests pass
- [ ] Documentation updated
- [ ] Changelog updated
- [ ] Version bumped
- [ ] Release notes prepared
- [ ] Tag created

---

## 🔒 **Security**

### **Reporting Security Issues**
**DO NOT** report security vulnerabilities through public issues. Instead, email [landecs.org@gmail.com] with:
- Description of the vulnerability
- Steps to reproduce
- Potential impact
- Suggested fix (if known)

### **Security Best Practices**
- Never commit secrets or API keys
- Validate all user input
- Use HTTPS for all connections
- Keep dependencies updated
- Regular security audits

---

## 📄 **License**

By contributing to TriLan C#, you agree that your contributions will be licensed under the project's [MIT License](LICENSE).

---

## 🙌 **Acknowledgments**

Special thanks to all our contributors! Your efforts make TriLan C# better for everyone.

### **Maintainers**
- [@EldrexDelosReyesBula](https://github.com/EldrexDelosReyesBula)

### **Contributors**
[![Contributors](https://contrib.rocks/image?repo=EldrexDelosReyesBula/TriLan-Csharp)](https://github.com/EldrexDelosReyesBula/TriLan-Csharp/graphs/contributors)

---

## 📬 **Contact**

- **Issues**: [GitHub Issues](https://github.com/EldrexDelosReyesBula/TriLan-Csharp/issues)
- **Discussions**: [GitHub Discussions](https://github.com/EldrexDelosReyesBula/TriLan-Csharp/discussions)
- **Website**: [LanDecs](https://www.landecs.org)

---

**Happy Coding!** 🎉  
*Together, we're making C# education accessible to everyone.*

---

<div align="center">

*Last Updated: $(Get-Date -Format "MMMM dd, yyyy")* 
*TriLan C# Contribution Guidelines v1.0*

</div>
