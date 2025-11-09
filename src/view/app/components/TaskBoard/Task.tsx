import * as React from 'react';
import styled from 'styled-components';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import TextareaAutosize from 'react-autosize-textarea';
import { DragIcon } from './Helpers';
import TaskMenu from './TaskMenu';
import { parseInline } from 'marked';

const { memo } = React;

export interface TaskInterface {
  id: string;
  content: string;
  done: boolean;
  hasCheckbox?: boolean;
  matched?: boolean;
  level?: number;
}

const TaskContainer = styled.div<{ isDragging: boolean }>`
  position: relative;
  border-radius: 4px;
  margin-left: 5px;
  margin-bottom: 8px;
  background-color: ${props => (props.isDragging ? '#eef' : '#333')};
  transition: background 0.1s;
`;

const Handle = styled.span`
  display: flex;
  margin-right: 5px;
`;

const TaskDisplay = styled.div`
  box-sizing: border-box;
  width: 100%;
  padding: 3px 0 3px 0;
  margin-bottom: 2px;
  background-color: inherit;
  color: var(--vscode-tab-foreground);
  border: 1px solid transparent;
  font-family: inherit;
`;

const StyledTextarea = styled(TextareaAutosize)`
  resize: none;
  box-sizing: border-box;
  width: 100%;
  background-color: inherit;
  color: var(--vscode-tab-foreground);
  border: 1px solid transparent;
  margin-top: 1px;
  margin-bottom: 3px;
  font-family: inherit;
`;

// use "svg, [data-type='action-icon']" to hide the drag icon svg also.
const TaskWrapper = styled.div`
  display: flex;
  align-items: center;
  background-color: var(--vscode-tab-inactiveBackground);
  padding-right: 4px;
  [draggable] {
    margin: 0;
  }
  [data-type='action-icon'] {
    visibility: hidden;
  }
  &:hover {
    [data-type='action-icon'] {
      visibility: visible;
    }
  }
`;

const ActionWrapper = styled.div`
  position: absolute;
  right: 0;
  padding: 2px;
`;

const ActionIcon = styled.span`
  font-size: 1em;
  padding: 1px 5px;
  margin: 0 2px;
  cursor: pointer;
  background-color: #555;
  color: #eee;
  border-radius: 4px;
  &:hover {
    background-color: #777;
  }
`;

const TickMark = styled.span`
  font-size: 1em;
  color: #ddd;
  margin-right: 3px;
`;

interface TaskProps {
  column: any;
  columnIndex: number;
  task: TaskInterface;
  index: number;
  onChangeTitle: (title: string) => void;
  onDelete: (task: TaskInterface) => void;
  onInProgress: (task: TaskInterface) => void;
  onComplete: (task: TaskInterface) => void;
  onChangeTask: (id: string, task: TaskInterface) => void;
}

export default memo(
  ({
    column,
    columnIndex,
    task,
    index,
    onChangeTitle,
    onDelete,
    onInProgress,
    onComplete,
    onChangeTask
  }: TaskProps) => {
    // mainKey is used to force re-render StyledTextarea as it doesn't auto re-render as expected.
    const [mainKey, setMainKey] = React.useState('key_' + Math.random());
    const [isEditing, setIsEditing] = React.useState(false);
    const [menuActive, setMenuActive] = React.useState('');
    const inputRef: React.RefObject<HTMLTextAreaElement> = React.createRef();

    React.useEffect(() => {
      // on did mount
      if (window['isCreatingTask'] === true) {
        // after clicking on "+ New Task" button => auto focus when creating task
        window['isCreatingTask'] = false;
        setIsEditing(true);
      }
    }, []);

    React.useEffect(() => {
      if (isEditing === true) {
        // when editing, auto set the cursor at the end:
        inputRef.current.setSelectionRange(inputRef.current.value.length, inputRef.current.value.length);
      }
    }, [isEditing]);

    const isHidden = task.matched === false; // filtered by SearchInput's value
    if (isHidden) {
      return null;
    }

    // console.log('column.title', column.title);

    const {
      attributes,
      listeners,
      setNodeRef,
      transform,
      transition,
      isDragging,
    } = useSortable({ id: task.id, data: { sortable: { containerId: column.id } } });

    const style = {
      transform: CSS.Transform.toString(transform),
      transition,
    };

    return (
      <TaskContainer
        ref={setNodeRef}
        style={style}
        isDragging={isDragging}
      >
        <TaskWrapper>
          <Handle {...listeners} {...attributes}>
            <DragIcon />
          </Handle>
              <TickMark>{column.title.indexOf('✓') >= 0 ? '✓ ' : ''}</TickMark>

              {isEditing ? (
                <StyledTextarea
                  placeholder="New Task"
                  autoFocus={true}
                  key={mainKey}
                  ref={inputRef}
                  onKeyDown={ev => {
                    if (ev.keyCode === 13) {
                      ev.preventDefault(); // in this Textarea, ignore Enter Key. Otherwise, it will be a linebreak.
                      // inputRef.current.blur();
                      setIsEditing(false);
                    }
                    // TODO: Ctrl or Cmd Enter to add the next task?
                  }}
                  style={{ paddingLeft: task.level > 0 ? 10 : 0 }}
                  onChange={(ev: any) => onChangeTitle(ev.target.value)}
                  onFocus={() => {
                    setIsEditing(true);
                    setMenuActive('');
                  }}
                  onClick={() => {
                    setMenuActive('');
                  }}
                  onBlur={() => {
                    if (menuActive === '' || menuActive === 'MENU') {
                      // e.g. if user is focusing in EMOJI menu, don't exit out of editing:
                      setIsEditing(false);
                    }
                  }}
                >
                  {task.content}
                </StyledTextarea>
              ) : (
                <TaskDisplay
                  dangerouslySetInnerHTML={{ __html: parseInline(task.content || '&nbsp;') }}
                  onClick={ev => {
                    if (ev.target.tagName.toUpperCase() === 'A') {
                      // user clicked on a hyperlink <a> tag, let it behaves normally.
                    } else {
                      setIsEditing(true);
                    }
                  }}
                />
              )}

              {isEditing ? (
                <ActionWrapper>
                  <ActionIcon
                    data-type="action-icon"
                    onMouseOver={() => setMenuActive('MENU')}
                    onClick={() => {
                      setMenuActive('');
                      setIsEditing(false);
                    }}
                  >
                    ☰
                  </ActionIcon>
                  {menuActive && (
                    <TaskMenu
                      task={task}
                      menuActive={menuActive}
                      setMenuActive={setMenuActive}
                      onChangeTask={onChangeTask}
                      setMainKey={setMainKey}
                      setIsEditing={setIsEditing}
                    />
                  )}
                </ActionWrapper>
              ) : (
                <ActionWrapper>
                  {(!task.done || !column.isLast) && (
                    <ActionIcon data-type="action-icon" onClick={() => onInProgress(task)}>
                      🡢
                    </ActionIcon>
                  )}
                  {/* TODO: don't show Tick icon on the first column => need column index? */}
                  {!task.done && (
                    <ActionIcon data-type="action-icon" onClick={() => onComplete(task)}>
                      ✓
                    </ActionIcon>
                  )}
                  <ActionIcon data-type="action-icon" onClick={() => onDelete(task)}>
                    ✕
                  </ActionIcon>
                </ActionWrapper>
              )}
            </TaskWrapper>
          </TaskContainer>
    );
  }
);
