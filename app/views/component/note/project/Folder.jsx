import React, { Component } from 'react';
import { Tree, Icon, Input } from 'antd';
import PropTypes from 'prop-types';
import { ipcRenderer } from 'electron';

import { withDispatch } from 'Components/HOC/context';
import { CREATE_PROJECT, TOGGLE_FOLDER_EXPANEDED_KEYS, deleteProject, renameProject, trashBack, updateNoteUploadStatus } from 'Actions/projects';
import { beforeSwitchSave, clearMarkdown } from 'Actions/markdown';
import { switchProject, switchFile, clearWorkspace, updateNoteProjectName } from 'Actions/note';
import { pushStateToStorage, mergeStateFromStorage, checkSpecial } from 'Utils/utils';
import { getNote } from 'Utils/db/app';
import Layer from './Layer';

const { TreeNode } = Tree;

@withDispatch
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
  };

  constructor() {
    super();
    const initState = mergeStateFromStorage('noteExplorerProjectFolderState', {
      rename: {
        uuid: '',
        name: '',
      },
      contextFolder: {
        uuid: '',
        pos: '',
      },
    });
    this.state = Object.assign(initState, {
      status: '',
      value: '',
    });
  }

  componentDidMount() {
    ipcRenderer.on('new-folder', () => {
      this.createFolder();
    });
  }

  componentWillUnmount() {
    ipcRenderer.removeAllListeners('new-folder');
    pushStateToStorage('noteExplorerProjectFolderState', Object.assign({}, this.state, {
      rename: {
        uuid: '',
        name: '',
      },
      contextFolder: {
        uuid: '',
        pos: '',
      },
    }));
  }

  createFolder() {
    // const { contextFolder: { uuid, pos } } = this.state;

    // this.props.dispatch({
    //   type: CREATE_PROJECT,
    //   uuid,
    //   pos,
    // });
    this.setState({
      status: 'new',
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
    this.props.dispatch({
      type: TOGGLE_FOLDER_EXPANEDED_KEYS,
      expandedKeys,
    });
  }

  handleItemMenu = ({ event, node }) => {
    event.stopPropagation();
    event.preventDefault();
    const { eventKey, pos } = node.props;
    this.setState({
      contextFolder: {
        uuid: eventKey,
        pos,
      },
    });
    const { searchStatus } = this.props;
    if (searchStatus === 1) {
      // do nothing
      return;
    }
    ipcRenderer.send('MENUS:show-context-menu-project-item');
  }

  handleInput = e => this.setState({ value: e.target.value })

  walkNode = projects =>
    projects.map((item) => {
      const { children, uuid, status } = item;
      if (status === 0) {
        return null;
      }
      if (children) {
        // todo
        // title reactDOM
        return (
          <TreeNode
            className={`f-${uuid}`}
            icon={<Icon type="folder" />}
            title={item.name}
            key={uuid}
          >
            {this.renderCreateFolder(uuid)}
            {this.walkNode(children)}
          </TreeNode>
        );
      }
      return (
        <TreeNode
          icon={<Icon type="folder" />}
          title={item.name}
          key={uuid}
        />
      );
    })

  renderCreateFolder = (uuid) => {
    const { status, contextFolder, value } = this.state;
    if (status === 'new' && uuid === contextFolder.uuid) {
      const title = (
        <input
          value={value}
          onChange={this.handleInput}
        />
      );
      return (
        <TreeNode
          key={`n-${uuid}`}
          title={title}
        />
      );
    }
    return null;
  }

  render() {
    const { expandedKeys, projects } = this.props;
    return (
      <div>
        Folder
        <div>
          <Tree
            showIcon
            expandedKeys={expandedKeys}
            blockNode
            switcherIcon={<Icon type="down" />}
            onSelect={this.handleSelect}
            onRightClick={this.handleItemMenu}
            onExpand={this.handleExpand}
          >
            {this.walkNode(projects)}
          </Tree>
        </div>
        <Layer />
      </div>
    );
  }
}
