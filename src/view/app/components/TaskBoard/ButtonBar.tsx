import * as React from 'react';
import styled from 'styled-components';
import Select from 'react-select';

import { getMarkdown, SearchIcon } from './Helpers';
import SearchInput from './SearchInput';

const Container = styled.div`
  display: flex;
  justify-content: space-between;
  text-align: right;
  margin: 5px 10px;
  span[data-name='project-name'] {
    font-size: 1.2em;
    align-self: center;
    margin-top: 5px;
    margin-left: 0px;
    svg {
      visibility: hidden;
    }
    &:hover {
      svg {
        visibility: visible;
      }
    }
  }
  > button {
    margin-left: 10px;
  }
`;
// const newData = parseMarkdown(defaultDataString);

export function OpenFileIcon(props: any) {
  return (
    <svg
      {...props}
      title="Open file"
      style={{
        width: '0.7em',
        height: '0.7em',
        cursor: 'pointer',
        marginLeft: 5,
        marginTop: 5
      }}
      width="16"
      height="16"
      viewBox="0 0 16 16"
      version="1.1"
    >
      <path d="M14 16v-11l-1 1v9h-12v-12h9l1-1h-11v14z" fill="currentColor" />
      <path d="M16 0h-5l1.8 1.8-6.8 6.8 1.4 1.4 6.8-6.8 1.8 1.8z" fill="currentColor" />
    </svg>
  );
}

export function RefreshIcon(props: any) {
  return (
    <svg
      {...props}
      title="Refresh"
      style={{ verticalAlign: 'middle', cursor: 'pointer', marginLeft: 5 }}
      width="16"
      height="16"
      viewBox="0 0 100.25 100.25"
    >
      <polyline points="70,57.75 82.5,45.75 95,57.75 " />
      <g>
        <path
          fill="currentColor"
          d="M83.854,45.613c-0.076-0.825-0.807-1.438-1.632-1.356c-0.824,0.076-1.432,0.806-1.356,1.631 c0.09,0.97,0.135,1.956,0.135,2.929c0,17.333-14.043,31.434-31.304,31.434c-8.36,0-16.222-3.269-22.134-9.205 c-0.585-0.587-1.534-0.589-2.121-0.004s-0.589,1.535-0.004,2.122c6.479,6.505,15.095,10.087,24.259,10.087 c18.915,0,34.304-15.447,34.304-34.434C84,47.752,83.95,46.674,83.854,45.613z"
        />
        <path
          fill="currentColor"
          d="M31.082,44.712c-0.575-0.599-1.524-0.618-2.121-0.043L18.513,54.7c-0.336-1.852-0.512-3.737-0.512-5.632 c0-17.268,14.051-31.317,31.322-31.317c8.351,0,16.206,3.247,22.118,9.143c0.588,0.585,1.538,0.583,2.122-0.003 c0.585-0.586,0.583-1.536-0.003-2.121c-6.479-6.46-15.087-10.019-24.237-10.019c-18.926,0-34.322,15.395-34.322,34.317 c0,1.505,0.102,3.004,0.296,4.488L6.04,44.669c-0.597-0.573-1.545-0.555-2.121,0.043c-0.574,0.597-0.555,1.547,0.043,2.121l12.5,12 c0.29,0.279,0.665,0.418,1.039,0.418s0.749-0.139,1.039-0.418l12.5-12C31.637,46.259,31.656,45.309,31.082,44.712z"
        />
      </g>
    </svg>
  );
}

export default ({
  vscodeHelper,
  fileArray,
  selectedFile,
  data,
  onLoadData,
  onSave,
  onRefresh,
  onOpenFile,
  onSearch,
  onSelectFile
}) => {
  const fileOptions = fileArray.map(path => {
    return { value: path, label: path };
  });
  fileOptions.push({ value: 'ADD', label: '＋ Add file...' });

  const selectedOpt = fileOptions.find(opt => opt.value === selectedFile);
  const [selectValue, setSelectValue] = React.useState(selectedOpt);
  const [searchActive, setSearchActive] = React.useState(false);
  return (
    <div>
      <div style={{ display: 'flex' }}>
        <span style={{ width: '30%', marginLeft: 10 }}>
          <Select
            className="__reactSelect"
            classNamePrefix="__select"
            options={fileOptions}
            value={selectValue}
            styles={{}}
            onChange={sel => {
              if (sel.value === 'ADD') {
                vscodeHelper.showMessage(
                  'In your workspace "settings.json" file, add this: "coddx.taskBoard.fileList": "TODO.md, folder/TODO-name.md" (comma separated, use your file paths)'
                );
                return;
              }
              setSelectValue(sel);
              if (onSelectFile) {
                onSelectFile(sel);
              }
            }}
          />
        </span>
        <a
          style={{ position: 'absolute', right: 15, top: 15 }}
          href="https://github.com/coddx-hq/coddx-alpha/blob/master/docs/documentation.md"
        >
          Help | Doc
        </a>
      </div>
      <Container>
        <span data-name="project-name">
          {data.projectName} <RefreshIcon onClick={() => onRefresh()} />{' '}
          <OpenFileIcon
            onClick={() => {
              onOpenFile();
            }}
          />
        </span>
        <div>
          {searchActive ? (
            <SearchInput style={{ marginRight: 10 }} onChange={value => onSearch(value)} />
          ) : (
            <SearchIcon
              style={{ cursor: 'pointer', marginRight: 10, verticalAlign: '-4px' }}
              onClick={() => setSearchActive(true)}
            />
          )}
          <button
            onClick={() => {
              const id = `newtask_${Math.random()}`;
              // const newData = parseMarkdown(defaultDataString);
              const newData = { ...data };

              let hasCheckbox = true;
              const firstCol = Object.keys(newData.columns)[0];
              const firstColTaskIds = newData.columns[firstCol].taskIds;
              if (firstColTaskIds && firstColTaskIds.length > 0) {
                const lastColTask = data.tasks[firstColTaskIds[firstColTaskIds.length - 1]];
                if (lastColTask && lastColTask.hasCheckbox === false) {
                  hasCheckbox = false;
                }
              }
              newData.tasks[id] = { id, content: '', done: false, hasCheckbox };

              newData.columns[firstCol].taskIds.unshift(id); // add to the top.
              onLoadData(newData);

              const str = getMarkdown(newData);
              onSave(str);
              window['isCreatingTask'] = true; // global flag to be caught in Task.tsx
            }}
          >
            ＋ Task
          </button>
        </div>
        {/* <button
        onClick={() => {
          refresh(newData);
        }}
      >
        Refresh
      </button> */}
        {/* <button onClick={() => {
        const str = getMarkdown(data);
        onSave(str);
      }}>Save to TODO.md</button> */}
      </Container>
    </div>
  );
};
