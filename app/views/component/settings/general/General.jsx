import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { withDispatch } from 'Components/HOC/withDispatch';
import Module from '../Module';
import FontSize from './FontSize';

/* eslint-disable */
@withDispatch
export default class General extends Component {
  static displayName = 'SettingsGeneral';
  static propTypes = {
    dispatch: PropTypes.func.isRequired,
    editorFontSize: PropTypes.number.isRequired,
    previewFontSize: PropTypes.number.isRequired,
  }

  static defaultProps = {
    editorFontSize: 14,
    previewFontSize: 16,
  }

  handleFontSize = (type = 'editor', value) => {
    console.log(value);
  }

  render() {
    const { editorFontSize, previewFontSize } = this.props;
    return (
      <Module
        title="General"
        id="anchor-general"
        className="general-settings"
      >
        <FontSize
          type="editor"
          title="Editor Font Size"
          fontSize={editorFontSize}
          onChange={this.handleFontSize}
        />

        <FontSize
          type="preview"
          title="Preview Font Size"
          fontSize={previewFontSize}
          onChange={this.handleFontSize}
        />
      </Module>
    );
  }
}
