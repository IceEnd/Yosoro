import React from 'react';
import PropTypes from 'prop-types';
import { Slider, InputNumber, Row, Col } from 'antd';

const labelLayout = {
  offset: 1,
  span: 5,
};

const FontSize = (props) => {
  const { fontSize, onChange, type } = props;
  return (
    <Row>
      <Col {...labelLayout}>Editor Font Size:</Col>
      <Col span="10">
        <Slider
          min={12}
          max={32}
          onChange={value => onChange(type, value)}
          value={fontSize}
          step={1}
        />
      </Col>
      <Col>
        <InputNumber
          min={12}
          max={32}
          step={1}
          onChange={value => onChange(type, value)}
          value={fontSize}
        />
      </Col>
    </Row>
  );
};

FontSize.displayName = 'SetingsFontSize';
FontSize.propTypes = {
  type: PropTypes.oneOf(['editor', 'preview']).isRequired,
  fontSize: PropTypes.number.isRequired,
  onChange: PropTypes.func.isRequired,
};

export default FontSize;
