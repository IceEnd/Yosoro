import React, { Component, Fragment } from 'react';
import PropTypes from 'prop-types';
import { Modal, List } from 'antd';
import { ipcRenderer } from 'electron';
import { withDispatch } from 'Components/HOC/context';
import { updateNoteParentsId } from 'Actions/projects';
import Project from './Project';
import Files from './Files';
import { pushStateToStorage, mergeStateFromStorage } from '../../utils/utils';

const ListItem = List.Item;

@withDispatch
export default class Explorer extends Component {
  static displayName = 'NoteExplorer';
  static propTypes = {
    dispatch: PropTypes.func.isRequired,
    projects: PropTypes.arrayOf(PropTypes.shape({
      uuid: PropTypes.string.isRequired,
      name: PropTypes.string.isRequired,
      description: PropTypes.string.isRequired,
      labels: PropTypes.arrayOf(PropTypes.string).isRequired,
      notes: PropTypes.array.isRequired,
      status: PropTypes.number.isRequired,
    })).isRequired,
    note: PropTypes.shape({
      projectUuid: PropTypes.string.isRequired,
      projectName: PropTypes.string.isRequired,
      fileUuid: PropTypes.string.isRequired,
    }).isRequired,
    editorMode: PropTypes.string.isRequired,
    searchStatus: PropTypes.number.isRequired,
    hasEdit: PropTypes.bool.isRequired,
  };

  constructor() {
    super();
    this.state = mergeStateFromStorage('noteExplorerState', {
      searchStatus: 0, // 0: 未搜索 1: 搜索中 2: 搜索完成
      projectsModalVisible: false,
    });
  }

  componentDidMount() {
    ipcRenderer.on('move-to', () => {
      this.setProjectsModalVisible(true);
    });
  }

  componentWillUnmount() {
    ipcRenderer.removeAllListeners('move-to');
    pushStateToStorage('noteExplorerState', this.state);
  }

  setProjectsModalVisible = (visible) => {
    this.setState({
      projectsModalVisible: visible,
    });
  }

  getNotes() {
    const { note: { projectUuid } } = this.props;
    const { projects } = this.props;
    let notes = [];
    for (let i = 0, length = projects.length; i < length; i++) {
      if (projectUuid === projects[i].uuid) {
        notes = projects[i].notes;
      }
    }
    return notes;
  }

  moveFileToProject(e, project) {
    const { dispatch, note: { fileUuid, fileName, projectUuid, projectName } } = this.props;
    e.preventDefault();
    ipcRenderer.sendSync('move-file-to-project', {
      name: fileName,
      projectName,
      target: project.name,
    });
    dispatch(updateNoteParentsId(fileUuid, projectUuid, project.uuid));
    this.setProjectsModalVisible(false);
  }

  render() {
    const { editorMode, projects, dispatch, note: { projectUuid, fileUuid, projectName }, searchStatus, hasEdit } = this.props;
    const { projectsModalVisible } = this.state;
    const notes = this.getNotes();
    return (
      <Fragment>
        <Project
          projects={projects}
          dispatch={dispatch}
          currentUuid={projectUuid}
          currentFileUuid={fileUuid}
          editorMode={editorMode}
          searchStatus={searchStatus}
          projectName={projectName}
          hasEdit={hasEdit}
        />
        { projectUuid === '-1' ? (null) : (
          <Files
            dispatch={dispatch}
            notes={notes}
            parentsId={projectUuid}
            currentUuid={fileUuid}
            projectName={projectName}
            editorMode={editorMode}
            searchStatus={searchStatus}
            hasEdit={hasEdit}
          />
        )}
        <Modal
          title="Move to"
          width={320}
          mask={false}
          footer={null}
          centered
          visible={projectsModalVisible}
        >
          <List
            dataSource={projects}
            renderItem={project => (
              <ListItem>
                <a onClick={e => this.moveFileToProject(e, project)}>{project.name}</a>
              </ListItem>
            )}
          />
        </Modal>
      </Fragment>
    );
  }
}
