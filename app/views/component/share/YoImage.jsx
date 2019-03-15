import React, { useState } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';

const YoImage = ({ src, title, alt }) => {
  const [loading, setLoading] = useState(0);
  const [width, setWidth] = useState('0px');
  const [height, setHeight] = useState('0px');
  let wrap;

  if (loading === 0) {
    const img = new Image();
    img.onload = () => {
      if (wrap) {
        const { clientWidth, clientHeight } = wrap;
        const { width: imgWidth, height: imgHeight } = img;

        const wrapRatio = clientWidth / clientHeight;
        const imgRatio = imgWidth / imgHeight;
        if (imgRatio > wrapRatio) { // 图片宽高比大
          setHeight('100%');
          setWidth(`${clientHeight * imgRatio}px`);
        } else if (imgRatio < wrapRatio) { // 图片宽高比小
          setWidth('100%');
          setHeight(`${clientWidth / imgRatio}px`);
        } else { // 宽高比相等
          setHeight('100%');
          setWidth('100%');
        }
      }
      setLoading(1);
    };
    img.onerror = () => setLoading(-1);
    img.src = src;
  }

  const imgClass = classNames('yo-img', {
    show: loading === 1,
  });
  const shadowClass = classNames('yo-image', {
    hide: loading === 1,
  });
  return (
    <div className="yo-image" ref={node => (wrap = node)}>
      <div className={shadowClass} />
      <img
        className={imgClass}
        src={src}
        title={title}
        alt={alt}
        style={{ width, height }}
      />
    </div>
  );
};

YoImage.displayName = 'YoImage';
YoImage.propTypes = {
  src: PropTypes.string.isRequired,
  title: PropTypes.string.isRequired,
  alt: PropTypes.string.isRequired,
};
YoImage.defaultProps = {
  title: 'yo-image',
  alt: 'yo-image',
};

export default YoImage;
