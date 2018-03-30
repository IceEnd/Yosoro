import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Icon, Input, message } from 'antd';
import { ipcRenderer } from 'electron';
import { createProject, deleteProject, renameProject, trashBack, updateNoteUploadStatus } from '../../actions/projects';
import { beforeSwitchSave, clearMarkdown } from '../../actions/markdown';
import { switchProject, switchFile, clearWorkspace, updateNoteProjectName } from '../../actions/note';
import { pushStateToStorage, mergeStateFromStorage } from '../../utils/utils';
import { getNote } from '../../utils/db/app';

export default class Project extends Component {
  static displayName = 'NoteExplorerProject'
  static propTypes = {
    dispatch: PropTypes.func.isRequired,
    projects: PropTypes.arrayOf(PropTypes.shape({
      uuid: PropTypes.string.isRequired,
      name: PropTypes.string.isRequired,
      description: PropTypes.string.isRequired,
      labels: PropTypes.arrayOf(PropTypes.string).isRequired,
      status: PropTypes.number.isRequired,
      notes: PropTypes.array.isRequired,
    })).isRequired,
    currentUuid: PropTypes.string.isRequired,
    currentFileUuid: PropTypes.string.isRequired,
    editorMode: PropTypes.string.isRequired,
    searchStatus: PropTypes.number.isRequired,
    projectName: PropTypes.string.isRequired,
    hasEdit: PropTypes.bool.isRequired,
  };

  constructor() {
    super();
    this.state = mergeStateFromStorage('noteExplorerProjectState', {
      newProject: false,
      newProjectTitle: 'New Project',
      rename: {
        uuid: '',
        name: '',
      },
      contextProject: {
        uuid: '',
        name: '',
      },
    });
  }

  componentDidMount() {
    ipcRenderer.on('new-project', () => {
      this.setState({
        newProject: true,
      }, () => {
        this.newProjectIptFocus();
      });
    });
    ipcRenderer.on('delete-project', () => { // 删除项目
      const { dispatch, currentUuid, projectName } = this.props;
      const { uuid, name } = this.state.contextProject;
      const data = ipcRenderer.sendSync('move-project-to-trash', {
        name,
      });
      if (!data.success) {
        message.error('Delete failed.');
        return false;
      }
      // const newfolder = data.folder;
      if (uuid === currentUuid) {
        dispatch(beforeSwitchSave(projectName));
        dispatch(clearMarkdown());
        dispatch(clearWorkspace());
      }
      dispatch(trashBack());
      dispatch(deleteProject(uuid, projectName));
    });
    ipcRenderer.on('rename-project', () => {
      this.setState({
        rename: {
          uuid: this.state.contextProject.uuid,
          name: this.state.contextProject.name,
        },
      }, () => {
        if (this.titleIpt) {
          this.titleIpt.focus();
        }
      });
    });
  }

  componentWillUnmount() {
    pushStateToStorage('noteExplorerProjectStat', Object.assign({}, this.state, {
      rename: {
        uuid: '',
        name: '',
      },
      contextProject: {
        uuid: '',
        name: '',
        folder: '',
      },
    }));
    ipcRenderer.removeAllListeners('new-project');
    ipcRenderer.removeAllListeners('delete-project');
    ipcRenderer.removeAllListeners('rename-project');
  }

  // componentDidUpdate() {
  //   this.newPrjectIptFocus();
  // }

  // 新建项目输入框聚焦
  newProjectIptFocus = () => {
    if (this.projectIpt) {
      this.projectIpt.focus();
    }
  }

  // 新建项目输框聚焦事件
  handleNewProjectFocus = (e) => {
    e.stopPropagation();
    e.target.select();
  }

  // 新建项目输入框失焦事件
  handleNewProjectBlur = (e, type) => {
    e.stopPropagation();
    if (type === 'new') {
      const name = this.state.newProjectTitle || 'New Project';
      this.createProject(name);
    } else if (type === 'rename') {
      this.renameProject();
    }
  }

  // 唤起 Explorer 右键菜单
  handleExplorerMenu = (event) => {
    event.stopPropagation();
    event.preventDefault();
    const { searchStatus } = this.props;
    if (searchStatus === 1) {
      return false;
    }
    ipcRenderer.send('show-context-menu-explorer');
  }

  // 输入新建项目名称
  handleNewProjectTitle = (e, type) => {
    const title = e.target.value;
    if (type === 'new') {
      this.setState({
        newProjectTitle: title,
      });
    } else if (type === 'rename') {
      this.setState({
        rename: {
          uuid: this.state.contextProject.uuid,
          name: title,
        },
      });
    }
  }

  handleKeyDown = (e, type) => {
    if (e.keyCode === 13) {
      if (type === 'newProject') {
        const name = this.state.newProjectTitle || 'New Project';
        this.createProject(name);
      } else if (type === 'rename') {
        this.renameProject();
      }
    }
  }

  // 选择笔记本
  handleSelect = (uuid, name) => {
    const { dispatch, projectName, currentUuid, currentFileUuid, hasEdit } = this.props;
    if (uuid === currentUuid) {
      return false;
    }
    if (hasEdit) {
      let needUpdateCloudStatus = false;
      if (currentFileUuid && currentFileUuid !== '-1') {
        const note = getNote(currentFileUuid);
        if (note && note.oneDriver !== 0) {
          needUpdateCloudStatus = true;
        }
      }
      dispatch(beforeSwitchSave(projectName, needUpdateCloudStatus));
      if (needUpdateCloudStatus) {
        dispatch(updateNoteUploadStatus(currentUuid, currentFileUuid, 1));
      }
    }
    dispatch(switchProject(uuid, name));
    dispatch(clearMarkdown());
    dispatch(switchFile('-1')); // 清空选中笔记
  }

  createProject = (name) => {
    const folderData = ipcRenderer.sendSync('create-project', name); // 创建文件夹
    if (!folderData.success) {
      const error = folderData.error;
      if (error.errno === -17) { // 文件夹存在
        message.error('folder is exists.');
      } else {
        message.error('Create project failed.');
      }
      this.setState({
        newProject: false,
        newProjectTitle: 'New Project',
      });
      return false;
    }
    const createDate = (new Date()).toString();
    this.setState({
      newProject: false,
      newProjectTitle: 'New Project',
    });
    this.props.dispatch(createProject({
      name,
      createDate,
    }));
  }

  renameProject = () => {
    const { uuid, name } = this.state.rename;
    if (name === '' || name === this.state.contextProject.name) {
      this.setState({
        rename: {
          uuid: '',
          name: '',
        },
      });
    } else {
      const { dispatch, currentUuid } = this.props;
      const oldName = this.state.contextProject.name;
      const arr = this.props.projects.filter(item => item.name === name);
      if (arr.length !== 0) {
        message.error('Name repeat.');
        return false;
      }
      const data = ipcRenderer.sendSync('rename-project', {
        oldName,
        newName: name,
      });
      if (!data.success) {
        message.error('Rename notebook failed.');
        return false;
      }
      dispatch(renameProject(uuid, name));
      if (uuid === currentUuid) {
        dispatch(updateNoteProjectName(name));
      }
      this.setState({
        rename: {
          uuid: '',
          name: '',
        },
      });
    }
  }

  handleItemMenu = (event, uuid, name) => {
    event.stopPropagation();
    event.preventDefault();
    this.setState({
      contextProject: {
        uuid,
        name,
      },
    });
    const { searchStatus } = this.props;
    if (searchStatus === 1) {
      return false;
    }
    ipcRenderer.send('show-context-menu-project-item');
  }

  handleIptClick = (e) => {
    e.stopPropagation();
    e.preventDefault();
  }

  renderNewProject = () => {
    const { newProjectTitle } = this.state;
    return (
      <div className="project-list__li new">
        <div className="project-list__item">
          <span className="project-list__item__icon">
            <Icon type="book" />
          </span>
          <span className="project-list__item__name">
            <Input
              className="edit"
              value={newProjectTitle}
              onChange={e => this.handleNewProjectTitle(e, 'new')}
              onFocus={this.handleNewProjectFocus}
              onBlur={e => this.handleNewProjectBlur(e, 'new')}
              onKeyDown={e => this.handleKeyDown(e, 'newProject')}
              onClick={this.handleIptClick}
              ref={node => (this.projectIpt = node)}
            />
          </span>
        </div>
      </div>
    );
  }

  render() {
    const { projects, currentUuid, editorMode, searchStatus } = this.props;
    const { newProject, rename } = this.state;
    let rootClass = '';
    let noResultTip = 'No notes have been created.';
    if (searchStatus === 1) {
      noResultTip = 'No notes were found.';
    }
    if (editorMode !== 'normal') {
      rootClass = 'hide';
    }
    if (projects.length === 0) {
      return (
        <div
          className={`project-explorer ${rootClass}`}
          onContextMenu={this.handleExplorerMenu}
        >
          <ul
            className="project-list height-block"
          >
            { newProject ? this.renderNewProject() : (
              <p className="tips no-select">{noResultTip}</p>
            ) }
          </ul>
        </div>
      );
    }
    return (
      <div
        className={`project-explorer ${rootClass}`}
        onContextMenu={this.handleExplorerMenu}
      >
        <ul
          className="project-list"
        >
          {projects.map((item) => {
            const { uuid, name, status } = item;
            if (status === 0) { // 删除
              return null;
            }
            let disabled = true;
            if (rename.uuid === uuid) {
              disabled = false;
            }
            let active = '';
            if (uuid === currentUuid) {
              active = 'cur';
            }
            return (
              <li
                key={`p-${uuid}`}
                className={`project-list__li ${active}`}
                onClick={() => this.handleSelect(item.uuid, name)}
                onContextMenu={e => this.handleItemMenu(e, uuid, name)}
                role="presentation"
              >
                <div className="project-list__item">
                  <div className="project-list__item__icon">
                    <Icon type="book" />
                  </div>
                  <div className="project-list__item__name">
                    {disabled ? (
                      <h3>{name}</h3>
                    ) : (
                      <Input
                        size="small"
                        className="edit"
                        value={rename.name}
                        disabled={disabled}
                        onChange={e => this.handleNewProjectTitle(e, 'rename')}
                        onFocus={this.handleNewProjectFocus}
                        onBlur={e => this.handleNewProjectBlur(e, 'rename')}
                        onKeyDown={e => this.handleKeyDown(e, 'rename')}
                        onClick={this.handleIptClick}
                        ref={node => (this.titleIpt = node)}
                      />
                    )}
                  </div>
                </div>
              </li>
            );
          })}
          { newProject ? this.renderNewProject() : (null) }
        </ul>
      </div>
    );
  }
}
