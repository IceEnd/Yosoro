import React from 'react';
import PropTypes from 'prop-types';
import { Empty } from 'antd';
import { Scrollbars } from 'react-custom-scrollbars';
import Title from 'Share/title/Title';

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
                {item._id}
              </li>
            ))}
          </ul>
        )}
      </div>
    </Scrollbars>
  </div>
);

Images.displayName = 'Images';
Images.propTypes = {
  list: PropTypes.array.isRequired,
};

export default Images;
