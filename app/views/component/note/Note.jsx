import React, { Component } from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';
import { ipcRenderer } from 'electron';
import { message } from 'antd';
import { withDispatch } from 'Components/HOC/context';
import { readFile } from 'Actions/markdown';
import { getFileById } from 'Utils/db/app';

import Explorer from './Explorer';
import Markdown from '../editor/Markdown';
import ToolBar from './ToolBar';
import Loading from '../share/Loading';

import '../../assets/scss/note.scss';

@withDispatch
export default class NoteWorkspace extends Component {
  static displayName = 'NoteSpace';
  static propTypes = {
    dispatch: PropTypes.func.isRequired,
    imageHostingConfig: PropTypes.shape({
      default: PropTypes.oneOf(['github']).isRequired,
      github: PropTypes.shape({
        repo: PropTypes.string.isRequired,
        branch: PropTypes.string.isRequired,
        token: PropTypes.string.isRequired,
        path: PropTypes.string.isRequired,
        domain: PropTypes.string.isRequired,
      }).isRequired,
    }).isRequired,
    projects: PropTypes.arrayOf(PropTypes.shape({
      uuid: PropTypes.string.isRequired,
      name: PropTypes.string.isRequired,
      description: PropTypes.string.isRequired,
      labels: PropTypes.arrayOf(PropTypes.string).isRequired,
      status: PropTypes.number.isRequired,
      notes: PropTypes.array.isRequired,
    })).isRequired,
    searchResult: PropTypes.arrayOf(PropTypes.shape({
      uuid: PropTypes.string.isRequired,
      name: PropTypes.string.isRequired,
      description: PropTypes.string.isRequired,
      labels: PropTypes.arrayOf(PropTypes.string).isRequired,
      status: PropTypes.number.isRequired,
      notes: PropTypes.array.isRequired,
    })).isRequired,
    searchStatus: PropTypes.number.isRequired,
    markdown: PropTypes.shape({
      parentsId: PropTypes.string.isRequired,
      uuid: PropTypes.string.isRequired,
      createDate: PropTypes.string.isRequired,
      latestDate: PropTypes.string.isRequired,
      name: PropTypes.string.isRequired,
      content: PropTypes.string.isRequired,
      html: PropTypes.string.isRequired,
      status: PropTypes.number.isRequired,
      start: PropTypes.number.isRequired,
      hasEdit: PropTypes.bool.isRequired,
      uploadStatus: PropTypes.number.isRequired,
    }).isRequired,
    note: PropTypes.shape({
      projectUuid: PropTypes.string.isRequired,
      projectName: PropTypes.string.isRequired,
      fileUuid: PropTypes.string.isRequired,
      exportStatus: PropTypes.number.isRequired,
    }).isRequired,
    editor: PropTypes.shape({
      fontSize: PropTypes.number.isRequired,
      previewFontSize: PropTypes.number.isRequired,
      cursorPosition: PropTypes.number.isRequired,
    }).isRequired,
    markdownSettings: PropTypes.shape({
      editorWidth: PropTypes.number.isRequired,
    }).isRequired,
    editorMode: PropTypes.string.isRequired,
    exportQueue: PropTypes.shape({
      status: PropTypes.number.isRequired,
    }).isRequired,
  };

  componentDidMount() {
    if (this.props.note.fileUuid !== '-1' && !this.props.markdown.uuid) { // 读取文件
      this.setContent();
    }
  }

  setContent() {
    const { projectName, fileUuid } = this.props.note;
    const file = getFileById(fileUuid);
    if (Array.isArray(file) && file.length === 1) {
      const item = file[0];
      const data = ipcRenderer.sendSync('read-file', {
        projectName,
        fileName: item.name,
      });
      if (!data.success) {
        message.error('Failed to read file data.');
        return false;
      }
      item.content = data.data;
      this.props.dispatch(readFile(item));
    }
  }

  render() {
    const { projects, markdown, note, markdownSettings, editorMode, searchStatus, searchResult, exportQueue: { status: exportStatus }, imageHostingConfig, editor } = this.props;
    let projectData;
    if (searchStatus === 0) {
      projectData = projects;
    } else if (searchStatus === 1) {
      projectData = searchResult;
    }
    const blur = exportStatus === 1;
    const contClass = classnames('note-root-cont', {
      'note-blur': blur,
    });
    return (
      <div className="note-root">
        {blur ? (
          <Loading tip="Exporting..." />
        ) : null}
        <ToolBar
          markdown={markdown}
          editorMode={editorMode}
          searchStatus={searchStatus}
          note={note}
          blur={blur}
        />
        <div className={contClass} id="note_root_cont">
          <Explorer
            projects={projectData}
            note={note}
            editorMode={editorMode}
            searchStatus={searchStatus}
            hasEdit={markdown.hasEdit}
          />
          <Markdown
            imageHostingConfig={imageHostingConfig}
            markdown={markdown}
            markdownSettings={markdownSettings}
            editorMode={editorMode}
            editor={editor}
            note={note}
          />
        </div>
      </div>
    );
  }
}
