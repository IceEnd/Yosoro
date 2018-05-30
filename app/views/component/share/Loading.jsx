import React from 'react';
import PropTypes from 'prop-types';
import { Spin } from 'antd';

const Loading = props => (
  <div className="loading-default">
    <Spin size="large" tip={props.tip} />
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
