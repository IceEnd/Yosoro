import React from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';
import loadingImg from '../../assets/images/loading.svg';

const Loading = React.memo((props) => {
  const { className, tip, fullScreen } = props;
  let classStr = className ? `loading-default ${className}` : 'loading-default';
  classStr = classnames(classStr, {
    'loading-fullscreen': fullScreen,
  });
  return (
    <div className={classStr}>
      <img src={loadingImg} alt="" />
      <p className="loading-tips">{tip}</p>
    </div>
  );
});

Loading.displayName = 'Loading';
Loading.propTypes = {
  tip: PropTypes.string.isRequired,
  className: PropTypes.string,
  fullScreen: PropTypes.bool,
};
Loading.defaultProps = {
  tip: 'Loading...',
  fullScreen: false,
};

export default Loading;
