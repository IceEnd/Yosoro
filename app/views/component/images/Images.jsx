import React from 'react';
import PropTypes from 'prop-types';
import { Empty, Icon } from 'antd';
import { Scrollbars } from 'react-custom-scrollbars';
import { clipboard } from 'electron';
import Title from 'Share/title/Title';
import YoImage from 'Share/YoImage';

import 'Assets/scss/images.scss';
/* eslint-disable no-underscore-dangle */

const copy = (url) => {
  try {
    clipboard.writeText(url);
  } catch (err) {
    // err
  }
};

const Images = ({ list }) => (
  <div className="images-root">
    <Title
      title="Images"
      iconType="picture"
    />
    {list.length === 0 ? (
      <div className="content">
        <Empty className="empty" />
      </div>
    ) : (
      <Scrollbars autoHide className="yo-scrollbar">
        <div className="content">
          <ul className="list">
            {list.map(item => (
              <li
                key={item._id}
                className="item"
              >
                <div className="image-wrap">
                  <YoImage
                    src={item.url}
                    title={item.name}
                    alt={item.url}
                  />
                </div>
                <div className="image-options">
                  <Icon type="copy" onClick={() => copy(item.url)} />
                  <Icon type="delete" />
                </div>
              </li>
            ))}
          </ul>
        </div>
      </Scrollbars>
    )}
  </div>
);

Images.displayName = 'ImagesRouter';
Images.propTypes = {
  list: PropTypes.arrayOf(PropTypes.shape({
    _id: PropTypes.string.isRequired,
    url: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
  })).isRequired,
};

export default Images;
