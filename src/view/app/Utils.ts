import nunjucks from 'nunjucks';
import { ICommand, CommandAction } from './model';

export const VER = '0.2.55'; // TODO: get this from package.json.

// const TelemetryReporter = require('vscode-extension-telemetry');
// const extensionId = 'coddx-alpha';
// const extensionVersion = '0.2.11';
// const key = '';
// export const telemetry = new TelemetryReporter(extensionId, extensionVersion, key); // TODO: this crashed!

export interface FilesInterface {
  checked?: boolean;
  fileMarker?: string;
  fileeName?: string;
  fileContent?: string;
}

export const FILE_SEPARATOR = '--->>';

export const DefaultTemplateString = `// -------------->> {{fileName}}.tsx
// created time: {{YYYY}}-{{MM}}-{{DD}} {{HH}}:{{mm}}
import * as React from 'react';
import './{{fileName}}.css';

export default class {{fileName}} extends React.Component {
  render() {
    return (
      <div>
        {/* ...code goes here... */}
      </div>
    )
  }
}

// -------------->> {{fileName}}.css
.main {}

// -------------->> __test__/{{fileName}}.test.tsx
import * as React from 'react';

it('{{fileName}} - render', () => {
  // render(<{{fileName}} />);
  // expect(...);
});
`;

const getBuiltInParams = () => {
  const fd = formatDate(new Date());
  return {
    YYYY: fd.year,
    MM: fd.month,
    DD: fd.day,
    HH: fd.hours24,
    mm: fd.minutes,
    ss: fd.seconds
  };
};

// format to: yyy-mm-dd
export function formatDate(d: Date) {
  let month = '' + (d.getMonth() + 1);
  let day = '' + d.getDate();
  const year = d.getFullYear();

  if (month.length < 2) month = '0' + month;
  if (day.length < 2) day = '0' + day;
  return {
    year,
    month,
    day,
    hours24: d.getHours(),
    minutes: d.getMinutes(),
    seconds: d.getSeconds(),
    yyyymmdd: [year, month, day].join('-')
  };
}

export function parseJsonString(jsonString: string) {
  if (!jsonString || !jsonString.trim()) {
    return {};
  }
  let useParams = {};
  try {
    useParams = JSON.parse(jsonString.trim());
  } catch {}
  return useParams;
}

export function jsonClone(obj: any) {
  if (!obj) {
    return obj; // null or undefined
  }
  return JSON.parse(JSON.stringify(obj));
}

export function deepFind(obj: any, path: string, defaultValue: any) {
  const travel = regexp =>
    String.prototype.split
      .call(path, regexp)
      .filter(Boolean)
      .reduce((res, key) => (res !== null && res !== undefined ? res[key] : res), obj);
  const result = travel(/[,[\]]+?/) || travel(/[,[\].]+?/);
  return result === undefined || result === obj ? defaultValue : result;
}

export function nunjucksRender(str: string, data: any): string {
  const tmpl = nunjucks.compile(str);
  return tmpl.render({ ...getBuiltInParams(), ...data });
}

// from content string => parse to get file contents & put in "files" object {}
export function getTemplateItems(content: string, params: any = {}, existingFiles: any = {}): FilesInterface {
  const lines = content.split('\n');
  const output: FilesInterface = {};
  let fileContent = '';
  let lastKey = '';

  lines.forEach(line => {
    if (line.indexOf(FILE_SEPARATOR) >= 0) {
      // when seeing a new file separator => set the accumulated "fileContent" string for the lastKey:
      if (lastKey) {
        output[lastKey].fileContent = nunjucksRender(fileContent, params).trim();
        fileContent = ''; // reset fileContent, prepare for the next file.
      }

      const arr = line.split(FILE_SEPARATOR);
      const itemKey = arr[arr.length - 1].trim();
      const existingItem = existingFiles[itemKey] || {};

      const fileName = nunjucksRender(itemKey, params).trim();
      output[itemKey] = {
        checked: existingItem.checked !== undefined ? existingItem.checked : true,
        fileMarker: line.replace(itemKey, fileName),
        fileName,
        fileContent
      };
      lastKey = itemKey;
    } else {
      if (output[lastKey] && output[lastKey].checked === true) {
        fileContent += line + '\n';
      }
    }
  });

  if (lastKey) {
    output[lastKey].fileContent = nunjucksRender(fileContent, params).trim();
  }
  return output;
}

export const sendCommand = (vscode: any, action: CommandAction, dataStr: string) => {
  let command: ICommand = {
    action: action,
    content: {
      name: '',
      description: dataStr
    }
  };
  if (vscode.postMessage) {
    vscode.postMessage(command);
  }
};

export function getVscodeHelper(vscode: any) {
  return {
    showMessage: (msg: string) =>
      vscode.postMessage({
        action: CommandAction.ShowMessage,
        content: {
          name: '',
          description: msg
        }
      }),
    saveList: (dataStr: string) => {
      let command: ICommand = {
        action: CommandAction.Save,
        content: {
          name: '',
          description: dataStr
        }
      };
      if (vscode.postMessage) {
        vscode.postMessage(command);
      }
    }
  };
}

// In VSCode, "btoa" function is not available (?) => use this:
// A helper that returns Base64 characters and their indices.
// const chars = {
//   ascii: function() {
//     return 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';
//   },
//   indices: function() {
//     if (!this.cache) {
//       this.cache = {};
//       var ascii = chars.ascii();

//       for (var c = 0; c < ascii.length; c++) {
//         var chr = ascii[c];
//         this.cache[chr] = c;
//       }
//     }
//     return this.cache;
//   }
// };
// const toBase64 = function(data) {
//   var ascii = chars.ascii(),
//     len = data.length - 1,
//     i = -1,
//     b64 = '';
//   while (i < len) {
//     var code = (data.charCodeAt(++i) << 16) | (data.charCodeAt(++i) << 8) | data.charCodeAt(++i);
//     b64 += ascii[(code >>> 18) & 63] + ascii[(code >>> 12) & 63] + ascii[(code >>> 6) & 63] + ascii[code & 63];
//   }
//   var pads = data.length % 3;
//   if (pads > 0) {
//     b64 = b64.slice(0, pads - 3);

//     while (b64.length % 4 !== 0) {
//       b64 += '=';
//     }
//   }
//   return b64;
// };
