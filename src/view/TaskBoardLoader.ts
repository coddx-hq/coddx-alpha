import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';

import { IConfig, ICommand, CommandAction } from './app/model';
import { deepFind, VER } from './app/Utils';

let __panel = null;
let selectedFile = '';

export default class ViewLoader {
  private readonly _panel: vscode.WebviewPanel | undefined;
  private readonly _extensionPath: string = '';
  private _disposables: vscode.Disposable[] = [];

  constructor(extensionPath: string, uri: vscode.Uri) {
    // load "coddx.taskBoard.fileList" from config (settings):
    const configuration = vscode.workspace.getConfiguration();
    const fileList: string = configuration.get('coddx.taskBoard.fileList') || 'TODO.md';
    const filesArr = fileList.split(',').map(str => str.trim());
    selectedFile = filesArr[0];

    this._extensionPath = extensionPath;
    const column = vscode.window.activeTextEditor
      ? vscode.ViewColumn.Two // vscode.window.activeTextEditor.viewColumn  vscode.ViewColumn.Two
      : undefined;

    // let config = this.getFileContent();
    // if (config) {
    this._panel = vscode.window.createWebviewPanel('configView', 'Task Board', column || vscode.ViewColumn.Two, {
      enableScripts: true,
      localResourceRoots: [vscode.Uri.file(path.join(extensionPath, 'configViewer'))]
    });

    // get base path (from the user's workspace path):
    const rootPath = deepFind(vscode, 'workspace.workspaceFolders[0].uri.fsPath', '') + '/';
    // const templateFilePath = rootPath + '/TODO.md';
    let basePath = ''; // relative

    if (uri && uri.fsPath) {
      // path from Context Menu
      basePath = uri.fsPath.replace(rootPath, ''); // get relative path
    }

    // const fileUri = vscode.Uri.file(templateFilePath);
    const todoStr = ''; // this.getFileContent(fileUri);

    this._panel.webview.html = this.getWebviewContent({
      basePath,
      templateString: todoStr || '',
      fileList,
      selectedFile,
      rootPath
    });
    __panel = this._panel;

    this._panel.webview.onDidReceiveMessage(
      (command: ICommand) => {
        switch (command.action) {
          case CommandAction.ShowMessage:
            vscode.window.showInformationMessage(command.content.description);
            return;
          case CommandAction.OpenFile:
            const rootPath2 = deepFind(vscode, 'workspace.workspaceFolders[0].uri.fsPath', '') + '/';
            const filePath2 = rootPath2 + (selectedFile || 'TODO.md');
            vscode.window.showTextDocument(vscode.Uri.file(filePath2));
            return;
          case CommandAction.Save:
            this.saveFileContent(command.content);
            return;
          case CommandAction.Load:
            selectedFile = command.content.description || 'TODO.md';
            const rootPath3 = deepFind(vscode, 'workspace.workspaceFolders[0].uri.fsPath', '') + '/';
            const filePath3 = rootPath3 + selectedFile;
            const fileUri = vscode.Uri.file(filePath3);
            const todoStr = this.getFileContent(fileUri);
            this._panel.webview.html = this.getWebviewContent({
              basePath,
              templateString: todoStr || '',
              fileList,
              selectedFile,
              rootPath
            });
            // __panel.webview.postMessage({ command: 'load', content }); // Doesn't work ???
            return;
          // case CommandAction.GetListFiles:
          // load config (settings)
          // vscode.window.showInformationMessage(`👍 Config:`, JSON.stringify(filesArr));

          // WORKS!
          // const workspace = vscode.workspace.workspaceFolders[0];
          // if (workspace) {
          //   vscode.workspace
          //     .findFiles(new vscode.RelativePattern(workspace, '**/*/TODO.md'), '**/node_modules/**')
          //     .then(results => {
          //       console.log('results: ', results);
          //     });
          // }
          // return;
        }
      },
      undefined,
      this._disposables
    );
    // }
  }

  private getWebviewContent({ basePath, templateString, fileList, selectedFile, rootPath }): string {
    // Local path to main script run in the webview
    const reactAppPathOnDisk = vscode.Uri.file(path.join(this._extensionPath, 'configViewer', 'configViewer.js'));
    const reactAppUri = this._panel!.webview.asWebviewUri(reactAppPathOnDisk);

    // const configJson = JSON.stringify(config);
    const fullPath = deepFind(vscode, 'workspace.workspaceFolders[0].uri.fsPath', '') + `/${selectedFile}`;
    // rootPathBase64 = toBase64(rootPathBase64);

    return `<!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Task Board</title>

        <meta http-equiv="Content-Security-Policy"
                    content="default-src 'none';
                             img-src https:;
                             script-src 'unsafe-eval' 'unsafe-inline' ${this._panel!.webview.cspSource};
                             style-src ${this._panel!.webview.cspSource} 'unsafe-inline';">
        <script>
          window.acquireVsCodeApi = acquireVsCodeApi;
          window.initialData = { name: 'TaskBoard', path: ${JSON.stringify(basePath)}, dataString: ${JSON.stringify(templateString)}, fileList: ${JSON.stringify(fileList)}, selectedFile: ${JSON.stringify(selectedFile)} };
        </script>
    </head>
    <body>
        <div id="root"></div>

        <script src="${reactAppUri}"></script>
    </body>
    </html>`;
  }

  private getFileContent(fileUri: vscode.Uri) {
    //: IConfig | undefined {
    if (fs.existsSync(fileUri.fsPath)) {
      let content = fs.readFileSync(fileUri.fsPath, 'utf8');
      // let config: IConfig = JSON.parse(content);

      // return config;
      return content;
    }
    return undefined;
  }

  private saveFileContent(config: IConfig) {
    const content = config.description;
    const rootPath = deepFind(vscode, 'workspace.workspaceFolders[0].uri.fsPath', '') + '/';
    const filePath = rootPath + (selectedFile || 'TODO.md');

    const uri = vscode.Uri.file(filePath);
    fs.writeFileSync(uri.fsPath, content);

    // vscode.window.showInformationMessage(`👍 TODO.md saved!`);
  }
}
