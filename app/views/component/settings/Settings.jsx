import React from 'react';
import PropTypes from 'prop-types';
import Title from 'Share/title/Title';
import ImageHosting from './ImageHosting';

import '../../assets/scss/settings.scss';

const Settings = props => (
  <div className="settings-root">
    <Title
      title="Settings"
      iconType="setting"
    />
    <div className="modules">
      <ImageHosting {...props.imageHosting} />
    </div>
  </div>
);

Settings.displayName = 'YsosoroSettings';
Settings.propTypes = {
  imageHosting: PropTypes.shape({
    default: PropTypes.oneOf(['github']).isRequired,
    github: PropTypes.shape({
      repo: PropTypes.string.isRequired,
      branch: PropTypes.string.isRequired,
      token: PropTypes.string.isRequired,
      path: PropTypes.string.isRequired,
      domain: PropTypes.string.isRequired,
    }).isRequired,
  }).isRequired,
};

export default Settings;
