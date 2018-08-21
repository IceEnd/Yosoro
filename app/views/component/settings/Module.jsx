import React from 'react';
import PropTypes from 'prop-types';

const Module = (props) => {
  const { title, children, id, className } = props;
  let classValue = '';
  if (typeof className !== 'undefined') {
    classValue = className;
  }
  return (
    <div className={`settings-module ${classValue}`} id={id} >
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
  id: PropTypes.string.isRequired,
  className: PropTypes.string,
  children: PropTypes.node,
};

export default Module;
