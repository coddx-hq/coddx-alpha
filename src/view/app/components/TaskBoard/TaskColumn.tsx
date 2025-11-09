import * as React from 'react';
import styled from 'styled-components';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import Task, { TaskInterface } from './Task';

const { memo } = React;

const Container = styled.div<{ isDragging: boolean }>`
  min-height: 150px;
  margin: 0px;
  border-radius: 2px;
  width: 33.3vw;
  display: flex;
  flex-direction: column;
  background-color: ${props => (props.isDragging ? 'lightgreen' : 'inherit')};
`;
const Title = styled.div`
  padding: 5px;
  margin: 5px;
  > span {
    padding: 5px;
    background-color: var(--vscode-editor-selectionBackground);
    border-radius: 2px;
    color: var(--vscode-editor-selectionForeground);
  }
`; // or use: vscode-tab-activeBackground & vscode-tab-foreground
const List = styled.div<{ isDraggingOver: boolean }>`
  padding: 5px;
  transition: background 0.1s;
  background-color: ${props => (props.isDraggingOver ? 'var(--vscode-tab-border)' : 'inherit ')};
  flex-grow: 1;
`;

export interface ColumnInterface {
  id: string;
  title: string;
}

interface ColumnProps {
  tasks: TaskInterface[];
  columnIndex: number;
  column: ColumnInterface;
  onChangeTask: (idx: string, task: any) => void;
  onDeleteTask: (task: TaskInterface, column: ColumnInterface) => void;
  onInProgressTask: (task: TaskInterface, column: ColumnInterface) => void;
  onCompleteTask: (task: TaskInterface, column: ColumnInterface) => void;
}

export default memo(
  ({ column, tasks, columnIndex, onChangeTask, onDeleteTask, onInProgressTask, onCompleteTask }: ColumnProps) => {
    const {
      attributes,
      listeners,
      setNodeRef,
      transform,
      transition,
      isDragging,
    } = useSortable({ id: column.id });

    const style = {
      transform: CSS.Transform.toString(transform),
      transition,
    };

    const taskIds = tasks.map(t => t.id);

    return (
      <Container
        ref={setNodeRef}
        style={style}
        isDragging={isDragging}
      >
        <Title {...listeners} {...attributes}>
          <span>{column.title}</span>
        </Title>
        <SortableContext items={taskIds} strategy={verticalListSortingStrategy}>
          <List isDraggingOver={false}>
            {tasks.map((t, i) => {
              if (!t || !t.id) {
                return null;
              }
              return (
                <Task
                  key={t.id}
                  column={column}
                  columnIndex={columnIndex}
                  task={t}
                  index={i}
                  onChangeTitle={(newTitle: string) => {
                    t.content = newTitle;
                    onChangeTask(t.id, t);
                  }}
                  onDelete={(task: TaskInterface) => onDeleteTask(task, column)}
                  onInProgress={(task: TaskInterface) => onInProgressTask(task, column)}
                  onComplete={(task: TaskInterface) => onCompleteTask(task, column)}
                  onChangeTask={onChangeTask}
                />
              );
            })}
          </List>
        </SortableContext>
      </Container>
    );
  }
);
