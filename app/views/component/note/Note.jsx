import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import classnames from 'classnames';
import { ipcRenderer } from 'electron';
import { message } from 'antd';
import { appSwitchEditMode } from 'Actions/app';
import { readFile } from 'Actions/markdown';
import { getFileById } from 'Utils/db/app';

import Explorer from './Explorer';
import Markdown from '../editor/Markdown';
import ToolBar from './ToolBar';
import Loading from '../share/Loading';

import '../../assets/scss/note.scss';

function mapStateToProps(state, ownProps) {
  const {
    app,
    markdown: { uuid },
    exportQueue,
    note,
  } = state;
  return {
    uuid,
    editorMode: app.settings.editorMode,
    exportStatus: exportQueue.status,
    note,
    ...ownProps,
  };
}

@connect(mapStateToProps)
export default class NoteWorkspace extends Component {
  static displayName = 'NoteSpace';
  static propTypes = {
    dispatch: PropTypes.func.isRequired,
    uuid: PropTypes.string.isRequired,
    exportStatus: PropTypes.number.isRequired,
    note: PropTypes.shape({
      projectUuid: PropTypes.string.isRequired,
      projectName: PropTypes.string.isRequired,
      fileUuid: PropTypes.string.isRequired,
    }).isRequired,
    editorMode: PropTypes.string.isRequired,
  };

  componentDidMount() {
    if (this.props.note.fileUuid !== '-1' && !this.props.uuid) { // 读取文件
      this.setContent();
    }
  }

  setContent() {
    const { projectName, fileUuid } = this.props.note;
    const file = getFileById(fileUuid);
    if (Array.isArray(file) && file.length === 1) {
      const item = file[0];
      const data = ipcRenderer.sendSync('NOTES:read-file', {
        projectName,
        fileName: item.name,
      });
      if (!data.success) {
        message.error('Failed to read file data.');
        // 文件读取失败
        // 防止界面空白，自动切换到 `write` 模式
        this.props.dispatch(appSwitchEditMode('write'));
        return false;
      }
      item.content = data.data;
      this.props.dispatch(readFile(item));
    }
  }

  render() {
    const { editorMode, exportStatus } = this.props;
    const blur = exportStatus === 1;
    const contClass = classnames('note-root-cont', {
      'note-blur': blur,
    });
    return (
      <div className={`note-root ${editorMode}`}>
        {blur ? (
          <Loading tip="Exporting..." />
        ) : null}
        <ToolBar
          blur={blur}
        />
        <div className={contClass} id="note_root_cont">
          <Explorer />
          <Markdown />
        </div>
      </div>
    );
  }
}
