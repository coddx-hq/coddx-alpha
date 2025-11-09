import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';

import { IConfig, ICommand, CommandAction } from './app/model';
import { deepFind, VER } from './app/Utils';

export default class ViewLoader {
  private readonly _panel: vscode.WebviewPanel | undefined;
  private readonly _extensionPath: string = '';
  private _disposables: vscode.Disposable[] = [];

  constructor(extensionPath: string, uri: vscode.Uri) {
    this._extensionPath = extensionPath;
    const column = vscode.window.activeTextEditor
      ? vscode.ViewColumn.Two // vscode.window.activeTextEditor.viewColumn
      : undefined;

    // let config = this.getFileContent();
    // if (config) {
    this._panel = vscode.window.createWebviewPanel(
      'configView',
      'Coddx - Generate Files',
      column || vscode.ViewColumn.Two,
      {
        enableScripts: true,
        localResourceRoots: [vscode.Uri.file(path.join(extensionPath, 'configViewer'))]
      }
    );

    // get base path (from the user's workspace path):
    const rootPath = deepFind(vscode, 'workspace.workspaceFolders[0].uri.fsPath', '') + '/';
    const templateFilePath = rootPath + '/.coddx-template';
    let basePath = ''; // relative

    if (uri && uri.fsPath) {
      // path from Context Menu
      basePath = uri.fsPath.replace(rootPath, ''); // get relative path
    }
    // if (uri.fsPath) {
    //   basePath = uri.fsPath;
    // } else if (vscode.workspace.workspaceFolders) {
    //   basePath = vscode.workspace.workspaceFolders[0].uri.fsPath;
    // }

    // load template file:
    // const filePath = '/Users/duc/Documents/downloads/coddx-ext/.coddx-template';
    const fileUri = vscode.Uri.file(templateFilePath);
    const templateString = this.getFileContent(fileUri);

    this._panel.webview.html = this.getWebviewContent(basePath, templateString || '');

    this._panel.webview.onDidReceiveMessage(
      (command: ICommand) => {
        switch (command.action) {
          case CommandAction.Save:
            const fileUri = vscode.Uri.file(templateFilePath);

            this.saveFileContent(fileUri, command.content);
            return;
          case CommandAction.GenerateFiles:
            this.generateFiles(command.content);
            return;
        }
      },
      undefined,
      this._disposables
    );
    // }
  }

  // constructor(fileUri: vscode.Uri, extensionPath: string) {
  //   this._extensionPath = extensionPath;

  //   const column = vscode.window.activeTextEditor
  // 		? vscode.ViewColumn.Two // vscode.window.activeTextEditor.viewColumn
  // 		: undefined;

  //   let config = this.getFileContent(fileUri);
  //   if (config) {
  //     this._panel = vscode.window.createWebviewPanel(
  //       "configView",
  //       "Config View",
  //       column || vscode.ViewColumn.Two,
  //       {
  //         enableScripts: true,

  //         localResourceRoots: [
  //           vscode.Uri.file(path.join(extensionPath, "configViewer"))
  //         ]
  //       }
  //     );

  //     this._panel.webview.html = this.getWebviewContent(config);

  //     this._panel.webview.onDidReceiveMessage(
  //       (command: ICommand) => {
  //         switch (command.action) {
  //           case CommandAction.Save:
  //             this.saveFileContent(fileUri, command.content);
  //             return;
  //         }
  //       },
  //       undefined,
  //       this._disposables
  //     );
  //   }
  // }

  private getWebviewContent(basePath: string, templateString: string): string {
    // Local path to main script run in the webview
    const reactAppPathOnDisk = vscode.Uri.file(path.join(this._extensionPath, 'configViewer', 'configViewer.js'));
    const reactAppUri = this._panel!.webview.asWebviewUri(reactAppPathOnDisk);

    // const configJson = JSON.stringify(config);

    return `<!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Coddx - Generate Files</title>

        <meta http-equiv="Content-Security-Policy"
                    content="default-src 'none';
                             img-src https:;
                             script-src 'unsafe-eval' 'unsafe-inline' ${this._panel!.webview.cspSource};
                             style-src ${this._panel!.webview.cspSource} 'unsafe-inline';">

        <script>
          window.acquireVsCodeApi = acquireVsCodeApi;
          window.initialData = { path: ${JSON.stringify(basePath)}, templateString: ${JSON.stringify(templateString)} };
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

  private saveFileContent(fileUri: vscode.Uri, config: IConfig) {
    // if (fs.existsSync(fileUri.fsPath)) {}
    fs.writeFileSync(fileUri.fsPath, config.description || '');

    vscode.window.showInformationMessage(`👍 Template saved to .coddx-template`);
  }

  private mkDirByPathSync(targetDir: string, { baseDir = '', isRelativeToScript = false } = {}) {
    const sep = path.sep;
    const initDir = path.isAbsolute(targetDir) ? sep : '';
    // const baseDir = isRelativeToScript ? __dirname : '.';

    return targetDir.split(sep).reduce((parentDir, childDir) => {
      const curDir = path.resolve(baseDir, parentDir, childDir);
      try {
        fs.mkdirSync(curDir);
      } catch (err) {
        if (err.code === 'EEXIST') {
          // curDir already exists!
          return curDir;
        }

        // To avoid `EISDIR` error on Mac and `EACCES`-->`ENOENT` and `EPERM` on Windows.
        if (err.code === 'ENOENT') {
          // Throw the original parentDir error on curDir `ENOENT` failure.
          throw new Error(`EACCES: permission denied, mkdir '${parentDir}'`);
        }

        const caughtErr = ['EACCES', 'EPERM', 'EISDIR'].indexOf(err.code) > -1;
        if (!caughtErr || (caughtErr && curDir === path.resolve(targetDir))) {
          throw err; // Throw if it's just the last created dir.
        }
      }

      return curDir;
    }, initDir);
  }

  private generateFiles(config: IConfig) {
    const { path, files } = JSON.parse(config.description || '');
    let counter = 0;
    const rootPath = deepFind(vscode, 'workspace.workspaceFolders[0].uri.fsPath', '') + '/';

    if (!fs.existsSync(rootPath + path)) {
      this.mkDirByPathSync(path, { baseDir: rootPath });
    }

    Object.keys(files).forEach(itemKey => {
      const item = files[itemKey];

      if (item.checked === true) {
        const fileName = item.fileName; // itemKey.trim()
        const filePath = rootPath + (path + '/' + fileName).trim();

        if (fileName.indexOf('/') > 0) {
          // create directories, e.g. __test__/mocks
          const dirPath = fileName.substr(0, fileName.lastIndexOf('/'));
          this.mkDirByPathSync(dirPath, { baseDir: rootPath + path });
        }

        const fileUri = vscode.Uri.file(filePath);
        fs.writeFileSync(fileUri.fsPath, item.fileContent);
        counter++;
      }
    });

    vscode.window.showInformationMessage(`👍 ${counter} files generated.`);
  }
}
