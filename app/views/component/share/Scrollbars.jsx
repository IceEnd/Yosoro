import React from 'react';
import { Scrollbars } from 'react-custom-scrollbars';
import PropTypes from 'prop-types';

const CustomScrollbars = props =>
  (
    <Scrollbars
      {...props}
      renderTrackHorizontal={hprops => <div {...hprops} className="yo-track-horizontal" />}
      renderTrackVertical={vprops => <div {...vprops} className="yo-track-vertical" />}
    >
      {props.children}
    </Scrollbars>
  );
CustomScrollbars.displayName = 'CustomScrollbars';
CustomScrollbars.propTypes = {
  children: PropTypes.element,
};
CustomScrollbars.defaultProps = {
  autoHide: true,
};

export default CustomScrollbars;
