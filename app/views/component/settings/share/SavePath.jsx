import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { Row, Col, Input, Button, message } from 'antd';
import { ipcRenderer } from 'electron';

const labelLayout = {
  offset: 0,
  span: 7,
};

export default class SavePath extends PureComponent {
  static displayName = 'SettingsSavePath';
  static propTypes = {
    showLoading: PropTypes.func.isRequired,
    closeLoading: PropTypes.func.isRequired,
  };

  constructor() {
    super();
    const path = ipcRenderer.sendSync('COMMON:get-docuemnts-save-path');
    this.state = {
      path,
    };
  }

  componentDidMount() {
    ipcRenderer.on('change-documents-save-path', () => {
      this.props.showLoading('Transferring...');
    });
    ipcRenderer.on('change-documents-save-path-over', (event, data) => {
      this.props.closeLoading();
      const { code, res } = data;
      if (code) {
        this.setState({
          path: res,
        });
      } else {
        message.error('Operation failed');
      }
    });
  }

  componentWillUnmount() {
    ipcRenderer.removeAllListeners('change-documents-save-path');
    ipcRenderer.removeAllListeners('change-documents-save-path-over');
  }

  handleClick = () => {
    ipcRenderer.send('NOTES:open-file-dialog', {
      properties: ['openDirectory'],
      cbChannel: 'change-documents-save-path',
      cbOver: 'change-documents-save-path-over',
    });
  }

  render() {
    const { path } = this.state;
    return (
      <Row className="font-size-row">
        <Col key="label" {...labelLayout} className="row-label">Note Save Path:</Col>
        <Col key="view" span={10} style={{ padding: '0 .2em' }}>
          <Input value={path} disabled />
        </Col>
        <Col key="button" span={5} className="number-col">
          <Button
            onClick={this.handleClick}
          >
            Choose...
          </Button>
        </Col>
      </Row>
    );
  }
}
