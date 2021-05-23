import * as React from 'react';
import styled from 'styled-components';
import { CommandAction } from '../../model';
import { sendCommand, getVscodeHelper } from '../../Utils';
import { DragDropContext, Droppable } from 'react-beautiful-dnd';
import { parseMarkdown, defaultDataString, getMarkdown } from './Helpers';

import { TaskInterface } from './Task';
import TaskColumn, { ColumnInterface } from './TaskColumn';
import ButtonBar from './ButtonBar';

// import '@atlaskit/css-reset';
import '../../index.css';
import './TaskBoard.css';
const { useState } = React;

const Columns = styled.div`
  display: flex;
`;

const selectedFile = (window && window['initialData'] ? window['initialData']['selectedFile'] : '') || 'TODO.md';
const fileArray = (window && window['initialData'] ? window['initialData']['fileList'] : 'TODO.md')
  .split(',')
  .map(str => str.trim());
const dataString = (window && window['initialData'] ? window['initialData']['dataString'] : '') || defaultDataString;
let data = parseMarkdown(dataString);

export default function TaskBoard({ vscode, initialData }) {
  const [state, setState] = useState(data);
  const vscodeHelper = getVscodeHelper(vscode);

  const reloadFile = () => sendCommand(vscode, CommandAction.Load, selectedFile);

  React.useEffect(() => {
    reloadFile();
  }, []);

  const updateStateAndSave = newState => {
    setState(newState);
    vscodeHelper.saveList(getMarkdown(newState));
  };

  // const [msg, setMsg] = useState('');
  // window.addEventListener('message', event => {
  //   setMsg(JSON.stringify(event));
  //   // const message = event.data; // The JSON data our extension sent
  //   // switch (message.command) {
  //   //     case 'load':
  //   //       break;
  //   // }
  // });
  return (
    <div>
      <ButtonBar
        vscodeHelper={vscodeHelper}
        fileArray={fileArray}
        selectedFile={selectedFile}
        data={state}
        onLoadData={newData => {
          data = newData;
          setState(newData);
        }}
        onSave={dataStr => {
          vscodeHelper.saveList(dataStr);
        }}
        onRefresh={() => reloadFile()}
        onOpenFile={() => sendCommand(vscode, CommandAction.OpenFile, '')}
        onSearch={searchTerm => {
          const searchTermStr = searchTerm.toLowerCase();
          // console.log('search: ', searchTerm);
          const newState = { ...state };
          Object.keys(newState.tasks).forEach(taskId => {
            const t = newState.tasks[taskId];
            newState.tasks[taskId].matched = t.content.toLowerCase().indexOf(searchTermStr) >= 0;
          });
          updateStateAndSave(newState);
        }}
        onSelectFile={selectedOpt => {
          sendCommand(vscode, CommandAction.Load, selectedOpt.value);
        }}
      />
      <DragDropContext
        onDragEnd={({ destination, source, draggableId, type }) => {
          if (!destination) {
            return;
          }
          if (destination.droppableId === source.droppableId && destination.index === source.index) {
            return;
          }

          if (type === 'column') {
            const newColOrd = Array.from(state.columnOrder);
            newColOrd.splice(source.index, 1);
            newColOrd.splice(destination.index, 0, draggableId);

            const newState = {
              ...state,
              columnOrder: newColOrd
            };
            updateStateAndSave(newState);
            return;
          }

          const startcol = state.columns[source.droppableId];
          const endcol = state.columns[destination.droppableId];

          // console.log("startcol", startcol);
          // if (!startcol) {
          //   return;
          // }

          if (startcol === endcol) {
            const tasks = Array.from(startcol.taskIds);
            tasks.splice(source.index, 1);
            tasks.splice(destination.index, 0, draggableId);

            const newCol = {
              ...startcol,
              taskIds: tasks
            };

            const newState = {
              ...state,
              columns: {
                ...state.columns,
                [newCol.id]: newCol
              }
            };

            // setState(newState);
            updateStateAndSave(newState);
            return;
          }
          const startTaskIds = Array.from(startcol.taskIds);
          startTaskIds.splice(source.index, 1);
          const newStart = {
            ...startcol,
            taskIds: startTaskIds
          };
          const endTaskIds = Array.from(endcol.taskIds);
          endTaskIds.splice(destination.index, 0, draggableId);
          const newEnd = {
            ...endcol,
            taskIds: endTaskIds
          };
          const newState = {
            ...state,
            columns: {
              ...state.columns,
              [newStart.id]: newStart,
              [newEnd.id]: newEnd
            },
            tasks: data.tasks
          };
          // setState(newState);
          updateStateAndSave(newState);
          // loadData(vscode, getMarkdown(newState)) // reload data to make sure it's reliable.
        }}
      >
        <Droppable droppableId="columns" direction="horizontal" type="column">
          {provided => (
            <Columns {...provided.droppableProps} ref={provided.innerRef}>
              {state.columnOrder.map((id, idx) => {
                const col = state.columns[id];
                if (idx === Object.keys(state.columns).length - 1) {
                  col.isLast = true;
                } else {
                  col.isLast = false;
                }
                const tasks = col.taskIds.map(taskid => state.tasks[taskid]);
                return (
                  <TaskColumn
                    key={id}
                    column={col}
                    columnIndex={idx}
                    tasks={tasks}
                    onChangeTask={(id: string, newTask: TaskInterface) => {
                      tasks[id] = newTask;
                      const newState = {
                        ...state,
                        tasks: data.tasks
                      };
                      updateStateAndSave(newState);
                    }}
                    onDeleteTask={(task: TaskInterface, column: ColumnInterface) => {
                      const newState = { ...state };
                      delete newState.tasks[task.id];
                      newState.columns[column.id].taskIds = newState.columns[column.id].taskIds.filter(
                        (taskId: string) => taskId !== task.id
                      );
                      updateStateAndSave(newState);
                    }}
                    onInProgressTask={(task: TaskInterface, column: ColumnInterface) => {
                      const newState = { ...state };
                      const columnKeys = Object.keys(newState.columns);
                      const currentColumnIdx = Object.keys(newState.columns).findIndex(
                        (id: string) => id === column.id
                      );
                      const doneColumnKey = columnKeys[columnKeys.length - 1];
                      const nextColumnKey = columnKeys[currentColumnIdx + 1];
                      if (nextColumnKey === doneColumnKey) {
                        task.done = true; // user moved this task to the right column and reached Done Column.
                      }
                      // remove task from current column:
                      newState.columns[column.id].taskIds = newState.columns[column.id].taskIds.filter(
                        (taskId: string) => taskId !== task.id
                      );
                      // append task to the next column:
                      newState.columns[nextColumnKey].taskIds.unshift(task.id);
                      updateStateAndSave(newState);
                    }}
                    onCompleteTask={(task: TaskInterface, column: ColumnInterface) => {
                      task.done = true;
                      const newState = { ...state };
                      const columnKeys = Object.keys(newState.columns);
                      const doneColumnKey = columnKeys[columnKeys.length - 1];
                      // remove task from current column:
                      newState.columns[column.id].taskIds = newState.columns[column.id].taskIds.filter(
                        (taskId: string) => taskId !== task.id
                      );
                      // append task to the top of Done column:
                      newState.columns[doneColumnKey].taskIds.unshift(task.id);
                      updateStateAndSave(newState);
                    }}
                  />
                );
              })}
              {provided.placeholder}
            </Columns>
          )}
        </Droppable>
      </DragDropContext>
      {/* <pre>{msg}</pre> */}
    </div>
  );
}
