// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
// import { telemetry } from './view/app/Utils';

import ViewLoader from './view/ViewLoader';
import TaskBoardLoader from './view/TaskBoardLoader';

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
  // Use the console to output diagnostic information (console.log) and errors (console.error)
  // This line of code will only be executed once when your extension is activated
  // console.log('Congratulations, your extension "vscode-react" is now active!');
  // context.subscriptions.push(telemetry);

  // The command has been defined in the package.json file
  // Now provide the implementation of the command with registerCommand
  // The commandId parameter must match the command field in package.json
  let disposable = vscode.commands.registerCommand('extension.viewconfig', (uri: vscode.Uri) => {
    // let openDialogOptions: vscode.OpenDialogOptions = {
    //   canSelectFiles: true,
    //   canSelectFolders: false,
    //   canSelectMany: false,
    //   filters: {
    //     Json: ["json"]
    //   }
    // };

    // vscode.window
    //   .showOpenDialog(openDialogOptions)
    //   .then(async (uri: vscode.Uri[] | undefined) => {
    //     if (uri && uri.length > 0) {
    //       const view = new ViewLoader(uri[0], context.extensionPath);
    //     } else {
    //       vscode.window.showErrorMessage("No valid file selected!");
    //       return;
    //     }
    //   });
    const view = new ViewLoader(context.extensionPath, uri);
    // telemetry.sendTelemetryEvent('init-file-generator');
    return view;
  });
  context.subscriptions.push(disposable);

  let taskBoardCmd = vscode.commands.registerCommand('extension.taskboard', (uri: vscode.Uri) => {
    const view = new TaskBoardLoader(context.extensionPath, uri);
    // telemetry.sendTelemetryEvent('init-task-board');
    return view;
  });
  context.subscriptions.push(taskBoardCmd);
}

// this method is called when your extension is deactivated
export function deactivate() {
  // telemetry.dispose();
}
