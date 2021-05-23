import * as React from 'react';
import { IConfig, ICommand, CommandAction } from '../../model';
import { FilesInterface, nunjucksRender, getTemplateItems, DefaultTemplateString, parseJsonString } from '../../Utils';

import EditTemplatePanel from './EditTemplatePanel';
import CodeEditor from './CodeEditor';
import './MainView.css';

const saveTemplate = (vscode: any, templateString: string) => {
  let command: ICommand = {
    action: CommandAction.Save,
    content: {
      name: '',
      description: templateString
    }
  };
  if (vscode.postMessage) {
    vscode.postMessage(command);
  }
};

const generateFiles = (vscode: any, path: string, files: FilesInterface) => {
  let command: ICommand = {
    action: CommandAction.GenerateFiles,
    content: {
      name: '',
      description: JSON.stringify({
        path,
        files
      })
    }
  };
  if (vscode.postMessage) {
    vscode.postMessage(command);
  }
};

interface IConfigProps {
  vscode: any;
  initialData?: IConfig;
}

interface IConfigState {
  path: string;
  templateString: string;
  editMode: boolean;
  config: IConfig;
  output: string;
  name: string;
  action: string;
  files: any;
  params: string;
}

let templateStr = window && window['initialData'] ? window['initialData']['templateString'] : '';
if (!templateStr) {
  templateStr = DefaultTemplateString;
}

const initialPath = window && window['initialData'] ? window['initialData']['path'] : '';
const DefaultName = 'NewComponent';

export default class MainView extends React.Component<IConfigProps, IConfigState> {
  state = {
    path: '',
    templateString: templateStr,
    editMode: false,
    config: null,
    output: '',
    name: DefaultName,
    action: 'Preview Output',
    files: getTemplateItems(window && window['initialData'] ? window['initialData']['templateString'] : ''),
    params: ''
  };

  componentDidMount() {
    this.setState({ path: initialPath + '/' + DefaultName });
  }

  render() {
    // const templateString = window['initialData']['templateString'];
    const { path, templateString, output, name, params } = this.state;

    // const [editMode, setEditMode] = React.useState(false); // Hooks don't work in VSCode Ext ??
    // console.log(
    //   '--- ',
    //   getTemplateItems(
    //     templateString,
    //     {},
    //     {
    //       '{{fileName}}.css': { checked: false }
    //     }
    //   )
    // );
    return (
      <main className="mainView">
        <section className="body">
          {this.state.editMode ? (
            <EditTemplatePanel
              code={templateString}
              onClose={(newContent: string) => {
                this.setState({
                  editMode: false,
                  templateString: newContent,
                  output: ''
                });
                saveTemplate(this.props.vscode, newContent);
              }}
            />
          ) : (
            <div>
              <div>
                <a href="javascript:;" onClick={() => this.setState({ editMode: true })}>
                  Edit Templates
                </a>
              </div>
              <p className="infoBox">
                <div>
                  <span>File Name*</span>
                  <input
                    placeholder="to replace {{fileName}}"
                    value={name}
                    onChange={e => {
                      const name = e.target.value;
                      this.setState({
                        name,
                        output: '',
                        path: initialPath + '/' + name
                      });
                    }}
                  />
                </div>
                <div>
                  <span>Path*</span>
                  <input
                    placeholder="relative to project"
                    value={path}
                    onChange={e => this.setState({ path: e.target.value, output: '' })}
                  />
                </div>
                <div>
                  <span>Params</span>
                  <input
                    placeholder="(json, optional)"
                    value={this.state.params}
                    onChange={e => this.setState({ params: e.target.value, output: '' })}
                  />
                </div>
              </p>
              <p>Choose files to generate:</p>
              <ul className="fileList">
                {Object.keys(this.state.files).map(itemKey => {
                  const item = this.state.files[itemKey];

                  const outputName = nunjucksRender(itemKey, {
                    fileName: name,
                    ...parseJsonString(params)
                  });
                  return (
                    <li>
                      <label>
                        <input
                          type="checkbox"
                          checked={item.checked}
                          onChange={() => {
                            const files = this.state.files;
                            files[itemKey].checked = !files[itemKey].checked;
                            this.setState({ files });
                          }}
                        />
                        {outputName}
                      </label>
                    </li>
                  );
                })}
              </ul>
              <p>
                <button
                  disabled={!name}
                  onClick={() => {
                    const files = getTemplateItems(
                      templateString,
                      { fileName: name, ...parseJsonString(params) },
                      this.state.files
                    );
                    let newOutput = '';
                    Object.keys(files).forEach(itemKey => {
                      if (files[itemKey].checked === true) {
                        newOutput += '\n\n' + files[itemKey].fileMarker + '\n';
                        newOutput += files[itemKey].fileContent;
                      }
                    });

                    this.setState({ output: newOutput });
                    // this.props.vscode.window.showInformationMessage()
                  }}
                >
                  Preview Outputs
                </button>
                &nbsp;&nbsp;
                {name.length > 0 && output && (
                  <button
                    onClick={() => {
                      // const output = nunjucksRender(templateString, {
                      //   fileName: name
                      // });
                      // this.setState({ output });

                      const files = getTemplateItems(
                        this.state.output, // templateString,
                        { fileName: name, ...parseJsonString(params) },
                        this.state.files
                      );
                      generateFiles(this.props.vscode, path, files);
                    }}
                  >
                    Generate Files
                  </button>
                )}
              </p>
              {output && <hr />}
              <CodeEditor code={output} onValueChange={(code) => this.setState({ output: code })} />
            </div>
          )}
        </section>
        <footer>
          <input />
        </footer>
      </main>
    );
  }
}
