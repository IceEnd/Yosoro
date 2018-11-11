import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Input, message, Icon } from 'antd';
import { ipcRenderer } from 'electron';
import { withDispatch } from 'Components/HOC/context';

import { createFile, renameNote, deletNote, updateNoteDesc, trashBack, updateNoteUploadStatus, UPLOAD_NOTE_ONEDRIVE } from 'Actions/projects';
import { formatDate, pushStateToStorage, mergeStateFromStorage, checkSpecial } from 'Utils/utils';
import { readFile, beforeSwitchSave, saveContentToTrashFile, updateCurrentTitle, clearMarkdown, MARKDOWN_UPLOADING } from 'Actions/markdown';
import { switchFile, clearNote, updateNoteFileName } from 'Actions/note';
import { getNote } from 'Utils/db/app';
import oneDriveLogo from 'Assets/images/onedrive.png';
import { POST_MEDIUM } from 'Actions/medium';

import SVGIcon from '../share/SVGIcon';

@withDispatch
export default class Files extends Component {
  static displayName = 'NoteExplorerFiles';
  static propTypes = {
    dispatch: PropTypes.func.isRequired,
    parentsId: PropTypes.string.isRequired,
    projectName: PropTypes.string.isRequired,
    notes: PropTypes.arrayOf(PropTypes.shape({
      uuid: PropTypes.string.isRequired,
      name: PropTypes.string.isRequired,
      description: PropTypes.string.isRequired,
      labels: PropTypes.arrayOf(PropTypes.string).isRequired,
      status: PropTypes.number.isRequired,
      oneDriver: PropTypes.number.isRequired,
    })).isRequired,
    currentUuid: PropTypes.string.isRequired,
    editorMode: PropTypes.string.isRequired,
    searchStatus: PropTypes.number.isRequired,
    hasEdit: PropTypes.bool.isRequired,
    sortBy: PropTypes.oneOf(['normal', 'create-date', 'latest-date']).isRequired,
  };

  constructor() {
    super();
    this.state = mergeStateFromStorage('noteExplorerFilesState', {
      newFile: false,
      newFileTitle: 'New Note',
      renameUuid: -1,
      newName: '',
      contextNote: {
        uuid: '',
        name: '',
        description: '',
        oneDriver: 0,
      },
      rename: {
        uuid: '',
        name: '',
      },
      desc: {
        uuid: '',
        value: '',
      },
    });
    this.selectNew = false;
  }

  componentDidMount() {
    ipcRenderer.send('file-new-enbaled', {
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
    ipcRenderer.on('delete-note', () => {
      const { projectName, parentsId, dispatch, currentUuid } = this.props;
      const { name, uuid } = this.state.contextNote;
      const data = ipcRenderer.sendSync('move-file-to-trash', {
        name,
        projectName,
      });
      if (!data.success) {
        message.error('Delete note failed.');
        return false;
      }
      if (data.code === 0) {
        dispatch(deletNote(uuid, parentsId, name, projectName, false));
        dispatch(trashBack());
        if (uuid === currentUuid) {
          dispatch(saveContentToTrashFile(projectName));
          dispatch(clearMarkdown());
          dispatch(clearNote());
        }
      } else if (data.code === 1) { // 笔记已经不存在了
        message.error('Note does not exist.');
        dispatch(deletNote(uuid, parentsId, name, projectName, true));
        if (uuid === currentUuid) {
          dispatch(clearMarkdown());
          dispatch(clearNote());
        }
      }
    });
    ipcRenderer.on('rename-note', () => {
      const { contextNote: { uuid, name } } = this.state;
      this.setState({
        rename: {
          uuid,
          name,
        },
      }, () => {
        if (this.titleIpt) {
          this.titleIpt.focus();
        }
      });
    });
    ipcRenderer.on('node-add-desc', () => {
      const { uuid, description } = this.state.contextNote;
      this.setState({
        desc: {
          uuid,
          value: description,
        },
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
    ipcRenderer.on('export-get-note-info', (event, type) => {
      const { projectName } = this.props;
      const { name } = this.state.contextNote;
      ipcRenderer.send('export-note', {
        projectName,
        fileName: name,
        type,
      });
    });
    // post markdown to medium
    ipcRenderer.on('post-medium', () => {
      const { projectName, dispatch } = this.props;
      const { name } = this.state.contextNote;
      const data = ipcRenderer.sendSync('read-file', {
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

  /* eslint-disable react/no-deprecated */
  componentWillReceiveProps(nextProps) {
    if (this.props.parentsId === nextProps.parentsId && this.selectNew) {
      const { dispatch, projectName } = this.props;
      const item = nextProps.notes[0];
      dispatch(beforeSwitchSave(projectName));
      dispatch(switchFile(item.uuid, item.name));
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
      this.selectNew = false;
    }
    return true;
  }
  /* eslint-enable react/no-deprecated */

  componentWillUnmount() {
    pushStateToStorage('noteExplorerFilesState', Object.assign({}, this.state, {
      contextNote: {
        uuid: '',
        name: '',
        description: '',
      },
      rename: {
        uuid: '',
        name: '',
      },
      desc: {
        uuid: '',
        value: '',
      },
    }));
    ipcRenderer.removeAllListeners('new-file');
    ipcRenderer.removeAllListeners('delete-note');
    ipcRenderer.removeAllListeners('rename-note');
    ipcRenderer.removeAllListeners('sort-note');
    ipcRenderer.removeAllListeners('node-add-desc');
    ipcRenderer.removeAllListeners('upload-note-onedrive');
    ipcRenderer.removeAllListeners('export-get-note-info');
    ipcRenderer.send('file-new-enbaled', {
      type: 'new-note',
      flag: false,
    });
  }

  getNotes = () => {
    const { notes, sortBy } = this.props;
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

  newItemFocus = () => {
    if (this.fileIpt) {
      this.fileIpt.focus();
    }
  }

  // 上传文件
  handleUpload = () => {
    const { contextNote: { uuid, name } } = this.state;
    const { parentsId, projectName, dispatch } = this.props;
    dispatch({
      type: MARKDOWN_UPLOADING,
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
    ipcRenderer.send('show-context-menu-explorer-file');
  }

  // 新建输入框改变事件
  handleChange = (e, type) => {
    const title = e.target.value;
    if (type === 'new') {
      this.setState({
        newFileTitle: title,
      });
    } else if (type === 'edit') {
      this.setState({
        rename: {
          uuid: this.state.contextNote.uuid,
          name: title,
        },
      });
    } else if (type === 'desc') {
      this.setState({
        desc: {
          uuid: this.state.contextNote.uuid,
          value: title,
        },
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
    }
  }

  /**
   * @description 新建笔记
   */
  createFile = () => {
    const value = this.state.newFileTitle || 'New Note';
    const name = value.replace(/(^\s*|\s*$)/ig, '');
    if (!checkSpecial(value)) {
      return;
    }
    const { parentsId, projectName, notes } = this.props;
    const arr = notes.filter(item => item.name === name);
    if (arr.length !== 0) {
      message.error('File is exists.');
      this.setState({
        newFile: false,
        newFileTitle: 'New Note',
      });
      return false;
    }
    const fileData = ipcRenderer.sendSync('create-file', {
      name,
      projectName,
    });
    if (!fileData.success) {
      message.error('Create file failed.');
      this.setState({
        newFile: false,
        newFileTitle: 'New Note',
      });
      return false;
    }
    // const file = fileData.file;
    this.setState({
      newFile: false,
      newFileTitle: 'New Note',
    });
    const createDate = (new Date()).toString();
    this.props.dispatch(createFile({
      name,
      createDate,
      parentsId,
    }));
    this.selectNew = true;
  }

  editTitle = () => {
    const { parentsId, dispatch, projectName } = this.props;
    const { uuid, name: value } = this.state.rename;
    const name = value.replace(/(^\s*|\s*$)/ig, '');
    if (!checkSpecial(value)) { // 检查长度和特殊字符
      return;
    }
    if (name === '' || name === this.state.contextNote.name) {
      this.setState({
        rename: {
          uuid: '',
          name: '',
        },
      });
    } else {
      const oldName = this.state.contextNote.name;
      const arr = this.props.notes.filter(item => item.name === name);
      if (arr.length !== 0) {
        message.error('Name repeat.');
        return false;
      }
      const data = ipcRenderer.sendSync('rename-note', {
        oldName,
        newName: name,
        projectName,
      });
      if (!data.success) {
        message.error('Rename notebook failed.');
        return false;
      }
      dispatch(renameNote(uuid, name, parentsId));
      dispatch(updateCurrentTitle(uuid, name));
      dispatch(updateNoteFileName(name));
      this.setState({
        rename: {
          uuid: '',
          name: '',
        },
      });
    }
  }

  // 更新笔记描述
  updateDesc = () => {
    const { uuid, value } = this.state.desc;
    if (value === this.state.contextNote.description) {
      this.setState({
        desc: {
          uuid: '',
          value: '',
        },
      });
      return false;
    }
    const { parentsId, dispatch } = this.props;
    dispatch(updateNoteDesc(uuid, value, parentsId));
    this.setState({
      desc: {
        uuid: '',
        value: '',
      },
    });
  }

  // 选中当前笔记文件
  handleChoose = (item) => {
    const { dispatch, projectName, parentsId, currentUuid, hasEdit } = this.props;
    if (currentUuid === item.uuid) {
      return false;
    }
    if (hasEdit) {
      const note = getNote(currentUuid);
      let needUpdateCloudStatus = false;
      if (note && note.oneDriver !== 0) {
        needUpdateCloudStatus = true;
      }
      dispatch(beforeSwitchSave(projectName, needUpdateCloudStatus));
      if (needUpdateCloudStatus) {
        dispatch(updateNoteUploadStatus(parentsId, currentUuid, 1));
      }
    }
    dispatch(switchFile(item.uuid, item.name));
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

  handleItemMenu = (event, uuid, name, description, oneDriver) => {
    event.stopPropagation();
    event.preventDefault();
    this.setState({
      contextNote: {
        uuid,
        name,
        description,
        oneDriver,
      },
    });
    const { searchStatus } = this.props;
    if (searchStatus === 1) {
      return false;
    }
    ipcRenderer.send('show-context-menu-file-item');
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
      <div className="file-list__item new">
        <div className="file-list__item__root">
          <span className="file-list__item__icon">
            <SVGIcon
              className="file-list__item__icon__svg"
              viewBox="0 0 48 48"
              id="#icon_svg_markdown"
              useClassName="icon-use"
            />
          </span>
          <span className="file-list__item__name">
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
          </span>
        </div>
        <div className="file-list__item__info" />
      </div>
    );
  }

  render() {
    const { currentUuid, editorMode, sortBy } = this.props;
    const { newFile, rename, desc } = this.state;
    const notes = this.getNotes();
    let rootClass = '';
    if (editorMode !== 'normal' && editorMode !== 'write') {
      rootClass = 'hide';
    }
    if (notes.length === 0) {
      return (
        <div className={`file-explorer ${rootClass}`} onContextMenu={this.handleContextMenu}>
          <ul
            className="file-list height-block"
          >
            { newFile ? this.renderNewFile() : (
              <p className="tips no-select">No notes have been created.</p>
            )}
          </ul>
        </div>
      );
    }
    return (
      <div className={`file-explorer fade-in ${rootClass}`} onContextMenu={this.handleContextMenu}>
        <ul
          className="file-list"
        >
          {newFile && sortBy !== 'normal' ? this.renderNewFile() : (null) }
          {notes.map((note) => {
            const { uuid, status, name, description, oneDriver } = note;
            if (status === 0) { // 删除
              return null;
            }
            let disabled = true;
            let edit = '';
            if (rename.uuid === uuid) {
              disabled = false;
              edit = 'edit';
            }
            let active = '';
            if (uuid === currentUuid) {
              active = 'cur';
            }
            return (
              <li
                key={`n-${uuid}`}
                className={`file-list__item ${active}`}
                onClick={() => this.handleChoose(note)}
                onContextMenu={e => this.handleItemMenu(e, uuid, name, description, oneDriver)}
                role="presentation"
              >
                <div className="file-list__item__root">
                  <span className="file-list__item__icon">
                    <SVGIcon
                      className="file-list__item__icon__svg"
                      viewBox="0 0 48 48"
                      id="#icon_svg_markdown"
                      useClassName="icon-us"
                    />
                  </span>
                  <span className="file-list__item__name">
                    {disabled ? (
                      <h3>{name}</h3>
                    ) : (
                      <Input
                        className={edit}
                        value={rename.name}
                        disabled={disabled}
                        onChange={e => this.handleChange(e, 'edit')}
                        onFocus={this.handleFocus}
                        onBlur={e => this.handleBlur(e, 'edit')}
                        onKeyDown={e => this.handleKeyDown(e, 'edit')}
                        onClick={this.handleIptClick}
                        ref={node => (this.titleIpt = node)}
                      />
                    )}
                  </span>
                </div>
                <div className="file-list__item__info">
                  <div className="file-list__item__info__desc">
                    {desc.uuid === uuid ? (
                      <Input
                        value={desc.value}
                        onFocus={this.handleFocus}
                        onClick={this.handleIptClick}
                        onChange={e => this.handleChange(e, 'desc')}
                        onBlur={e => this.handleBlur(e, 'desc')}
                        onKeyDown={e => this.handleKeyDown(e, 'desc')}
                        maxLength="20"
                        placeholder="Limit 20 chars."
                        ref={node => (this.descIpt = node)}
                      />
                    ) : (
                      <p>{note.description}</p>
                    )}
                  </div>
                  <div className="file-list__item__info__desc" />
                  <div className="file-list__item__info__desc">
                    <p className="date-p">{formatDate(note.latestDate)}</p>
                  </div>
                </div>
                <ul className="clouds">
                  {this.renderCloudIcon(note.oneDriver)}
                </ul>
              </li>
            );
          })}
          {newFile && sortBy === 'normal' ? this.renderNewFile() : (null) }
        </ul>
      </div>
    );
  }
}
