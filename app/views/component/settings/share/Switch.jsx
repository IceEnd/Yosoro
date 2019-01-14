import React, { Fragment } from 'react';
import PropTypes from 'prop-types';
import { Row, Col, Switch } from 'antd';

const Index = React.memo((props) => {
  const labelLayout = {
    offset: 0,
    span: 7,
  };
  const tipsLayout = {
    offset: 7,
    span: 17,
  };
  const { title, value, onChange, tips, type } = props;
  return (
    <Fragment>
      <Row className="font-size-row">
        <Col key="label" {...labelLayout} className="row-label">{title}:</Col>
        <Col key="view" span="3" style={{ paddingLeft: '0.2em' }}>
          <Switch
            defaultChecked={value}
            onChange={v => onChange(type, v)}
          />
        </Col>
      </Row>
      { tips ? (
        <Row className="tips-row">
          <Col {...tipsLayout}>{tips}</Col>
        </Row>
      ) : null }
    </Fragment>
  );
});

Index.displayName = 'SettingsSwitch';
Index.propTypes = {
  type: PropTypes.string.isRequired,
  title: PropTypes.string.isRequired,
  value: PropTypes.bool.isRequired,
  onChange: PropTypes.func.isRequired,
  tips: PropTypes.string,
};

export default Index;
