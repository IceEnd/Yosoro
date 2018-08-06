import React from 'react';
import PropTypes from 'prop-types';
import Title from 'Share/title/Title';
import ImageHosting from './ImageHosting';
import MediumConfig from './MediumConfig';

import '../../assets/scss/settings.scss';

const Settings = props => (
  <div className="settings-root">
    <Title
      title="Settings"
      iconType="setting"
    />
    <div className="modules">
      <ImageHosting
        {...props.imageHostingConfig}
      />
      <MediumConfig
        medium={props.medium}
      />
    </div>
  </div>
);

Settings.displayName = 'YsosoroSettings';
Settings.propTypes = {
  imageHostingConfig: PropTypes.shape({
    default: PropTypes.oneOf(['github']).isRequired,
    github: PropTypes.shape({
      repo: PropTypes.string.isRequired,
      branch: PropTypes.string.isRequired,
      token: PropTypes.string.isRequired,
      path: PropTypes.string.isRequired,
      domain: PropTypes.string.isRequired,
    }).isRequired,
  }).isRequired,
  medium: PropTypes.shape({
    id: PropTypes.string.isRequired,
    username: PropTypes.string.isRequired,
    token: PropTypes.string.isRequired,
    url: PropTypes.string.isRequired,
    imageUrl: PropTypes.string.isRequired,
    publishStatus: PropTypes.string.isRequired,
  }).isRequired,
};

export default Settings;
