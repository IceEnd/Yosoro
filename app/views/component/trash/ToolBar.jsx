import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import Title from 'Share/title/Title';
import { trashBack } from 'Actions/projects';

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
    let hasBack = false;
    let title = 'Trash';
    let iconType = 'delete';
    if (projectUuid !== '-1' && projectName !== '') {
      hasBack = true;
      title = projectName;
      iconType = 'book';
    }
    return (
      <Title
        title={title}
        iconType={iconType}
        hasBack={hasBack}
        handleBack={this.handleClick}
      />
    );
  }
}
