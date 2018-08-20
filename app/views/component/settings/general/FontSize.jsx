import React from 'react';
import PropTypes from 'prop-types';
import { Slider, InputNumber, Row, Col } from 'antd';

const labelLayout = {
  offset: 1,
  span: 5,
};

const FontSize = (props) => {
  const { fontSize, onChange, type, title } = props;
  return (
    <Row className="font-size-row">
      <Col {...labelLayout} className="row-label">{title}:</Col>
      <Col span="10">
        <Slider
          min={12}
          max={32}
          onChange={value => onChange(type, value)}
          value={fontSize}
          step={1}
        />
      </Col>
      <Col span="5" className="number-col">
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
  title: PropTypes.string.isRequired,
  fontSize: PropTypes.number.isRequired,
  onChange: PropTypes.func.isRequired,
};

export default FontSize;
