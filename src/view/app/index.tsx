import * as React from 'react';
import * as ReactDOM from 'react-dom';

import './index.css';
import { IConfig } from './model';
// import Config from "./config";

import MainView from './components/CodeGen/MainView';
import TaskBoard from './components/TaskBoard/TaskBoard';

declare global {
  interface Window {
    acquireVsCodeApi(): any;
    initialData: IConfig;
  }
}

const vscode = window.acquireVsCodeApi();

if (window.initialData.name === 'TaskBoard') {
  ReactDOM.render(
    <TaskBoard vscode={vscode} initialData={window.initialData} />,
    document.getElementById('root')
  );
} else {
  ReactDOM.render(
    <MainView vscode={vscode} initialData={window.initialData} />,
    document.getElementById('root')
  );
}
