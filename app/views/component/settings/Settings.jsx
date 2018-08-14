import React from 'react';
import PropTypes from 'prop-types';
import { Anchor } from 'antd';
import Title from 'Share/title/Title';
import ImageHosting from './ImageHosting';
import MediumConfig from './MediumConfig';

import '../../assets/scss/settings.scss';

const { Link } = Anchor;

const SettingsToc = () => (
  <div className="settings-toc">
    <Anchor
      affix
      getContainer={() => document.querySelector('#modules')}
    >
      <Link href="#anchor-image-hosting" title="Image Hosting" />
      <Link href="#anchor-medium" title="Medium" />
    </Anchor>
  </div>
);

SettingsToc.displayName = 'SettingsToc';

const Settings = props => (
  <div className="settings-root">
    <Title
      title="Settings"
      iconType="setting"
    />
    <SettingsToc />
    <div className="modules" id="modules">
      <ImageHosting
        key="image-hosting-config"
        id="anchor-image-hosting"
        {...props.imageHostingConfig}
      />
      <MediumConfig
        key="medium-config"
        id="anchor-medium"
        medium={props.mediumConfig.medium}
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
