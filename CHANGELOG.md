# Change Log

## [0.4.2] - 2025-11-09

### Features

- Added support for H4 headings (`####`) as sub-sections within Kanban columns
- Added GitHub workflows for automated CI/CD and dependency management

### Improvements

- Enhanced TODO.md parser to handle heading hierarchy correctly
- H4 headings now display as bold tasks under their parent H3 column instead of creating separate columns
- Organized project TODO.md by release versions using git history

### Development

- Added CI workflow for automated building and testing
- Added release workflow for automated VSIX packaging and GitHub releases

## [0.4.1] - 2025-11-09

### Dependencies

- Migrated from deprecated `react-beautiful-dnd` to modern `@dnd-kit` for drag-and-drop functionality
- Replaced render props pattern with React hooks (`useSortable`)

### Improvements

- Switched from yarn to npm as package manager
- Removed unused dependencies (react-redux, redux, css-box-model, etc.)
- Updated to use modern React hooks pattern throughout drag-and-drop components
- Added `esModuleInterop` to TypeScript config for better ES module compatibility

### Removed

- Removed `react-beautiful-dnd` (deprecated since 2022)
- Removed `yarn.lock` in favor of `package-lock.json`

## [0.4.0] - 2025-11-09

### Dependencies

- Updated all major build tools and dependencies
- Replaced deprecated `vscode` package with `@types/vscode` 1.70.0
- Modernized test runner from deprecated `vscode/lib/testrunner` to Mocha-based setup

### Security Fixes

- Fixed template literal XSS vulnerability in webview data injection (now using JSON.stringify())
- Updated VS Code webview API from deprecated `vscode-resource:` scheme to modern `asWebviewUri()`
- Updated Content Security Policy to use `webview.cspSource`

### Bug Fixes

- **Critical**: Fixed backtick rendering bug in Task Board webview that prevented TODO.md files with code blocks from displaying correctly

### Removed

- Removed deprecated `tslint` package (no longer maintained)
- Removed deprecated `vscode` package
- Removed `@types/marked` (no longer needed)

## [0.3.0] - 2021-05-24

- Task title supports markdown now for styling, hyperlinks, simple html or even img tags.
- New Task Action: move a task to the column on the right.

## [0.2.27] - 2020-03-28

- Task Board - support multiple task lists defined in user's settings.json.
- Task Board - refresh button to reload file content.
- Task Board - checkbox is now optional (if task title doesn't have it).
- Task Board - support sub-task (task title starts with 2-space indentation).
- Task Board - task menu for: toggling sub-task; inserting emojis;
- Task Board - respect theme colors.

## [0.2.12] - 2020-03-21

- Task Board - search box
- Task Board - autofocus when creating a new task.
- Task Board - checkmark to mark a task as complete.
- Task Board Doc

## [0.2.3] - 2020-03-15

- Task Board - manage tasks and save them as TODO.md - a simple plain text file. The syntax is compatible with [Github Markdown](https://bit.ly/2wBp1Mk)

## [0.1.4] - 2020-03-10

- Output can be edited before generating files.

## [0.1.3]

- Initial release
- Follow this format - Check [Keep a Changelog](http://keepachangelog.com/) for recommendations on how to structure this file.
