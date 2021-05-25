# Todo Kanban Board

Todo Kanban Board manages tasks and save them as [TODO.md](https://bit.ly/2JdEuET) - a simple plain text file.

## Features

- The syntax is compatible with [Github Markdown](https://bit.ly/2wBp1Mk)
- TODO.md file is portable and can be committed with Pull Requests (PRs) to git repositories.
- Support custom file name, multiple task lists.
- Checkboxes are optional (if your task titles don't have them).
- Task title can also have markdown for styling, hyperlinks, simple html or even img tags.
- Task menu: to insert a sub-task, emoji icons (like bug 🐞 blocked ❌ party 🎉 etc.).
- See also: <a href="https://bit.ly/2SfcKaH">Documentation / Guides</a>

## TODO.md

- Tasks are synced to the markdown file using [TODO.md format](https://bit.ly/2JdEuET).
- Task Board is a bit strict about the format.

  - Please follow the typical structure like in the example so it can work properly. If it fails to open, please revert or re-generate your TODO.md file to make it work again.

- For now, after making changes to TODO.md file, please click the Refresh icon (next to the board title) to reload.

- [Example of a TODO.md file](https://github.com/todomd/todo.md/blob/master/TODO.md)

## Settings

- Multiple TODO files:
  - In your workspace settings.json file, add this: `"coddx.taskBoard.fileList": "TODO.md, folder/TODO-name.md"` (comma separated, use your file names)

## Tips & Tricks

- In the task title:
  - You can type `#bug` or `#feat` to classify your task.
  - You can type a name like `@john`, `@jane`.
  - Date format can be yyyy-mm-dd
- Use the Search Box to filter for types, names, etc.
