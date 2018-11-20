import React, { Component, Fragment } from 'react';
import PropTypes from 'prop-types';
import { Anchor, Icon } from 'antd';
import { Scrollbars } from 'react-custom-scrollbars';
import Title from 'Share/title/Title';
import ImageHosting from './ImageHosting';
import MediumConfig from './MediumConfig';
import General from './General';
import About from './About';
import Loading from '../share/Loading';

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
    href: '#/settings#anchor-publish',
    title: 'Publish',
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

export default class Settings extends Component {
  static displayName = 'YsosoroSettings';
  static propTypes = {
    theme: PropTypes.string.isRequired,
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
      cursorPosition: PropTypes.number.isRequired,
    }).isRequired,
    sortBy: PropTypes.oneOf(['normal', 'create-date', 'latest-date']).isRequired,
  };

  constructor() {
    super();
    this.state = {
      loading: false,
      loadingTip: 'Loading',
    };
  }

  showLoading = (tip) => {
    this.setState({
      loading: true,
      loadingTip: tip,
    });
  }

  closeLoading = () => {
    this.setState({
      loading: false,
      loadingTip: 'Loading',
    });
  }

  render() {
    const { editor, imageHostingConfig, mediumConfig, theme, sortBy } = this.props;
    const { loading, loadingTip } = this.state;
    return (
      <div className="settings-root">
        <Title
          title="Settings"
          iconType="setting"
        />
        <SettingsToc />
        <div className="modules" id="modules">
          <Scrollbars autoHide>
            <General
              key="general-config"
              theme={theme}
              {...editor}
              showLoading={this.showLoading}
              closeLoading={this.closeLoading}
              sortBy={sortBy}
            />
            <ImageHosting
              key="image-hosting-config"
              id="anchor-image-hosting"
              {...imageHostingConfig}
            />
            <MediumConfig
              key="medium-config"
              id="anchor-publish"
              medium={mediumConfig.medium}
            />

            <About
              key="about-config"
              id="anchor-about"
            />
          </Scrollbars>
        </div>

        {loading ? (
          <Loading
            className="settings-loading"
            tip={loadingTip}
          />
        ) : null}
      </div>
    );
  }
}
