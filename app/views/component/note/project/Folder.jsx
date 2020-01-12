import React, { Component } from 'react';
import { Tree, Icon, Input, message } from 'antd';
import PropTypes from 'prop-types';
import { ipcRenderer } from 'electron';
import { connect } from 'react-redux';

import {
  createProject,
  renameProject,
  toggleExpanededKeys,
  deleteProject,
  updateNoteUploadStatus,
  switchProject,
} from 'Actions/projects';
import { clearMarkdown } from 'Actions/markdown';
import { checkSpecial } from 'Utils/utils';
import { getNote } from 'Utils/db/app';

const { TreeNode, DirectoryTree } = Tree;

function mapStateToProps(state, ownProps) {
  const { projects, app, markdown } = state;
  const { editor, sortBy, editorMode } = app.settings;
  return {
    ...projects,
    ...ownProps,
    editor,
    editorMode,
    sortBy,
    hasEdit: markdown.hasEdit,
  };
}

function mapDispatchToProps(dispatch) {
  return {
    dispatch,
    createFolder: (...args) => dispatch(createProject(...args)),
    renameFolder: (...args) => dispatch(renameProject(...args)),
    deleteFolder: (...args) => dispatch(deleteProject(...args)),
    switchFolder: (...args) => dispatch(switchProject(...args)),
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
    projectUuid: PropTypes.string.isRequired,
    fileUuid: PropTypes.string.isRequired,
    // editorMode: PropTypes.string.isRequired,
    searchStatus: PropTypes.number.isRequired,
    hasEdit: PropTypes.bool.isRequired,
    expandedKeys: PropTypes.array.isRequired,
    // actions func
    toggleExpanededKeys: PropTypes.func.isRequired,
    createFolder: PropTypes.func.isRequired,
    renameFolder: PropTypes.func.isRequired,
    deleteFolder: PropTypes.func.isRequired,
    switchFolder: PropTypes.func.isRequired,
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
    ipcRenderer.on('new-folder', () => this.setStatus('new', 'newIpt', true));
    ipcRenderer.on('rename-folder', () => this.setStatus('rename', 'renameIpt'));
    ipcRenderer.on('delete-folder', this.handleDelete);
  }

  componentWillUnmount() {
    [
      'new-folder',
      'rename-folder',
      'delete-folder',
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

  handleCheckbox = (e, name) => {
    this.setState({
      [name]: e.target.checked,
    });
  }

  handleSelect = (keys, e) => {
    const pos = e.selectedNodes[0].props.pos;
    const { dispatch, projectUuid, fileUuid, hasEdit } = this.props;
    const uuid = keys.shift();
    if (uuid === projectUuid) {
      return false;
    }
    if (hasEdit) {
      let needUpdateCloudStatus = false;
      if (fileUuid && fileUuid !== '-1') {
        const note = getNote(fileUuid);
        if (note && note.oneDriver !== 0) {
          needUpdateCloudStatus = true;
        }
      }
      if (needUpdateCloudStatus) {
        dispatch(updateNoteUploadStatus(projectUuid, fileUuid, 1));
      }
    }
    this.props.switchFolder(uuid, pos);
    dispatch(clearMarkdown());
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
        value: '',
        rename: '',
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

  handleDelete = () => {
    const { contextPos, contextUuid } = this.state;
    this.props.deleteFolder(contextUuid, contextPos);
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
      value: '',
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
      rename: '',
    });
  }

  walkNode = projects =>
    projects.map((item) => {
      const { children, uuid, status, name } = item;
      if (status === -1) {
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
    const { expandedKeys, projects, projectUuid } = this.props;
    return (
      <div className="folder-tree">
        <DirectoryTree
          showIcon
          expandedKeys={expandedKeys}
          switcherIcon={<Icon type="down" />}
          onSelect={this.handleSelect}
          onRightClick={this.handleItemMenu}
          onExpand={this.handleExpand}
          selectedKeys={[projectUuid]}
        >
          <TreeNode
            title="Folder"
            key="root"
            className="folder-root"
            icon={<Icon type="book" />}
          >
            {this.renderCreateFolder('root')}
            {this.walkNode(projects)}
          </TreeNode>
        </DirectoryTree>
      </div>
    );
  }
}
