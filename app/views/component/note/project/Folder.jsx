import React, { Component, Fragment } from 'react';
import { Tree, Icon, Input, Modal, Checkbox, message } from 'antd';
import PropTypes from 'prop-types';
import { ipcRenderer } from 'electron';
import { connect } from 'react-redux';

import {
  createProject,
  renameProject,
  toggleExpanededKeys,
  deleteProject,
  trashBack,
  updateNoteUploadStatus,
} from 'Actions/projects';
import { beforeSwitchSave, clearMarkdown } from 'Actions/markdown';
import { switchProject, switchFile, clearWorkspace, updateNoteProjectName } from 'Actions/note';
import { pushStateToStorage, mergeStateFromStorage, checkSpecial } from 'Utils/utils';
import { getNote } from 'Utils/db/app';
// import Layer from './Layer';

const { TreeNode, DirectoryTree } = Tree;

function mapStateToProps(state, ownProps) {
  const { projects, app, markdown, note } = state;
  const { editor, sortBy, editorMode } = app.settings;
  const { fileUuid: currentFileUuid, projectUuid: currentUuid, projectName } = note;
  return {
    ...projects,
    ...ownProps,
    editor,
    editorMode,
    sortBy,
    currentUuid,
    currentFileUuid,
    hasEdit: markdown.hasEdit,
    projectName,
  };
}

function mapDispatchToProps(dispatch) {
  return {
    dispatch,
    createFolder: (...args) => dispatch(createProject(...args)),
    renameFolder: (...args) => dispatch(renameProject(...args)),
    toggleExpanededKeys: (...args) => dispatch(toggleExpanededKeys(...args)),
  };
}

@connect(mapStateToProps, mapDispatchToProps)
export default class Folder extends Component {
  static displayName = 'NoteExplorerProjectFolder';
  static propTypes = {
    dispatch: PropTypes.func.isRequired,
    projects: PropTypes.arrayOf(PropTypes.shape({
      uuid: PropTypes.string.isRequired,
      name: PropTypes.string.isRequired,
      description: PropTypes.string.isRequired,
      labels: PropTypes.arrayOf(PropTypes.string).isRequired,
      status: PropTypes.number.isRequired,
      children: PropTypes.array,
    })).isRequired,
    currentUuid: PropTypes.string.isRequired,
    currentFileUuid: PropTypes.string.isRequired,
    editorMode: PropTypes.string.isRequired,
    searchStatus: PropTypes.number.isRequired,
    projectName: PropTypes.string.isRequired,
    hasEdit: PropTypes.bool.isRequired,
    expandedKeys: PropTypes.array.isRequired,
    // actions func
    toggleExpanededKeys: PropTypes.func.isRequired,
    createFolder: PropTypes.func.isRequired,
    renameFolder: PropTypes.func.isRequired,
  };

  state = {
    status: 'normal',
    value: '',
    contextUuid: '',
    contextPos: '',
    contextTitle: '',
    rename: '',
    deleteWarn: true,
    moveFileToTrash: true,
  };

  componentDidMount() {
    ipcRenderer.on('new-folder', () => this.setStatus('new', 'newIpt'));
    ipcRenderer.on('rename-folder', () => this.setStatus('rename', 'renameIpt'));
    ipcRenderer.on('delete-project', () => this.deleteConfrim());
  }

  componentWillUnmount() {
    [
      'new-folder',
      'rename-folder',
      'delete-project',
    ].forEach(item => ipcRenderer.removeAllListeners(item));
  }

  setStatus(value, ipt, toggle = false) {
    if (toggle) {
      this.props.toggleExpanededKeys(this.state.contextUuid, 'add');
    }
    this.setState({
      status: value,
    }, () => {
      if (this[ipt]) {
        this[ipt].focus();
      }
    });
  }

  deleteConfrim() {
    const {
      contextTitle,
      deleteWarn,
      moveFileToTrash,
    } = this.state;
    const content = (
      <Fragment>
        <p>This operation cannot be restored.</p>
        <div>
          <Checkbox
            checked={moveFileToTrash}
            onChange={e => this.handleCheckbox(e, 'moveFileToTrash')}
          >Move the file to the Trash</Checkbox>
        </div>
        <div>
          <Checkbox
            checked={deleteWarn}
            onChange={e => this.handleCheckbox(e, 'deleteWarn')}
          >Do not ask me again</Checkbox>
        </div>
      </Fragment>
    );
    Modal.confirm({
      title: `Are you sure you want to delete '${contextTitle}' and its contents?`,
      content,
      centered: true,
      maskClosable: true,
      okText: 'Delete',
    });
  }

  handleCheckbox = (e, name) => {
    this.setState({
      [name]: e.target.checked,
    });
  }

  handleSelect = (keys) => {
    const { dispatch, projectName, currentUuid, currentFileUuid, hasEdit } = this.props;
    const uuid = keys.shift();
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
    dispatch(switchFile('-1', '')); // clear current file
  }

  handleExpand = (expandedKeys) => {
    this.props.toggleExpanededKeys(expandedKeys);
  }

  handleItemMenu = ({ event, node }) => {
    event.stopPropagation();
    event.preventDefault();
    const { eventKey, pos, title } = node.props;
    this.setState({
      contextUuid: eventKey,
      contextPos: pos,
      contextTitle: title,
    });
    const { searchStatus } = this.props;
    if (searchStatus === 1) {
      // do nothing
      return;
    }
    ipcRenderer.send('MENUS:show-context-menu-project-item', eventKey);
  }

  handleInput = e => this.setState({ value: e.target.value })

  handleFocus = (e) => {
    e.stopPropagation();
    e.target.select();
  }

  handleBlur = (e, type = 'new') => {
    e.stopPropagation();
    if (type === 'new') {
      this.createFolder();
    } else if (type === 'rename') {
      this.renameFolder(e);
    }
  }

  handleKeyDown = (e, type) => {
    const keyCode = e.keyCode;
    if (keyCode === 27) {
      // esc
      this.setState({
        status: 'normal',
      });
      return;
    }
    if (keyCode === 13) {
      // return
      if (type === 'new') {
        this.createFolder();
      } else if (type === 'rename') {
        this.renameFolder(e);
      }
    }
  }

  handleIptClick = (e) => {
    e.stopPropagation();
    e.preventDefault();
  }

  checkValue(name) {
    if (!name.length) {
      // do nothing
      this.setState({
        status: 'normal',
      });
      return false;
    }
    if (!checkSpecial(name)) {
      message.error('no special characters.');
      return false;
    }
    return true;
  }

  createFolder() {
    const name = this.state.value.trim();
    if (!this.checkValue(name)) {
      return;
    }
    this.setState({
      status: 'normal',
    }, () => {
      const { contextUuid, contextPos } = this.state;
      this.props.createFolder(contextUuid, contextPos, name);
    });
  }

  renameFolder(e) {
    const name = e.target.value.trim();
    if (!this.checkValue(name)) {
      return;
    }
    const { contextUuid, contextPos } = this.state;
    this.props.renameFolder(contextUuid, contextPos, name);
    this.setState({
      status: 'normal',
    });
  }

  walkNode = projects =>
    projects.map((item) => {
      const { children, uuid, status, name } = item;
      if (status === 0) {
        return null;
      }
      return (
        <TreeNode
          icon={<Icon type="folder" />}
          title={this.renderNodeTitle(uuid, name)}
          key={uuid}
        >
          {this.renderCreateFolder(uuid)}
          {this.walkNode(children || [])}
        </TreeNode>
      );
    })

  renderNodeTitle = (uuid, name) => {
    const { status, contextUuid } = this.state;
    if (status !== 'rename' || uuid !== contextUuid) {
      return name;
    }
    return (
      <Input
        className="folder-rename"
        size="small"
        defaultValue={name}
        onBlur={e => this.handleBlur(e, 'rename')}
        onKeyDown={e => this.handleKeyDown(e, 'rename')}
        onClick={this.handleIptClick}
        ref={node => (this.renameIpt = node)}
      />
    );
  }

  renderCreateFolder = (uuid) => {
    const { status, contextUuid, value } = this.state;
    if (status === 'new' && uuid === contextUuid) {
      const title = (
        <Input
          size="small"
          value={value}
          onChange={this.handleInput}
          onFocus={this.handleFocus}
          onBlur={e => this.handleBlur(e, 'new')}
          onKeyDown={e => this.handleKeyDown(e, 'new')}
          onClick={this.handleIptClick}
          ref={node => (this.newIpt = node)}
        />
      );
      return (
        <TreeNode
          key={`n-${uuid}`}
          title={title}
          className="new-folder-node"
        />
      );
    }
    return null;
  }

  render() {
    const { expandedKeys, projects, currentUuid } = this.props;
    return (
      <div className="folder-tree">
        <DirectoryTree
          showIcon
          expandedKeys={expandedKeys}
          switcherIcon={<Icon type="down" />}
          onSelect={this.handleSelect}
          onRightClick={this.handleItemMenu}
          onExpand={this.handleExpand}
          selectedKeys={[currentUuid]}
        >
          <TreeNode
            title={(<h3>Folder</h3>)}
            key="root"
            className="folder-root"
            icon={null}
          >
            {this.renderCreateFolder('root')}
            {this.walkNode(projects)}
          </TreeNode>
        </DirectoryTree>
      </div>
    );
  }
}
