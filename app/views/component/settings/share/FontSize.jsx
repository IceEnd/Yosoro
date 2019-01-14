import React from 'react';
import PropTypes from 'prop-types';
import { Slider, InputNumber, Row, Col } from 'antd';

const labelLayout = {
  offset: 0,
  span: 7,
};

const FontSize = React.memo((props) => {
  const { fontSize, onChange, minSize, maxSize, type, title } = props;
  return (
    <Row className="font-size-row">
      <Col key="label" {...labelLayout} className="row-label">{title}:</Col>
      <Col span="10">
        <Slider
          min={minSize}
          max={maxSize}
          onChange={value => onChange(type, value)}
          value={fontSize}
          step={1}
        />
      </Col>
      <Col key="view" span="5" className="number-col">
        <InputNumber
          min={minSize}
          max={maxSize}
          step={1}
          onChange={value => onChange(type, value)}
          value={fontSize}
        />
      </Col>
    </Row>
  );
});

FontSize.displayName = 'SetingsFontSize';
FontSize.propTypes = {
  type: PropTypes.oneOf(['editor', 'preview']).isRequired,
  title: PropTypes.string.isRequired,
  minSize: PropTypes.number.isRequired,
  maxSize: PropTypes.number.isRequired,
  fontSize: PropTypes.number.isRequired,
  onChange: PropTypes.func.isRequired,
};

export default FontSize;
