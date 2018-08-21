import React, { Fragment } from 'react';
import PropTypes from 'prop-types';
import { Anchor, Icon } from 'antd';
import Title from 'Share/title/Title';
import ImageHosting from './ImageHosting';
import MediumConfig from './MediumConfig';
import General from './general/General';
import About from './About';

import '../../assets/scss/settings.scss';

const { Link } = Anchor;

type LinkTitleProps = {
  type: string,
  title: string,
};

const LinkTitle = (props: LinkTitleProps) => (
  <Fragment>
    <Icon type={props.type} /> {props.title}
  </Fragment>
);
LinkTitle.displayName = 'LinkTitle';
LinkTitle.propTypes = {
  type: PropTypes.string.isRequired,
  title: PropTypes.string.isRequired,
};

const TOC_ITMES = [
  {
    href: '#/settings#anchor-general',
    title: 'General',
    type: 'layout',
  }, {
    href: '#/settings#anchor-image-hosting',
    title: 'Image Hosting',
    type: 'picture',
  }, {
    href: '#/settings#anchor-medium',
    title: 'Medium',
    type: 'medium',
  },
  {
    href: '#/settings#anchor-about',
    title: 'About',
    type: 'copyright',
  },
];

const SettingsToc = () => (
  <div className="settings-toc">
    <Anchor
      affix
      getContainer={() => document.querySelector('#modules')}
    >
      { TOC_ITMES.map(item => (
        <Link
          href={item.href}
          title={(
            <LinkTitle type={item.type} title={item.title} />
          )}
        />
      ))}
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
      <General
        key="general-config"
        {...props.editor}
      />
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

      <About
        key="about-config"
        id="anchor-about"
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
  editor: PropTypes.shape({
    fontSize: PropTypes.number.isRequired,
    previewFontSize: PropTypes.number.isRequired,
  }).isRequired,
};

export default Settings;
