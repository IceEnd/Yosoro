import React, { Component } from 'react';
import PropTypes from 'prop-types';
import ToolBar from './ToolBar';
import Projects from './Projects';
import Files from './Files';

import '../../assets/scss/trash.scss';

export default class ImageHosting extends Component {
  static displayName = 'Transh';
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
    trash: PropTypes.shape({
      projectName: PropTypes.string.isRequired,
      projectUuid: PropTypes.string.isRequired,
    }).isRequired,
  }

  getNotes = () => {
    const { trash: { projectUuid }, projects } = this.props;
    let notes;
    const length = projects.length;
    for (let i = 0; i < length; i++) {
      if (projectUuid === projects[i].uuid) {
        notes = projects[i].notes;
        break;
      }
    }
    return notes || [];
  }

  render() {
    const { projects, trash, dispatch } = this.props;
    let isRoot = true;
    if (trash.projectName !== '' && trash.projectUuid !== '-1') {
      isRoot = false;
    }
    const notes = this.getNotes();
    return (
      <div className="trash">
        <ToolBar
          dispatch={dispatch}
          trash={trash}
        />
        {isRoot ? (
          <Projects projects={projects} dispatch={dispatch} trash={trash} />
        ) : (
          <Files notes={notes} dispatch={dispatch} trash={trash} />
        )}
      </div>
    );
  }
}
