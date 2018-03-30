import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { Icon } from 'antd';
import { trashBack } from '../../actions/projects';

export default class ToolBar extends PureComponent {
  static displayName = 'TrashToolBar';
  static propTypes = {
    dispatch: PropTypes.func.isRequired,
    trash: PropTypes.shape({
      projectName: PropTypes.string.isRequired,
      projectUuid: PropTypes.string.isRequired,
    }).isRequired,
  }

  handleClick = () => {
    this.props.dispatch(trashBack());
  }

  render() {
    const { trash: { projectUuid, projectName } } = this.props;
    let isBack = false;
    let title = 'Trash';
    if (projectUuid !== '-1' && projectName !== '') {
      isBack = true;
      title = projectName;
    }
    return (
      <div className="trash-toolbar">
        <h3 className="title">
          {isBack ? (<Icon className="icon" type="book" />) : (<Icon className="icon" type="delete" />)}
          {title}
        </h3>
        {isBack ? (
          <span
            className="back"
            onClick={this.handleClick}
          >
            <Icon type="left-circle-o" />
          </span>
        ) : null}
      </div>
    );
  }
}
