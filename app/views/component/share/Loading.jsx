import React from 'react';
import PropTypes from 'prop-types';
import loadingImg from '../../assets/images/loading.svg';

const Loading = props => (
  <div className="loading-default">
    <img src={loadingImg} alt="" />
    <p className="loading-tips" style={{ color: '#923f2b' }}>{props.tip}</p>
  </div>
);

Loading.displayName = 'Loading';
Loading.propTypes = {
  tip: PropTypes.string.isRequired,
};
Loading.defaultProps = {
  tip: 'Loading...',
};

export default Loading;
