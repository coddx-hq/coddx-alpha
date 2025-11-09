import * as React from 'react';
import styled from 'styled-components';
import { CommandAction } from '../../model';
import { sendCommand, getVscodeHelper } from '../../Utils';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  horizontalListSortingStrategy,
} from '@dnd-kit/sortable';
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

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const reloadFile = () => sendCommand(vscode, CommandAction.Load, selectedFile);

  React.useEffect(() => {
    reloadFile();
  }, []);

  const updateStateAndSave = newState => {
    setState(newState);
    vscodeHelper.saveList(getMarkdown(newState));
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over || active.id === over.id) {
      return;
    }

    // Handle column reordering
    if (state.columnOrder.includes(active.id as string) && state.columnOrder.includes(over.id as string)) {
      const oldIndex = state.columnOrder.indexOf(active.id as string);
      const newIndex = state.columnOrder.indexOf(over.id as string);

      const newColOrd = [...state.columnOrder];
      newColOrd.splice(oldIndex, 1);
      newColOrd.splice(newIndex, 0, active.id as string);

      const newState = {
        ...state,
        columnOrder: newColOrd
      };
      updateStateAndSave(newState);
      return;
    }

    // Handle task reordering within or between columns
    const activeTaskId = active.id as string;
    const overContainer = over.data.current?.sortable?.containerId || over.id as string;

    // Find which column contains the active task
    let sourceColumn: any = null;
    let sourceColumnId: string | null = null;
    for (const [colId, col] of Object.entries(state.columns)) {
      if ((col as any).taskIds.includes(activeTaskId)) {
        sourceColumn = col;
        sourceColumnId = colId;
        break;
      }
    }

    if (!sourceColumn || !sourceColumnId) {
      return;
    }

    const destColumn = state.columns[overContainer];
    if (!destColumn) {
      return;
    }

    if (sourceColumnId === overContainer) {
      // Reordering within the same column
      const oldIndex = sourceColumn.taskIds.indexOf(activeTaskId);
      const newIndex = destColumn.taskIds.indexOf(over.id as string);

      const newTaskIds = [...sourceColumn.taskIds];
      newTaskIds.splice(oldIndex, 1);
      newTaskIds.splice(newIndex, 0, activeTaskId);

      const newState = {
        ...state,
        columns: {
          ...state.columns,
          [sourceColumnId]: {
            ...sourceColumn,
            taskIds: newTaskIds
          }
        }
      };
      updateStateAndSave(newState);
    } else {
      // Moving between columns
      const sourceTaskIds = sourceColumn.taskIds.filter(id => id !== activeTaskId);
      const destIndex = destColumn.taskIds.indexOf(over.id as string);
      const destTaskIds = [...destColumn.taskIds];
      destTaskIds.splice(destIndex >= 0 ? destIndex : destTaskIds.length, 0, activeTaskId);

      const newState = {
        ...state,
        columns: {
          ...state.columns,
          [sourceColumnId]: {
            ...sourceColumn,
            taskIds: sourceTaskIds
          },
          [overContainer]: {
            ...destColumn,
            taskIds: destTaskIds
          }
        },
        tasks: data.tasks
      };
      updateStateAndSave(newState);
    }
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
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={state.columnOrder}
          strategy={horizontalListSortingStrategy}
        >
          <Columns>
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
            </Columns>
          </SortableContext>
        </DndContext>
      {/* <pre>{msg}</pre> */}
    </div>
  );
}
