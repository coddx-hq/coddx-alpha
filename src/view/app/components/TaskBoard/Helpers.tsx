import * as React from 'react';
import { TaskInterface } from './Task';

export const defaultDataString = `# Project

Project Description

<em>[TODO.md spec & Kanban Board](https://bit.ly/3fCwKfM)</em>

### Todo

### In Progress

### Done ✓

`;
// export const defaultDataString = `# Project Name

// Project Description

// <em>[TODO.md spec & Kanban Board](https://bit.ly/3fCwKfM)</em>

// ### Todo

// - [ ] Build Launch Pad
// - [ ] Launch time 🎉
//   - [ ] Prepare for launching
//   - [ ] Detail description

// ### In Progress

// - [ ] Build the rocket engine

// ### Done ✓

// - [x] Designed my rocket
// `;

const isDoneColumn = (columnName: string) => {
  if (!columnName) {
    return false;
  }
  const lowerColName = columnName.toLowerCase();
  if (lowerColName.indexOf('[x]') > 0 || lowerColName.indexOf('✓') > 0) {
    return true;
  }
  return false;
};

export function getMarkdown(data) {
  let md = '';
  // loop through "columns", then column.taskIds => write to lines
  for (const colKey in data.columns) {
    const col = data.columns[colKey];
    md += '### ' + col.title + '\n\n';

    let checkboxStr = '[ ] ';
    if (isDoneColumn(col.title)) {
      checkboxStr = '[x] ';
    }

    // for (let i = 0; i < col.taskIds.length; i += 1) {
    //   const task = col.taskIds[i];
    //   md += '[ ] ' + task.content + '\n';
    // }
    col.taskIds.forEach((taskId: string) => {
      const task: TaskInterface = data.tasks[taskId];
      if (!task) {
        return;
      }
      const indent = task.level === 1 ? '  - ' : '- ';
      md += indent + (task.hasCheckbox === false ? '' : checkboxStr) + task.content.trim() + '  \n';
    });
    md += '\n';
  }
  md = data.precontent + md; // prepend "data.precontent"
  return md;
}

// parse TODO.md content (markdown), return object { tasks: {}, ... } - see "output":
export function parseMarkdown(md: string) {
  const output = {
    projectName: '',
    precontent: '', // description content before the Lists.
    tasks: {},
    columns: {},
    columnOrder: []
  };
  let lastColName = '';
  const lines = md.split('\n');
  let taskNum = 0;

  let listFound = false; // found after '### '

  lines.forEach(line => {
    if (listFound === false) {
      if (line.indexOf('# ') === 0) {
        output.projectName = line.replace('# ', '').trim();
      }
      output.precontent += line.indexOf('### ') === 0 ? '' : line + '\n'; // append to precontent
    }

    if (line.indexOf('### ') === 0) {
      listFound = true;
      lastColName = line.replace('### ', '').trim();
      output.columns[lastColName] = {
        id: lastColName.trim(),
        title: lastColName.trim(),
        taskIds: []
      };
      output.columnOrder.push(lastColName);
      return;
    }

    // Handle #### as sub-headings within a column (treated as tasks)
    if (line.indexOf('#### ') === 0) {
      if (listFound && lastColName) {
        taskNum++;
        const id = `task${taskNum}`;
        const title = line.replace('#### ', '').trim();
        const task: TaskInterface = {
          id,
          content: `**${title}**`, // Make sub-headings bold
          hasCheckbox: false,
          done: isDoneColumn(lastColName),
          level: 0
        };
        output.tasks[id] = task;
        output.columns[lastColName].taskIds.push(id);
      }
      return;
    }
    if (!listFound) {
      return;
    }
    if (line.trim().length === 0) {
      return;
    }

    // after a List is found => Tasks come next:
    taskNum++;
    const id = `task${taskNum}`;
    const hasCheckbox = line.indexOf('[ ]') >= 0 || line.indexOf('[x]') >= 0;
    const level = line.indexOf('  - ') === 0 ? 1 : 0;
    let title = line
      .replace('  - [ ] ', '')
      .replace('  - [x] ', '')
      .replace('  - ', '')
      .replace('- [ ] ', '')
      .replace('- [x] ', '')
      .trim();
    if (title.indexOf('- ') === 0) {
      title = title.slice(2); // remove '- '
    }
    const task: TaskInterface = {
      id,
      content: title,
      hasCheckbox,
      done: isDoneColumn(lastColName),
      level
    };
    output.tasks[id] = task;
    output.columns[lastColName].taskIds.push(id);
  });
  // console.log('---- output', output);
  return output;
}

export function DragIcon(props: any) {
  return (
    <svg {...props} style={{ width: '1em', height: '1em' }} viewBox="0 0 1024 1024" version="1.1">
      <path
        d="M384 128h85.333333v85.333333H384V128m170.666667 0h85.333333v85.333333h-85.333333V128M384 298.666667h85.333333v85.333333H384V298.666667m170.666667 0h85.333333v85.333333h-85.333333V298.666667m-170.666667 170.666666h85.333333v85.333334H384v-85.333334m170.666667 0h85.333333v85.333334h-85.333333v-85.333334m-170.666667 170.666667h85.333333v85.333333H384v-85.333333m170.666667 0h85.333333v85.333333h-85.333333v-85.333333m-170.666667 170.666667h85.333333v85.333333H384v-85.333333m170.666667 0h85.333333v85.333333h-85.333333v-85.333333z"
        fill="currentColor"
      />
    </svg>
  );
}

export function SearchIcon(props: any) {
  return (
    <svg {...props} width="16" height="16" x="0px" y="0px" viewBox="0 0 511.999 511.999">
      <g>
        <g>
          <path
            d="M508.874,478.708L360.142,329.976c28.21-34.827,45.191-79.103,45.191-127.309c0-111.75-90.917-202.667-202.667-202.667 S0,90.917,0,202.667s90.917,202.667,202.667,202.667c48.206,0,92.482-16.982,127.309-45.191l148.732,148.732 c4.167,4.165,10.919,4.165,15.086,0l15.081-15.082C513.04,489.627,513.04,482.873,508.874,478.708z M202.667,362.667 c-88.229,0-160-71.771-160-160s71.771-160,160-160s160,71.771,160,160S290.896,362.667,202.667,362.667z"
            fill="currentColor"
          />
        </g>
      </g>
    </svg>
  );
}
