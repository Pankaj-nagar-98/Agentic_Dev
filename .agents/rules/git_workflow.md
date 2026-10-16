# Autonomous Development & Git Repository Maintenance Guidelines

## 1. Autonomous Planning & Execution
- Autonomously plan, architect, implement, test, and verify features without requiring repetitive confirmation on standard steps.
- Run builds (`npm run build`), linting (`npm run lint`), and visual verifications to ensure code quality before finalizing tasks.

## 2. Continuous Git Maintenance
- **Proactive Commits**: After completing any task, feature, bugfix, or refactor, automatically stage files and create clean, descriptive commits following conventional commit standards.
- **Pushing Updates**: Always push commits to the remote tracking branch (`origin main` or working branch) so the remote repository (`https://github.com/Pankaj-nagar-98/Agentic_Dev`) stays continuously up to date.
- **Repository Cleanliness**: Ensure temporary artifacts, logs, and build directories (`node_modules`, `dist`, `.cache`) are properly ignored in `.gitignore`.
- **Integrity**: Never leave unstaged or uncommitted working files at the end of a completed task.
