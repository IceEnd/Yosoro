import React, { Component, Fragment } from 'react';
import PropTypes from 'prop-types';
import { Input, message, Icon } from 'antd';
import { ipcRenderer } from 'electron';
import Scrollbars from 'Share/Scrollbars';
import { connect } from 'react-redux';

import {
  createFile,
  renameFile,
  deleteFile,
  updateFileDesc,
  switchFile,
  trashBack,
  updateNoteUploadStatus,
  UPLOAD_NOTE_ONEDRIVE,
} from 'Actions/projects';
import {
  readFile,
  beforeSwitchSave,
  saveContentToTrashFile,
  updateCurrentTitle,
  clearMarkdown,
  MARKDOWN_UPLOADING,
} from 'Actions/markdown';
import {
  clearNote,
  updateNoteFileName,
} from 'Actions/note';
import {
  getFolderByPos,
  getFolderByUuid,
  formatDate,
  pushStateToStorage,
  mergeStateFromStorage,
  checkSpecial,
} from 'Utils/utils';
import { getNote } from 'Utils/db/app';
import oneDriveLogo from 'Assets/images/onedrive.png';
import { POST_MEDIUM } from 'Actions/medium';

import SVGIcon from '../share/SVGIcon';

function mapStateToProps(state, ownProps) {
  const { projects: { notes, searchStatus, projectUuid, fileUuid, projects, pos }, app, markdown } = state;
  const { editor, sortBy, editorMode } = app.settings;
  return {
    projects,
    pos,
    parentsId: projectUuid,
    currentUuid: fileUuid,
    notes,
    editor,
    editorMode,
    sortBy,
    searchStatus,
    hasEdit: markdown.hasEdit,
    ...ownProps,
  };
}

function mapDispatchToProps(dispatch) {
  return {
    dispatch,
    switchFile: (...args) => dispatch(switchFile(...args)),
    createFile: (...args) => dispatch(createFile(...args)),
    readFile: (...args) => dispatch(readFile(...args)),
    deleteFile: (...args) => dispatch(deleteFile(...args)),
    trashBack: (...args) => dispatch(trashBack(...args)),
    clearMarkdown: (...args) => dispatch(clearMarkdown(...args)),
    renameFile: (...args) => dispatch(renameFile(...args)),
    updateFileDesc: (...args) => dispatch(updateFileDesc(...args)),
  };
}

@connect(mapStateToProps, mapDispatchToProps)
export default class Files extends Component {
  static displayName = 'ExplorerFiles';
  static propTypes = {
    dispatch: PropTypes.func.isRequired,
    parentsId: PropTypes.string.isRequired,
    notes: PropTypes.arrayOf(PropTypes.shape({
      uuid: PropTypes.string.isRequired,
      name: PropTypes.string.isRequired,
      description: PropTypes.string.isRequired,
      labels: PropTypes.arrayOf(PropTypes.string).isRequired,
      status: PropTypes.number.isRequired,
      oneDriver: PropTypes.number.isRequired,
    })).isRequired,
    projects: PropTypes.arrayOf(PropTypes.shape({
      uuid: PropTypes.string.isRequired,
      name: PropTypes.string.isRequired,
      description: PropTypes.string.isRequired,
      labels: PropTypes.arrayOf(PropTypes.string).isRequired,
      status: PropTypes.number.isRequired,
      children: PropTypes.array,
    })).isRequired,
    currentUuid: PropTypes.string.isRequired,
    editorMode: PropTypes.string.isRequired,
    searchStatus: PropTypes.number.isRequired,
    hasEdit: PropTypes.bool.isRequired,
    sortBy: PropTypes.oneOf(['normal', 'create-date', 'latest-date']).isRequired,
    pos: PropTypes.string.isRequired,
    // action functions
    switchFile: PropTypes.func.isRequired,
    createFile: PropTypes.func.isRequired,
    readFile: PropTypes.func.isRequired,
    deleteFile: PropTypes.func.isRequired,
    trashBack: PropTypes.func.isRequired,
    clearMarkdown: PropTypes.func.isRequired,
    renameFile: PropTypes.func.isRequired,
    updateFileDesc: PropTypes.func.isRequired,
  };

  state = {
    newFile: false,
    newFileTitle: 'New Note',
    contextStatus: '',
    renameUuid: -1,
    contextUuid: '',
    rename: '',
    reDesc: '',
    oneDriver: '',
  };

  componentDidMount() {
    ipcRenderer.send('MENUS:file-new-enbaled', {
      type: 'new-note',
      flag: true,
    });
    ipcRenderer.on('new-file', () => {
      this.setState({
        newFile: true,
      }, () => {
        this.newItemFocus();
      });
    });
    ipcRenderer.on('delete-file', this.handleDelete);
    ipcRenderer.on('rename-file', () => {
      this.setState({
        contextStatus: 'rename',
      }, () => {
        if (this.titleIpt) {
          this.titleIpt.focus();
        }
      });
    });
    ipcRenderer.on('file-edit-desc', () => {
      this.setState({
        contextStatus: 'redesc',
      }, () => {
        if (this.descIpt) {
          this.descIpt.focus();
        }
      });
    });
    ipcRenderer.on('upload-note-onedrive', () => {
      this.handleUpload();
    });
    // 收集将要导出的笔记的信息
    ipcRenderer.on('export-get-note-info', async (event, type) => {
      const { projectName } = this.props;
      const { name } = this.state.contextNote;
      ipcRenderer.send('NOTES:export-note', {
        projectName,
        fileName: name,
        type,
      });
    });
    // post markdown to medium
    ipcRenderer.on('post-medium', () => {
      const { projectName, dispatch } = this.props;
      const { name } = this.state.contextNote;
      const data = ipcRenderer.sendSync('NOTES:read-file', {
        projectName,
        fileName: name,
      });
      const content = data.data;
      dispatch({
        type: POST_MEDIUM,
        title: name,
        markdown: content,
      });
    });
  }

  componentDidUpdate(prevProps) {
    if (this.props.parentsId !== prevProps.parentsId) {
      this.props.switchFile('-1');
      this.resetStatus();
    }
  }

  componentWillUnmount() {
    [
      'new-file',
      'delete-file',
      'rename-file',
      'sort-note',
      'file-edit-desc',
      'upload-note-onedrive',
      'export-get-note-info',
    ].forEach(event => ipcRenderer.removeAllListeners(event));
    ipcRenderer.send('MENUS:file-new-enbaled', {
      type: 'new-note',
      flag: false,
    });
  }

  getNotes = () => {
    const { notes: files, sortBy, parentsId } = this.props;
    const notes = files.filter(item => item.parentsId === parentsId);
    let type;
    switch (sortBy) {
      case 'create-date':
        type = 'createDate';
        break;
      case 'latest-date':
        type = 'latestDate';
        break;
      default:
        type = 'normal';
        break;
    }
    if (type === 'normal') return notes.sort((next, current) => new Date(next.createDate) - new Date(current.createDate));
    return notes.sort((next, current) => new Date(current[type]) - new Date(next[type]));
  }

  getFileByParent(uuid) {
    const { notes, sortBy } = this.props;
    const files = notes.filter(item => item.parentsId === uuid && item.status === 1);
    let type;
    switch (sortBy) {
      case 'create-date':
        type = 'createDate';
        break;
      case 'latest-date':
        type = 'latestDate';
        break;
      default:
        type = 'normal';
        break;
    }
    if (type === 'normal') {
      return files.sort((next, current) => new Date(next.createDate) - new Date(current.createDate));
    }
    return files.sort((next, current) => new Date(current[type]) - new Date(next[type]));
  }

  getFileById(uuid) {
    const files = this.props.notes.filter(item => item.uuid === uuid);
    return files;
  }

  resetStatus() {
    this.setState({
      newFile: false,
    });
  }

  newItemFocus = () => {
    if (this.fileIpt) {
      this.fileIpt.focus();
    }
  }

  handleDelete = () => {
    const { currentUuid, pos, projects } = this.props;
    const { rename: name, contextUuid: uuid } = this.state;
    const head = getFolderByPos(projects, pos);
    const data = ipcRenderer.sendSync('NOTES:move-file-to-trash', {
      file: `${head.path}/${name}.md`,
      uuid,
    });
    if (!data.success) {
      message.error('delete file failed');
      return false;
    }
    if (data.code === 0) {
      this.props.deleteFile(uuid, false);
      this.props.trashBack();
      if (uuid === currentUuid) {
        this.props.clearMarkdown();
      }
    } else if (data.code === 1) { // 笔记已经不存在了
      message.error('file not exist');
      this.props.deleteFile(uuid, true);
      if (uuid === currentUuid) {
        this.props.clearMarkdown();
      }
    }
  }

  // 上传文件
  handleUpload = () => {
    const { contextNote: { uuid, name } } = this.state;
    const { parentsId, projectName, dispatch } = this.props;
    dispatch({
      type: MARKDOWN_UPLOADING,
      target: uuid,
    });
    dispatch({
      type: UPLOAD_NOTE_ONEDRIVE,
      param: {
        uuid,
        name,
        projectUuid: parentsId,
        projectName,
      },
      toolbar: true,
    });
  }

  // 右键菜单事件
  handleContextMenu = (event) => {
    event.stopPropagation();
    event.preventDefault();
    const { searchStatus } = this.props;
    if (searchStatus === 1) {
      return false;
    }
    ipcRenderer.send('MENUS:show-context-menu-explorer-file');
  }

  // 新建输入框改变事件
  handleChange = (e, type) => {
    const value = e.target.value;
    if (type === 'new') {
      this.setState({
        newFileTitle: value,
      });
    } else if (type === 'edit') {
      this.setState({
        rename: value,
      });
    } else if (type === 'desc') {
      this.setState({
        reDesc: value,
      });
    }
  }

  // 输入框聚焦
  handleFocus = (e) => {
    e.stopPropagation();
    e.target.select();
  }

  // 点击输入框
  handleIptClick = (e) => {
    e.stopPropagation();
  }

  // 输入框失焦事件
  handleBlur = (e, type) => {
    e.stopPropagation();
    if (type === 'new') { // 新建笔记
      this.createFile();
    } else if (type === 'edit') {
      this.editTitle();
    } else if (type === 'desc') {
      this.updateDesc();
    }
  }

  // 输入框回车键事件
  handleKeyDown = (e, type) => {
    if (e.keyCode === 13) {
      if (type === 'new') {
        this.createFile();
      } else if (type === 'edit') {
        this.editTitle();
      } else if (type === 'desc') {
        this.updateDesc();
      }
    } else if (e.keyCode === 27) {
      // cancel
      this.setState({
        newFile: false,
        newFileTitle: 'New Note',
        contextStatus: '',
        rename: '',
        reDesc: '',
      });
    }
  }

  /**
   * @description 新建笔记
   */
  createFile = () => {
    const value = this.state.newFileTitle || 'New Note';
    const name = value.trim();
    if (!checkSpecial(value)) {
      message.error('no special characters');
      return;
    }
    const { parentsId, projects, notes, pos } = this.props;
    const arr = notes.filter(item => (item.name === name && item.parentsId === parentsId && item.status === 1));
    if (arr.length !== 0) {
      message.error('file is exists.');
      this.setState({
        newFile: false,
        newFileTitle: 'New Note',
      });
      return;
    }
    const head = getFolderByPos(projects, pos);
    const fileData = ipcRenderer.sendSync('NOTES:create-file', `${head.path}/${value}.md`);
    if (!fileData.success) {
      message.error('Create file failed.');
      this.setState({
        newFile: false,
        newFileTitle: 'New Note',
      });
      return false;
    }
    this.setState({
      newFile: false,
      newFileTitle: 'New Note',
    });
    const createDate = (new Date()).toString();
    this.props.createFile({
      name,
      createDate,
      parentsId,
    });
  }

  editTitle = () => {
    const { currentUuid, pos, projects } = this.props;
    const { contextUuid, rename } = this.state;
    this.setState({
      contextStatus: '',
    });
    const oldFile = this.getFileById(contextUuid)[0];
    const name = rename.replace(/(^\s*|\s*$)/ig, '');
    if (oldFile.name === rename || !name) {
      // do nothing
      return;
    }
    if (!checkSpecial(name)) { // 检查长度和特殊字符
      message.error('no special characters');
      return;
    }
    const files = this.getFileByParent(currentUuid);
    const repeatArr = files.filter(item => item.name === name);
    if (repeatArr.length !== 0) {
      message.error('name repeat');
      return;
    }
    const head = getFolderByPos(projects, pos);
    const result = ipcRenderer.sendSync('NOTES:rename-file', {
      root: head.path,
      oldName: oldFile.name,
      newName: name,
    });
    if (!result.success) {
      message.error('rename failed');
      return false;
    }
    this.props.renameFile(contextUuid, name);
  }

  // 更新笔记描述
  updateDesc = () => {
    const { contextUuid, reDesc } = this.state;
    const oldFile = this.getFileById(contextUuid)[0];
    this.setState({
      contextStatus: '',
    });
    if (reDesc === oldFile.description) {
      // do nothing
      return;
    }
    this.props.updateFileDesc(contextUuid, reDesc);
  }

  // 选中当前笔记文件
  handleChoose = (item, folderPos) => {
    const { dispatch, parentsId, currentUuid, hasEdit, pos, projects } = this.props;
    if (currentUuid === item.uuid) {
      return false;
    }
    const currentPos = folderPos ? `${pos}-${folderPos}` : pos;
    const head = getFolderByPos(projects, currentPos);
    // 待完善
    // if (hasEdit) {
    //   const note = getNote(currentUuid);
    //   let needUpdateCloudStatus = false;
    //   if (note && note.oneDriver !== 0) {
    //     needUpdateCloudStatus = true;
    //   }
    //   dispatch(beforeSwitchSave(projectName, needUpdateCloudStatus));
    //   if (needUpdateCloudStatus) {
    //     dispatch(updateNoteUploadStatus(parentsId, currentUuid, 1));
    //   }
    // }
    this.props.switchFile(item.uuid);
    const data = ipcRenderer.sendSync('NOTES:read-file', `${head.path}/${item.name}.md`);
    if (!data.success) {
      message.error('Failed to read file data.');
      return false;
    }
    item.content = data.data;
    this.props.readFile(item);
  }

  handleItemMenu = (event, uuid, name, description, oneDriver) => {
    event.stopPropagation();
    event.preventDefault();
    this.setState({
      contextUuid: uuid,
      rename: name,
      reDesc: description,
      oneDriver,
    });
    const { searchStatus } = this.props;
    if (searchStatus === 1) {
      return false;
    }
    ipcRenderer.send('MENUS:show-context-menu-file-item');
  }

  renderCloudIcon = (status) => {
    if (status === 0) { // 未上传过
      return null;
    }
    let classname = '';
    switch (status) {
      case 1: // 有修改但未上传
        classname = 'need-upload';
        break;
      case 2: // 上传中
        classname = 'upload';
        break;
      case 3: // 上传成功
        classname = 'success';
        break;
      case 4:
        classname = 'fail';
        break;
      default:
        classname = '';
        break;
    }
    return (
      <span className={`clouds-item ${classname}`}>
        <img src={oneDriveLogo} alt="logo" className="cloud-logo" />
        {status === 2 ? (
          <Icon type="loading" />
        ) : null}
      </span>
    );
  }

  // 渲染新建文件
  renderNewFile() {
    const { newFileTitle } = this.state;
    return (
      <li className="file-list__item new" key="new">
        <div className="file-list__item__name">
          <Input
            className="edit"
            value={newFileTitle}
            onChange={e => this.handleChange(e, 'new')}
            onFocus={this.handleFocus}
            onBlur={e => this.handleBlur(e, 'new')}
            onKeyDown={e => this.handleKeyDown(e, 'new')}
            onClick={this.handleIptClick}
            ref={node => (this.fileIpt = node)}
          />
        </div>
      </li>
    );
  }

  renderFile(note, folderPos) {
    const { contextUuid, contextStatus, rename, reDesc } = this.state;
    const { currentUuid } = this.props;
    const { uuid, name, description, oneDriver } = note;
    const disabled = contextUuid !== uuid;
    let active = '';
    if (uuid === currentUuid) {
      active = 'cur';
    }
    return (
      <li
        key={`n-${uuid}`}
        className={`file-list__item ${active}`}
        onClick={() => this.handleChoose(note, folderPos)}
        onContextMenu={e => this.handleItemMenu(e, uuid, name, description, oneDriver)}
        role="presentation"
      >
        <div className="file-list__item__name">
          {!disabled && contextStatus === 'rename' ? (
            <Input
              value={rename}
              disabled={disabled}
              onChange={e => this.handleChange(e, 'edit')}
              onFocus={this.handleFocus}
              onBlur={e => this.handleBlur(e, 'edit')}
              onKeyDown={e => this.handleKeyDown(e, 'edit')}
              onClick={this.handleIptClick}
              ref={node => (this.titleIpt = node)}
            />
          ) : (
            <h3>{name}</h3>
          )}
        </div>
        <div className="file-list__item__desc row-3">
          {!disabled && contextStatus === 'redesc' ? (
            <Input.TextArea
              value={reDesc}
              onFocus={this.handleFocus}
              onClick={this.handleIptClick}
              onChange={e => this.handleChange(e, 'desc')}
              onBlur={e => this.handleBlur(e, 'desc')}
              onKeyDown={e => this.handleKeyDown(e, 'desc')}
              maxLength="64"
              placeholder="limit 64 chars"
              rows={3}
              ref={node => (this.descIpt = node)}
            />
          ) : (
            <p className="text-ellipsis-3">{note.description}</p>
          )}
        </div>
        <div className="file-list__item__date">
          <p className="text-ellipsis-1">{formatDate(note.latestDate)}</p>
        </div>
        <div className="file-list__item__border" />
        <ul className="clouds">
          {this.renderCloudIcon(note.oneDriver)}
        </ul>
      </li>
    );
  }

  renderNotes(head, pos) {
    if (!head || Array.isArray(head)) {
      return null;
    }
    const { name, uuid, children = [] } = head;
    const { newFile } = this.state;
    const files = this.getFileByParent(uuid);
    return (
      <Fragment key={uuid}>
        <h3 className="folder-name">{name}</h3>
        <ul className="file-list">
          {newFile && !pos ? this.renderNewFile() : (null) }
          {files.map(note => this.renderFile(note, pos))}
        </ul>
        {children.map((item, index) => {
          const folderPos = pos ? `${pos}-${index}` : index.toString();
          return this.renderNotes(item, folderPos);
        })}
      </Fragment>
    );
  }

  render() {
    const { parentsId, editorMode, pos, projects } = this.props;
    let rootClass = '';
    if (editorMode !== 'normal') {
      rootClass = 'hide';
    }
    if (parentsId === '-1') {
      return null;
    }
    let head = null;
    if (pos) {
      head = getFolderByPos(projects, pos).head;
    } else {
      head = getFolderByUuid(projects, parentsId).head;
    }
    return (
      <div className={`file-explorer fade-in ${rootClass}`} onContextMenu={this.handleContextMenu}>
        <Scrollbars>
          {this.renderNotes(head)}
        </Scrollbars>
      </div>
    );
  }
}
