import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { withDispatch } from 'Components/HOC/context';
import { CHANGE_FONT_SIZE } from 'Actions/app';
import Module from '../Module';
import FontSize from './FontSize';

const MIN_SIZE = 12;
const MAX_SIZE = 32;

@withDispatch
export default class General extends PureComponent {
  static displayName = 'SettingsGeneral';
  static propTypes = {
    dispatch: PropTypes.func.isRequired,
    fontSize: PropTypes.number.isRequired,
    previewFontSize: PropTypes.number.isRequired,
  }

  handleFontSize = (type = 'editor', value) => {
    if (typeof value !== 'number') {
      return;
    }
    if (value < MIN_SIZE && value > MAX_SIZE) {
      return;
    }
    this.props.dispatch({
      type: CHANGE_FONT_SIZE,
      fontType: type,
      fontSize: value,
    });
  }

  render() {
    const { fontSize, previewFontSize } = this.props;
    return (
      <Module
        title="General"
        id="anchor-general"
        className="general-settings"
      >
        <FontSize
          type="editor"
          title="Editor Font Size"
          minSize={MIN_SIZE}
          maxSize={MAX_SIZE}
          fontSize={fontSize}
          onChange={this.handleFontSize}
        />

        <FontSize
          type="preview"
          title="Preview Font Size"
          minSize={MIN_SIZE}
          maxSize={MAX_SIZE}
          fontSize={previewFontSize}
          onChange={this.handleFontSize}
        />
      </Module>
    );
  }
}
