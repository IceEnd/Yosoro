import React from 'react';
import PropTypes from 'prop-types';

const SVGIcon = (props) => {
  const { className, id, viewBox, useClassName, version } = props;
  const useHtml = `<use class="${useClassName}" xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="${id}" />`;
  return (
    <svg
      className={className}
      viewBox={viewBox}
      version={version}
      dangerouslySetInnerHTML={{ __html: useHtml }}
    />
  );
};

SVGIcon.displayName = 'SVGIcon';
SVGIcon.propTypes = {
  className: PropTypes.string.isRequired,
  id: PropTypes.string.isRequired,
  viewBox: PropTypes.string.isRequired,
  useClassName: PropTypes.string.isRequired,
  version: PropTypes.string,
};
SVGIcon.defaultProps = {
  className: '',
  id: '',
  useClassName: '',
  version: '1.1',
};

export default SVGIcon;
