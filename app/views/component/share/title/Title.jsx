import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { Icon } from 'antd';

import './title.scss';

export default class ToolBar extends PureComponent {
  static displayName = 'PageTitle';
  static propTypes = {
    title: PropTypes.string.isRequired,
    hasBack: PropTypes.bool.isRequired,
    iconType: PropTypes.string,
    handleBack: PropTypes.func,
  }

  static defaultProps = {
    hasBack: false,
  }

  handleBack = () => {
    if (this.props.handleBack) {
      this.props.handleBack();
    }
  }

  render() {
    const { title, hasBack, iconType } = this.props;
    return (
      <div className="page-title">
        <h3 className="title">
          {iconType ? (
            <Icon className="icon" type={iconType} />
          ) : null}
          {title}
        </h3>
        {hasBack ? (
          <span
            className="back"
            onClick={this.handleBack}
          >
            <Icon type="left-circle-o" />
          </span>
        ) : null}
      </div>
    );
  }
}
