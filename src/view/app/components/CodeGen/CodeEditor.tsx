import * as React from 'react';

import Editor from 'react-simple-code-editor';
import { highlight, languages } from 'prismjs/components/prism-core';
import 'prismjs/components/prism-clike';
import 'prismjs/components/prism-javascript';

import './CodeEditor.css';

const styles = {
  editor: {
    fontFamily: '"Fira code", "Fira Mono", monospace',
    fontSize: 12
  }
}

interface Props {
  code: string,
  onValueChange?: (code: string) => void
}

export default class CodeEditor extends React.Component<Props> {
  state = { code: this.props.code };

  componentWillReceiveProps(newProps: any) {
    this.setState({ code: newProps.code });
  }

  render() {
    return (
      <>
        <Editor
          value={this.state.code}
          onValueChange={code => {
            this.setState({ code });
            if (this.props.onValueChange) {
              this.props.onValueChange(code);
            }
          }}
          highlight={code => highlight(code || '', languages.js)}
          padding={10}
          style={styles.editor}
        />
      </>
    );
  }
}
