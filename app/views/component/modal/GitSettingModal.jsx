import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Modal } from 'antd';

export default class GitSettingModal extends Component {
  static displayName = 'GitSettingModal';
  static propTypes = {
    visible: PropTypes.bool.isRequired,
  }

  render() {
    const { visible } = this.props;
    return (
      <Modal
        title="Git Settings"
        visible={visible}
      >
      </Modal>
    )
  }
}
  