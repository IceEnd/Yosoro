import React, { Component } from 'react';
import { withDispatch } from 'Components/HOC/context';
import { Form, Input, Icon, Row, Col, Button } from 'antd';

const FormItem = Form.Item;

@withDispatch
export default class Weibo extends Component {
  static propTypes = {
    username: PropTypes.string.isRequired,
    password: PropTypes.string.isRequired,
    cookie: PropTypes.string.isRequired,
    useCookie: PropTypes.bool.isRequired,
  };

  render() {
    return (
      <div className="image-hosting-item">
        <Row>
          <Col span="4" offset="1">
            <h3>
              <Icon type="weibo" /> Weibo
            </h3>
          </Col>
        </Row>
      </div>
    );
  }
}
