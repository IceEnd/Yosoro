import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import classnames from 'classnames';
import { ipcRenderer } from 'electron';
import { message } from 'antd';
import { appSwitchEditMode } from 'Actions/app';
import { readFile } from 'Actions/markdown';
import { getFileById } from 'Utils/db/app';
import { getFolderByPos } from 'Utils/utils';

import Explorer from './Explorer';
import Markdown from '../editor/Markdown';
import ToolBar from './ToolBar';
import Loading from '../share/Loading';

import '../../assets/scss/note.scss';

function mapStateToProps(state, ownProps) {
  const {
    app,
    exportQueue,
    projects: { fileUuid, pos, projects },
  } = state;
  return {
    editorMode: app.settings.editorMode,
    exportStatus: exportQueue.status,
    projects,
    fileUuid,
    pos,
    ...ownProps,
  };
}

function mapDispatchToProps(dispatch) {
  return {
    readFile: (...args) => dispatch(readFile(...args)),
    appSwitchEditMode: (...args) => dispatch(appSwitchEditMode(...args)),
  };
}

@connect(mapStateToProps, mapDispatchToProps)
export default class NoteWorkspace extends Component {
  static displayName = 'NoteSpace';
  static propTypes = {
    exportStatus: PropTypes.number.isRequired,
    projects: PropTypes.array.isRequired,
    fileUuid: PropTypes.string.isRequired,
    editorMode: PropTypes.string.isRequired,
    pos: PropTypes.string.isRequired,
    // action functions
    readFile: PropTypes.func.isRequired,
    appSwitchEditMode: PropTypes.func.isRequired,
  };

  componentDidMount() {
    if (this.props.fileUuid !== '-1') { // 读取文件
      this.setContent();
    }
  }

  setContent() {
    const { fileUuid, projects, pos } = this.props;
    const file = getFileById(fileUuid);
    if (Array.isArray(file) && file.length === 1) {
      const item = file[0];
      const head = getFolderByPos(projects, pos);
      const data = ipcRenderer.sendSync('NOTES:read-file', `${head.path}/${item.name}.md`);
      if (!data.success) {
        message.error('Failed to read file data.');
        // 文件读取失败
        // 防止界面空白，自动切换到 `normal` 模式
        this.props.appSwitchEditMode('normal');
        return false;
      }
      item.content = data.data;
      this.props.readFile(item);
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
