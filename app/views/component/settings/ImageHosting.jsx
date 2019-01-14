import React from 'react';
import PropTypes from 'prop-types';

import GitHub from './images/GitHub';
import Weibo from './images/Weibo';

import Module from './Module';


const ImageHosting = (props) => {
  const { id, github, weibo } = props;
  return (
    <Module
      title="Image Hosting"
      id={id}
    >
      <GitHub key="github" {...github} />

      <Weibo key="weibo" {...weibo} />
    </Module>
  );
};

ImageHosting.displayName = 'SettingsImagesHosting';
ImageHosting.propTypes = {
  github: PropTypes.shape({
    repo: PropTypes.string.isRequired,
    branch: PropTypes.string.isRequired,
    token: PropTypes.string.isRequired,
    path: PropTypes.string.isRequired,
    domain: PropTypes.string.isRequired,
  }).isRequired,
  weibo: PropTypes.shape({
    username: PropTypes.string.isRequired,
    password: PropTypes.string.isRequired,
    cookie: PropTypes.string.isRequired,
    useCookie: PropTypes.bool.isRequired,
  }),
  id: PropTypes.string.isRequired,
};

export default ImageHosting;
