import React, { Component } from 'react';
import PropTypes from 'prop-types';
import autobind from 'autobind-decorator';
import { CHANGE_IMAGE_HOSTING } from 'Actions/app';
import { withDispatch } from 'Components/HOC/context';
import { Form, Input, Icon, Row, Col, Switch, Button, Radio } from 'antd';

import formItemLayout from './layout';

const FormItem = Form.Item;
const RadioGroup = Radio.Group;

const qualities = [{
  value: 'thumbnail',
  label: 'Thumbnail',
}, {
  value: 'mw690',
  label: 'mw690',
}, {
  value: 'large',
  label: 'Large',
}];

@withDispatch
export default class Weibo extends Component {
  static propTypes = {
    dispatch: PropTypes.func.isRequired,
    username: PropTypes.string.isRequired,
    password: PropTypes.string.isRequired,
    cookie: PropTypes.string.isRequired,
    useCookie: PropTypes.bool.isRequired,
    quality: PropTypes.oneOf(['thumbnail', 'mw690', 'large']).isRequired,
  };

  constructor(props) {
    super(props);
    const status = {
      help: '',
      validateStatus: '',
    };
    this.state = {
      form: {
        username: {
          value: props.username,
          label: 'Username',
          ...status,
        },
        password: {
          value: props.password,
          label: 'Password',
          ...status,
        },
        useCookie: {
          value: props.useCookie,
          label: 'Use Cookie',
        },
        cookie: {
          value: props.cookie,
          label: 'Cookie',
          ...status,
        },
        quality: {
          value: props.quality,
          label: 'Quality',
          ...status,
        },
      },
      hasEdit: false,
    };
  }

  changeWran(obj, key, type = 'error') {
    if (type === 'empty') {
      obj[key].help = `Please input ${key}`;
    } else {
      obj[key].help = `${key} is invalid`;
    }
    obj[key].validateStatus = 'error';
    this.setState({
      form: obj,
    });
  }

  clearWran(obj, key) {
    obj[key].help = '';
    obj[key].validateStatus = '';
    this.setState({
      form: obj,
    });
  }

  checkValue(key) {
    const form = Object.assign({}, this.state.form);
    const value = form[key].value;
    let flag = false;
    switch (key) {
      case 'username':
        if (value === '') {
          this.changeWran(form, key, 'empty');
        } else if (!/(\w|-|_)+$/ig.test(value)) {
          this.changeWran(form, key, 'error');
        } else {
          flag = true;
          this.clearWran(form, key);
        }
        break;
      case 'password':
      case 'cookie':
        if (value === '') {
          this.changeWran(form, key, 'empty');
        } else if (!/\w+/ig.test(value)) {
          this.changeWran(form, key, 'error');
        } else {
          this.clearWran(form, key);
          flag = true;
        }
        break;
      case 'quality':
        if (value === '') {
          this.changeWran(form, key, 'empty');
        } else if (['thumbnail', 'mw690', 'large'].indexOf(value) === -1) {
          this.changeWran(form, key, 'error');
        } else {
          this.clearWran(form, key);
          flag = true;
        }
        break;
      default:
        break;
    }
    return flag;
  }

  @autobind
  handleSubmit() {
    if (!this.state.hasEdit) {
      return;
    }
    const form = this.state.form;
    const useCookie = form.useCookie.value;
    let flag = false;
    if (useCookie) {
      flag = this.checkValue('cookie') && this.checkValue('quality');
    } else {
      flag = this.checkValue('username') && this.checkValue('password') && this.checkValue('quality');
    }
    if (flag) {
      this.props.dispatch({
        type: CHANGE_IMAGE_HOSTING,
        name: 'weibo',
        param: {
          username: form.username.value,
          password: form.password.value,
          useCookie: form.useCookie.value,
          cookie: form.cookie.value,
          quality: form.quality.value,
        },
      });
    }
  }

  @autobind
  handleBlur(key) {
    this.checkValue(key);
  }

  @autobind
  handleInput(value, key) {
    let temp = value;
    const form = Object.assign({}, this.state.form);
    if (typeof value === 'string') {
      temp = value.trim();
    }
    form[key].value = temp;
    this.setState({
      form,
      hasEdit: true,
    });
  }

  render() {
    const { form } = this.state;
    const useCookie = form.useCookie.value;
    return (
      <div className="image-hosting-item">
        <Row>
          <Col span="4" offset="1">
            <h3>
              <Icon type="weibo" /> Weibo
            </h3>
          </Col>
        </Row>
        <Form
          onSubmit={this.handleSubmit}
        >
          <FormItem
            key="username"
            label={form.username.label}
            help={form.username.help}
            validateStatus={form.username.validateStatus}
            required={!useCookie}
            {...formItemLayout}
          >
            <Input
              disabled={useCookie}
              placeholder="Username"
              value={form.username.value}
              onChange={e => this.handleInput(e.target.value, 'username')}
              onBlur={() => this.handleBlur('username')}
            />
          </FormItem>

          <FormItem
            key="password"
            label={form.password.label}
            help={form.password.help}
            validateStatus={form.password.validateStatus}
            required={!useCookie}
            {...formItemLayout}
          >
            <Input
              disabled={useCookie}
              placeholder="Password"
              value={form.password.value}
              type="password"
              onChange={e => this.handleInput(e.target.value, 'password')}
              onBlur={() => this.handleBlur('password')}
            />
          </FormItem>

          <FormItem
            key="useCookie"
            label={form.useCookie.label}
            {...formItemLayout}
          >
            <Switch
              value={form.useCookie.value}
              onChange={checked => this.handleInput(checked, 'useCookie')}
            />
          </FormItem>

          <FormItem
            key="cookie"
            label={form.cookie.label}
            help={form.cookie.help}
            validateStatus={form.cookie.validateStatus}
            required={useCookie}
            {...formItemLayout}
          >
            <Input
              disabled={!useCookie}
              placeholder="Cookie"
              value={form.cookie.value}
              onChange={e => this.handleInput(e.target.value, 'cookie')}
              onBlur={() => this.handleBlur('cookie')}
            />
          </FormItem>

          <FormItem
            key="quality"
            label={form.quality.label}
            help={form.quality.help}
            validateStatus={form.quality.validateStatus}
            required
            {...formItemLayout}
          >
            <RadioGroup
              value={form.quality.value}
              onChange={e => this.handleInput(e.target.value, 'quality')}
            >
              {qualities.map(item => (
                <Radio
                  key={item.name}
                  value={item.value}
                >{item.label}</Radio>
              ))}
            </RadioGroup>
          </FormItem>
        </Form>

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
        </Row>
      </div>
    );
  }
}
