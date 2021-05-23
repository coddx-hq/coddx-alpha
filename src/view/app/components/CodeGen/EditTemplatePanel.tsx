import * as React from 'react';
import CodeEditor from './CodeEditor';

export default class EditTemplatePanel extends React.Component<any> {
  state = {
    code: this.props.code
  };

  componentWillReceiveProps(newProps: any) {
    this.setState({ code: newProps.code });
  }

  render() {
    return (
      <div>
        <div>
          <button onClick={() => this.props.onClose(this.state.code)}>Save</button>
          &nbsp;
          {/* <button onClick={() => {}}>Cancel</button> */}
        </div>
        <hr />
        <CodeEditor code={this.state.code} onValueChange={code => this.setState({ code })} />
      </div>
    );
  }
}
