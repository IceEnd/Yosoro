import React from 'react';
import PropTypes from 'prop-types';
import { Row, Col, Select } from 'antd';

const labelLayout = {
  offset: 0,
  span: 7,
};

const Option = Select.Option;

const Selector = React.memo((props) => {
  const { title, options, width, size, value, type, onChange } = props;
  return (
    <Row className="font-size-row">
      <Col
        key="label"
        {...labelLayout}
        className="row-label"
      >{title}:</Col>
      <Col key="view" span={10}>
        <Select
          style={{ width }}
          size={size}
          value={value}
          onChange={v => onChange(type, v)}
        >
          {options.map(item => (
            <Option key={item} value={item.value}>{item.label}</Option>
          ))}
        </Select>
      </Col>
    </Row>
  );
});

Selector.displayName = 'SetingsSelector';

Selector.propTypes = {
  title: PropTypes.string.isRequired,
  options: PropTypes.arrayOf(PropTypes.shape({
    label: PropTypes.string.isRequired,
    value: PropTypes.any,
  })).isRequired,
  width: PropTypes.number.isRequired,
  size: PropTypes.oneOf(['small', 'default', 'large']),
  type: PropTypes.string.isRequired,
  value: PropTypes.string.isRequired,

  onChange: PropTypes.func.isRequired,
};

Selector.defaultProps = {
  width: 80,
  size: 'default',
};

export default Selector;
