# Task Board

### Features

- Manage tasks in TODO.md - a plain text markdown file.
- The syntax is compatible with [Github Markdown](https://github.github.com/gfm/#task-list-items-extension-)
- TODO.md file is portable and can be committed with Pull Requests (PRs) to git repositories.

### TODO.md

- Task Board is a bit strict about TODO.md syntax.

  - Please follow the typical structure like in the example so it can work properly. If it fails to open, please revert or re-generate your TODO.md file to make it work again.
  - There are "2 spaces" at the end of every task to show as line breaks on Github pages. (Otherwise, Github will render tasks next to each other on the same line)
  - Done-column name must have "✓" or "[x]" in the name.

- For now, after making changes to TODO.md file, please re-open the Task Board to loads those changes.

Example of TODO.md:

```
# Project Name

Project Description

### Todo

- [ ] Task 1

### In Progress

- [ ] Task 2

### Done ✓

- [x] Complete Task
```

### Settings

- Multiple TODO files:
  - In your settings.json file, add this: `"coddx.taskBoard.fileList": "TODO.md, folder/TODO-name.md"` (comma separated, use your file names)
