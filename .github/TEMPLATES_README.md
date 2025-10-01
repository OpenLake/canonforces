# 📋 CanonForces Templates & Review Workflow

This document outlines the improved PR and Issue templates with review workflow implemented for CanonForces.

## 🎯 Overview

We've enhanced our GitHub templates to:
- ✅ Ensure contributors provide complete context (what/why/how)
- ✅ Encourage screenshots/demos for UI changes
- ✅ Standardize review requests with automatic maintainer assignment
- ✅ Save time during reviews by making PRs & issues self-explanatory

## 📦 Pull Request Template

**Location:** `.github/pull_request_template.md`

### Key Improvements:
- **Why This Change?** section to help reviewers understand intent
- **Screenshots/Loom video** section for UI changes
- **Comprehensive checklist** covering tests, docs, linting, and review requests
- **Reviewers mention** section with automatic CODEOWNERS integration
- **Deployment notes** for special considerations

### Sections:
1. 📌 Related Issue
2. ✨ Changes Introduced
3. 🤔 Why This Change?
4. 🖼️ Screenshots / Loom Video
5. 🧪 Testing
6. 📝 Documentation Updates
7. ✅ Checklist
8. 👥 Reviewers
9. 🚀 Deployment Notes
10. 💬 Community & Support

## 🐛 Issue Templates

**Location:** `.github/ISSUE_TEMPLATE/`

### Available Templates:

#### 1. Bug Report (`bug_report.md`)
- Enhanced environment details (browser version, screen resolution)
- Frequency & impact assessment
- Priority assessment checkboxes
- Better evidence collection (screenshots, console errors, network logs)

#### 2. Feature Request (`feature_request.md`)
- Structured problem statement
- Impact assessment with success metrics
- Implementation considerations
- Competitive analysis section

#### 3. Documentation (`documentation.md`) - **NEW**
- Specific documentation issue types
- Target audience identification
- Impact assessment for documentation gaps
- Willingness to contribute section

#### 4. Style Enhancement (`style_enhancement.md`)
- Enhanced with design system alignment
- Accessibility considerations
- Implementation details
- Technical constraints

## 👥 Review Workflow

### CODEOWNERS File
**Location:** `.github/CODEOWNERS`

Automatically assigns reviewers based on file paths:
- **Global owners:** @aviralsaxena16 @Jagath-P (all PRs)
- **Frontend components:** Automatic assignment for `/src/pages/`, `/src/common/`, etc.
- **Configuration files:** Automatic assignment for `package.json`, config files
- **Documentation:** Automatic assignment for all `.md` files
- **GitHub templates:** Automatic assignment for `/.github/` changes

### Issue Template Configuration
**Location:** `.github/ISSUE_TEMPLATE/config.yml`

Provides helpful contact links:
- 💬 Discord Community
- 📚 Documentation
- 🐛 Known Issues

## 🚀 Benefits

### For Contributors:
- Clear guidance on what information to provide
- Reduced back-and-forth with maintainers
- Faster PR approval process

### For Maintainers:
- Self-explanatory PRs and issues
- Automatic reviewer assignment
- Consistent information collection
- Reduced review time

### For the Project:
- Better issue tracking and prioritization
- Improved documentation coverage
- Higher quality contributions
- Better user experience

## 📝 Usage Guidelines

### Creating a PR:
1. Use the template to provide complete context
2. Include screenshots for UI changes
3. Explain the "why" behind your changes
4. Complete all relevant checklist items
5. Tag appropriate reviewers if needed

### Creating an Issue:
1. Choose the appropriate template
2. Fill out all relevant sections
3. Provide as much detail as possible
4. Include screenshots/evidence where applicable
5. Assess priority and impact

## 🔧 Maintenance

The templates should be updated when:
- New project requirements emerge
- Review process changes
- New team members join
- Project structure evolves

## 📞 Support

For questions about the templates or review process:
- Join our Discord: [CanonForces Discord](https://discord.gg/4YnYtVeF)
- Create an issue using the Documentation template
- Contact maintainers: @aviralsaxena16 @Jagath-P
