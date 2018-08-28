import React, { Component } from 'react';
import { remote } from 'electron';
import PropTypes from 'prop-types';
import autobind from 'autobind-decorator';
import { Form, Input, Icon, Row, Col, Button, Avatar, Select } from 'antd';
import { AUTH_MEDIUM, SIGN_OUT_MEDIUM } from 'Actions/medium';
import { withDispatch } from 'Components/HOC/context';

import Module from './Module';

const FormItem = Form.Item;
const Option = Select.Option;
const { shell } = remote;

@withDispatch
export default class MediumConfig extends Component {
  static displayName = 'MediumConfig';
  static propTypes = {
    dispatch: PropTypes.func.isRequired,
    medium: PropTypes.shape({
      token: PropTypes.string.isRequired,
      publishStatus: PropTypes.string.isRequired,
      id: PropTypes.string.isRequired,
      username: PropTypes.string.isRequired,
      url: PropTypes.string.isRequired,
      imageUrl: PropTypes.string.isRequired,
    }).isRequired,
    id: PropTypes.string.isRequired,
  };

  constructor(props) {
    super(props);
    const { medium } = props;
    const status = {
      help: '',
      validateStatus: '',
    };
    this.state = {
      mediumForm: {
        token: {
          value: medium.token,
          label: 'Token',
          ...status,
        },
        publishStatus: {
          value: medium.publishStatus,
          label: 'Publish Status',
          ...status,
        },
      },
    };
  }

  @autobind
  changeWran(obj, key, type = 'error') {
    if (type === 'empty') {
      obj[key].help = `Please input ${key}`;
    } else {
      obj[key].help = `${key} is invalid`;
    }
    obj[key].validateStatus = 'error';
    this.setState({
      mediumForm: obj,
    });
  }

  @autobind
  clearWran(obj, key) {
    obj[key].help = '';
    obj[key].validateStatus = '';
    this.setState({
      mediumForm: obj,
    });
  }

  @autobind
  handleInput(e, key) {
    const mediumForm = Object.assign({}, this.state.mediumForm);
    mediumForm[key].value = e.target.value.replace(/(^\s|\s$)*/g, '');
    this.setState({
      mediumForm,
      hasEidt: true,
    });
  }

  @autobind
  handleBlur(key) {
    this.checkValue(key);
  }

  @autobind
  handleSubmit() {
    const tokenF = this.checkValue('token');
    if (tokenF) {
      const mediumForm = this.state.mediumForm;
      this.setState({
        hasEidt: false,
      });
      this.props.dispatch({
        type: AUTH_MEDIUM,
        token: mediumForm.token.value,
        publishStatus: mediumForm.publishStatus.value,
      });
    }
  }

  @autobind
  checkValue(key) {
    const mediumForm = Object.assign({}, this.state.mediumForm);
    const value = mediumForm[key].value;
    let flag = true;
    switch (key) {
      case 'publishStatus':
        if (value === '') {
          this.changeWran(mediumForm, key, 'empty');
        } else if (!/([A-Z])\w+/ig.test(value)) {
          this.changeWran(mediumForm, key, 'error');
        } else {
          this.clearWran(mediumForm, key);
          flag = true;
        }
        break;
      case 'token':
        if (value === '') {
          this.changeWran(mediumForm, key, 'empty');
        } else if (!/\w+/ig.test(value)) {
          this.changeWran(mediumForm, key, 'error');
        } else {
          this.clearWran(mediumForm, key);
          flag = true;
        }
        break;
      default:
        break;
    }
    return flag;
  }

  handleOpenWiki = () => {
    shell.openExternal('https://github.com/Medium/medium-api-docs#22-self-issued-access-tokens');
  }

  signout = () => {
    this.state.mediumForm.token.value = '';
    this.props.dispatch({
      type: SIGN_OUT_MEDIUM,
    });
  }

  render() {
    const { mediumForm } = this.state;
    const { medium, id } = this.props;
    const formItemLayout = {
      labelCol: {
        offset: 1,
        span: 6,
      },
      wrapperCol: {
        span: 12,
      },
    };
    return (
      <Module
        title="Publish Config"
        id={id}
      >
        <Row>
          <Col span="4" offset="1">
            <h3>
              <Icon type="medium" /> Medium
            </h3>
          </Col>
        </Row>
        <Form>
          <FormItem
            key="token"
            label={mediumForm.token.label}
            help={mediumForm.token.help}
            validateStatus={mediumForm.token.validateStatus}
            required
            {...formItemLayout}
          >
            <Input
              placeholder="token"
              value={mediumForm.token.value}
              onChange={e => this.handleInput(e, 'token')}
              onBlur={() => this.handleBlur('token')}
              type="password"
            />
          </FormItem>
          <FormItem
            key="publishStatus"
            label={mediumForm.publishStatus.label}
            help={mediumForm.publishStatus.help}
            validateStatus={mediumForm.publishStatus.validateStatus}
            required
            {...formItemLayout}
          >
            <Select
              defaultValue={mediumForm.publishStatus.value}
              onChange={e => this.handleInput({ target: { value: e } }, 'publishStatus')}
            >
              <Option value="draft">Draft</Option>
              <Option value="public">Public</Option>
            </Select>
          </FormItem>
          <FormItem
            key="user"
            label="User"
            {...formItemLayout}
          >
            {medium.username === ''
              ? 'You are not Sing in. Please add your token and save first.'
              : <Row>
                <Col span="5">
                  <a href={medium.url}>
                    <Avatar src={medium.imageUrl} />
                    <span>{medium.username}</span>
                  </a>
                </Col>
                <Col span="2">
                  <Button
                    onClick={this.signout}
                  >Sign out</Button>
                </Col>
              </Row>
            }
          </FormItem>
          {/* <FormItem
            key="id"
            label="Id"
            {...formItemLayout}
          >
            {medium.id}
          </FormItem> */}
          <Row
            type="flex"
            align="middle"
          >
            <Col
              span="2"
              offset="2"
            >
              <Button
                type="primary"
                onClick={this.handleSubmit}
              >Save</Button>
            </Col>
            <Col
              span="2"
              offset="1"
            >
              <a onClick={this.handleOpenWiki}>
                <Icon type="question-circle-o" />
              </a>
            </Col>
          </Row>
        </Form>
      </Module>
    );
  }
}
