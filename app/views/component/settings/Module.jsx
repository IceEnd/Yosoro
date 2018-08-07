import React from 'react';
import PropTypes from 'prop-types';

const Module = (props) => {
  const { title, children } = props;
  return (
    <div className="settings-module">
      <h2 className="module-title">
        <span>{title}</span>
      </h2>
      {children}
    </div>
  );
};

Module.displayName = 'SettingsModule';
Module.propTypes = {
  title: PropTypes.string.isRequired,
  children: PropTypes.node,
};

export default Module;
