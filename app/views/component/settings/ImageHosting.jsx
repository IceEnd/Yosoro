import React, { Component } from 'react';
import PropTypes from 'prop-types';
import autobind from 'autobind-decorator';
import { Form, Input, Icon, Row, Col, Button } from 'antd';

import Module from './Module';

const FormItem = Form.Item;

export default class ImageHosting extends Component {
  static displayName = 'SettingsImagesHosting';
  static propTypes = {
    // default: PropTypes.oneOf(['github']).isRequired,
    github: PropTypes.shape({
      repo: PropTypes.string.isRequired,
      branch: PropTypes.string.isRequired,
      token: PropTypes.string.isRequired,
      path: PropTypes.string.isRequired,
      domain: PropTypes.string.isRequired,
    }).isRequired,
  };

  constructor(props) {
    super(props);
    const { github } = props;
    const status = {
      help: '',
      validateStatus: '',
    };
    this.state = {
      githubForm: {
        repo: {
          value: github.repo,
          label: 'Repository',
          ...status,
        },
        branch: {
          value: github.branch,
          label: 'Branch',
          ...status,
        },
        token: {
          value: github.token,
          label: 'Token',
          ...status,
        },
        path: {
          value: github.path,
          label: 'Path',
          ...status,
        },
        domain: {
          value: github.path,
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
      githubForm: obj,
    });
  }

  @autobind
  clearWran(obj, key) {
    obj[key].help = '';
    obj[key].validateStatus = '';
    this.setState({
      githubForm: obj,
    });
  }

  @autobind
  handleInput(e, key) {
    const githubForm = Object.assign({}, this.state.githubForm);
    githubForm[key].value = e.target.value;
    this.setState({
      githubForm,
    });
  }

  @autobind
  handleBlur(key) {
    const githubForm = Object.assign({}, this.state.githubForm);
    const value = githubForm[key].value;
    switch (key) {
      case 'repo':
        if (value === '') {
          this.changeWran(githubForm, key, 'empty');
        } else if (!/^\w+\/\w+$/ig.test(value)) {
          this.changeWran(githubForm, key, 'error');
        } else {
          this.clearWran(githubForm, key);
        }
        return null;
      case 'branch':
        if (value === '') {
          this.changeWran(githubForm, key, 'empty');
        } else if (!/\w+/ig.test(value)) {
          this.changeWran(githubForm, key, 'error');
        } else {
          this.clearWran(githubForm, key);
        }
        return null;
      case 'token':
        if (value === '') {
          this.changeWran(githubForm, key, 'empty');
        } else if (!/\w+/ig.test(value)) {
          this.changeWran(githubForm, key, 'error');
        } else {
          this.clearWran(githubForm, key);
        }
        return null;
      case 'path':
        if (value === '') {
          this.clearWran();
        } else if (!/^\/\w+$/ig.test(value)) {
          this.changeWran(githubForm, key, 'error');
        } else {
          this.clearWran(githubForm, key);
        }
        return null;
      default:
        return null;
    }
  }

  render() {
    const { githubForm } = this.state;
    const formItemLayout = {
      labelCol: {
        offset: 1,
        span: 4,
      },
      wrapperCol: {
        span: 12,
      },
    };
    const tailFormItemLayout = {
      wrapperCol: {
        span: 4,
        offset: 2,
      },
    };
    return (
      <Module
        title="Image Hosting"
      >
        <Row>
          <Col span="4" offset="1">
            <h3>
              <Icon type="github" /> GitHub
            </h3>
          </Col>
        </Row>
        <Form>
          <FormItem
            label={githubForm.repo.label}
            help={githubForm.repo.help}
            validateStatus={githubForm.repo.validateStatus}
            required
            {...formItemLayout}
          >
            <Input
              placeholder="username/repo"
              value={githubForm.repo.value}
              onChange={e => this.handleInput(e, 'repo')}
              onBlur={() => this.handleBlur('repo')}
            />
          </FormItem>
          <FormItem
            label={githubForm.branch.label}
            help={githubForm.branch.help}
            validateStatus={githubForm.branch.validateStatus}
            required
            {...formItemLayout}
          >
            <Input
              placeholder="master eg."
              onChange={e => this.handleInput(e, 'branch')}
              onBlur={() => this.handleBlur('branch')}
            />
          </FormItem>
          <FormItem
            label={githubForm.token.label}
            help={githubForm.token.help}
            validateStatus={githubForm.token.validateStatus}
            required
            {...formItemLayout}
          >
            <Input
              placeholder="token"
              onChange={e => this.handleInput(e, 'token')}
              onBlur={() => this.handleBlur('token')}
            />
          </FormItem>
          <FormItem
            label={githubForm.path.label}
            help={githubForm.path.help}
            validateStatus={githubForm.path.validateStatus}
            {...formItemLayout}
          >
            <Input
              placeholder="/img eg."
              onChange={e => this.handleInput(e, 'path')}
              onBlur={() => this.handleBlur('path')}
            />
          </FormItem>
          <FormItem {...tailFormItemLayout}>
            <Button type="primary" htmlType="submit">Save</Button>
          </FormItem>
        </Form>
      </Module>
    );
  }
}
