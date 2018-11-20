import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Scrollbars } from 'react-custom-scrollbars';
import NoteItem from '../share/notebook/NoteItem';
import HOCList from './HOCList';

@HOCList('projects')
export default class Projects extends Component {
  static displayName = 'TrashProjects';
  static propTypes = {
    projects: PropTypes.arrayOf(PropTypes.shape({
      uuid: PropTypes.string.isRequired,
      name: PropTypes.string.isRequired,
      description: PropTypes.string.isRequired,
      labels: PropTypes.arrayOf(PropTypes.string).isRequired,
      status: PropTypes.number.isRequired,
      notes: PropTypes.array.isRequired,
    })).isRequired,
    handleGoIn: PropTypes.func.isRequired,
    openRestore: PropTypes.func.isRequired,
    openRemove: PropTypes.func.isRequired,
  }

  render() {
    const { projects } = this.props;
    if (projects.length === 0) {
      return (
        <div className="content">
          <p className="tips">Trash can is empty.</p>
        </div>
      );
    }
    return (
      <Scrollbars autoHide>
        <div className="content">
          <ul className="list">
            {this.props.projects.map((item) => {
              const { uuid, name } = item;
              return (
                <NoteItem
                  key={`trash-project-${uuid}`}
                  className="list-item"
                  type="notebook"
                  hasRestore
                  hasLogin
                  hasRemove
                  itemClick={() => this.props.handleGoIn(uuid, name)}
                  restoreFn={this.props.openRestore}
                  removeFn={this.props.openRemove}
                  item={item}
                />
              );
            })}
          </ul>
        </div>
      </Scrollbars>
    );
  }
}
