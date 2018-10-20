import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { withDispatch } from 'Components/HOC/context';
import { CHANGE_APP_SETTINGS } from 'Actions/app';
import Module from './Module';
import FontSize from './share/FontSize';
import Switch from './share/Switch';
import SavePath from './share/SavePath';
import Selector from './share/Selector';

const MIN_SIZE = 12;
const MAX_SIZE = 36;

@withDispatch
export default class General extends PureComponent {
  static displayName = 'SettingsGeneral';
  static propTypes = {
    dispatch: PropTypes.func.isRequired,
    theme: PropTypes.string.isRequired,
    fontSize: PropTypes.number.isRequired,
    previewFontSize: PropTypes.number.isRequired,
    cursorPosition: PropTypes.number.isRequired,
    showLoading: PropTypes.func.isRequired,
    closeLoading: PropTypes.func.isRequired,
  }

  handleChange = (type, value) => {
    if (type === 'fontSize' || type === 'previewFontSize') {
      if (typeof value !== 'number') {
        return;
      }
      if (value < MIN_SIZE && value > MAX_SIZE) {
        return;
      }
    }
    this.props.dispatch({
      type: CHANGE_APP_SETTINGS,
      target: type,
      value,
    });
  }

  render() {
    const { fontSize, previewFontSize, cursorPosition, showLoading, theme, closeLoading } = this.props;
    return (
      <Module
        title="General"
        id="anchor-general"
        className="general-settings"
      >

        <Selector
          type="theme"
          title="Theme"
          options={[{
            label: 'Light',
            value: 'light',
          }, {
            label: 'Dark',
            value: 'dark',
          }]}
          value={theme}
          onChange={this.handleChange}
        />

        <FontSize
          type="editor.fontSize"
          title="Editor Font Size"
          minSize={MIN_SIZE}
          maxSize={MAX_SIZE}
          fontSize={fontSize}
          onChange={this.handleChange}
        />

        <FontSize
          type="editor.previewFontSize"
          title="Preview Font Size"
          minSize={MIN_SIZE}
          maxSize={MAX_SIZE}
          fontSize={previewFontSize}
          onChange={this.handleChange}
        />

        <SavePath
          showLoading={showLoading}
          closeLoading={closeLoading}
        />

        <Switch
          type="cursorPosition"
          title="Cursor Position"
          value={cursorPosition}
          onChange={this.handleChange}
          tips="View positioning based on the cursor position of the editor."
        />

      </Module>
    );
  }
}
