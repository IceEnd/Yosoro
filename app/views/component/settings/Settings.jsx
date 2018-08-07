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
        // dispatch={props.dispatch}
        {...props.imageHostingConfig}
      />
      <MediumConfig
        // dispatch={props.dispatch}
        medium={props.mediumConfig.medium}
      />
    </div>
  </div>
);

Settings.displayName = 'YsosoroSettings';
Settings.propTypes = {
  // dispatch: PropTypes.func.isRequired,
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
  mediumConfig: PropTypes.shape({
    medium: PropTypes.shape({
      id: PropTypes.string.isRequired,
      username: PropTypes.string.isRequired,
      token: PropTypes.string.isRequired,
      url: PropTypes.string.isRequired,
      imageUrl: PropTypes.string.isRequired,
      publishStatus: PropTypes.string.isRequired,
    }).isRequired,
  }).isRequired,
};

export default Settings;
