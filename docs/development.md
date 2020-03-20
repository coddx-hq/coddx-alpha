# coddx

### Development

- Press Cmd+Shift+P, Run in Debug mode.
- From the Host window, press Cmd+Shift+P and type in "command category name" (in package.json) to run it.
- It should "live reload" when making changes to "webview files" (MainView.tsx, css files, etc.)

NOTES:
- if making changes to non-webview files (like ViewLoader.ts, extension.ts), click "Restart Debugging" to re-launch the Host window.

### Publish

Run:
```
$ vsce login coddx
$ vsce publish
```
