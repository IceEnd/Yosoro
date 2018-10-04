import React from 'react';
import PropTypes from 'prop-types';
import loadingImg from '../../assets/images/loading.svg';

const Loading = (props) => {
  const { className, tip } = props;
  const classStr = className ? `loading-default ${className}` : 'loading-default';
  return (
    <div className={classStr}>
      <img src={loadingImg} alt="" />
      <p className="loading-tips">{tip}</p>
    </div>
  );
};

Loading.displayName = 'Loading';
Loading.propTypes = {
  tip: PropTypes.string.isRequired,
  className: PropTypes.string,
};
Loading.defaultProps = {
  tip: 'Loading...',
};

export default Loading;
