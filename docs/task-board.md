# Task Board

### Features

- Manage tasks in TODO.md - a plain text markdown file.
- The syntax is compatible with [Github Markdown](https://bit.ly/2wBp1Mk)
- TODO.md file is portable and can be committed with Pull Requests (PRs) to git repositories.
- Support custom file name, multiple task lists.
- Checkboxes are optional (if your task titles don't have them).

### TODO.md

[TODO.md format](https://github.com/todomd/todo.md)

- Task Board is a bit strict about TODO.md format.

  - Please follow the typical structure like in the example so it can work properly. If it fails to open, please revert or re-generate your TODO.md file to make it work again.

- For now, after making changes to TODO.md file, please click the Refresh icon (next to the board title) to reload.

[Example of TODO.md](https://github.com/todomd/todo.md/blob/master/TODO.md)

### Settings

- Multiple TODO files:
  - In your workspace settings.json file, add this: `"coddx.taskBoard.fileList": "TODO.md, folder/TODO-name.md"` (comma separated, use your file names)

### Tips & Tricks

- In the task title:
  - You can type `#bug` or `#feat` to classify your task.
  - You can type a name like `@john`, `@jane`.
  - Date format can be yyyy-mm-dd
- Use the Search Box to filter for types, names, etc.
