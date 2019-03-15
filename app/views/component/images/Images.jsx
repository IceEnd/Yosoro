import React from 'react';
import PropTypes from 'prop-types';
import { Empty, Button } from 'antd';
import { Scrollbars } from 'react-custom-scrollbars';
import Title from 'Share/title/Title';
import YoImage from 'Share/YoImage';

import 'Assets/scss/images.scss';
/* eslint-disable no-underscore-dangle */

const Images = ({ list }) => (
  <div className="images-root">
    <Title
      title="Images"
      iconType="picture"
    />

    <Scrollbars autoHide>
      <div className="content">
        {list.length === 0 ? (
          <Empty className="empty" />
        ) : (
          <ul className="list">
            {list.map(item => (
              <li
                key={item._id}
                className="item"
              >
                <div className="image-wrap">
                  <YoImage
                    src={item.url}
                  />
                </div>
                <div className="image-options">
                  <Button type="dashed" icon="copy" />
                  <Button type="dashed" icon="delete" />
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </Scrollbars>
  </div>
);

Images.displayName = 'ImagesRouter';
Images.propTypes = {
  list: PropTypes.arrayOf(PropTypes.shape({
    url: PropTypes.string.isRequired,
  })).isRequired,
};

export default Images;
