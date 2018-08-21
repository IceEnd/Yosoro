import React, { Component } from 'react';
import { remote } from 'electron';
import PropTypes from 'prop-types';
import autobind from 'autobind-decorator';
import { Form, Input, Icon, Row, Col, Button } from 'antd';
import { CHANGE_IMAGE_HOSTING } from 'Actions/app';
import { withDispatch } from 'Components/HOC/context';

import Module from './Module';

const FormItem = Form.Item;
const { shell } = remote;

@withDispatch
export default class ImageHosting extends Component {
  static displayName = 'SettingsImagesHosting';
  static propTypes = {
    dispatch: PropTypes.func.isRequired,
    // default: PropTypes.oneOf(['github']).isRequired,
    github: PropTypes.shape({
      repo: PropTypes.string.isRequired,
      branch: PropTypes.string.isRequired,
      token: PropTypes.string.isRequired,
      path: PropTypes.string.isRequired,
      domain: PropTypes.string.isRequired,
    }).isRequired,
    id: PropTypes.string.isRequired,
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
    githubForm[key].value = e.target.value.replace(/(^\s|\s$)*/g, '');
    this.setState({
      githubForm,
      hasEidt: true,
    });
  }

  @autobind
  handleBlur(key) {
    this.checkValue(key);
  }

  @autobind
  handleSubmit() {
    const repoF = this.checkValue('repo');
    const branchF = this.checkValue('branch');
    const tokenF = this.checkValue('token');
    const pathF = this.checkValue('path');
    if (repoF && branchF && tokenF && pathF) {
      const githubForm = this.state.githubForm;
      this.setState({
        hasEidt: false,
      });
      this.props.dispatch({
        type: CHANGE_IMAGE_HOSTING,
        name: 'github',
        param: {
          repo: githubForm.repo.value,
          branch: githubForm.branch.value,
          token: githubForm.token.value,
          path: githubForm.path.value,
        },
      });
    }
  }

  @autobind
  checkValue(key) {
    const githubForm = Object.assign({}, this.state.githubForm);
    const value = githubForm[key].value;
    let flag = false;
    switch (key) {
      case 'repo':
        if (value === '') {
          this.changeWran(githubForm, key, 'empty');
        } else if (!/^(\w|-)+\/(\w|-)+$/ig.test(value)) {
          this.changeWran(githubForm, key, 'error');
        } else {
          flag = true;
          this.clearWran(githubForm, key);
        }
        break;
      case 'branch':
        if (value === '') {
          this.changeWran(githubForm, key, 'empty');
        } else if (!/\w+/ig.test(value)) {
          this.changeWran(githubForm, key, 'error');
        } else {
          this.clearWran(githubForm, key);
          flag = true;
        }
        break;
      case 'token':
        if (value === '') {
          this.changeWran(githubForm, key, 'empty');
        } else if (!/\w+/ig.test(value)) {
          this.changeWran(githubForm, key, 'error');
        } else {
          this.clearWran(githubForm, key);
          flag = true;
        }
        break;
      case 'path':
        if (value === '') {
          this.clearWran(githubForm, key);
          flag = true;
        } else if (!/^\/\w+$/ig.test(value)) {
          this.changeWran(githubForm, key, 'error');
        } else {
          this.clearWran(githubForm, key);
          flag = true;
        }
        break;
      default:
        break;
    }
    return flag;
  }

  handleOpenWiki = () => {
    shell.openExternal('https://github.com/IceEnd/Yosoro/wiki');
  }

  render() {
    const { id } = this.props;
    const { githubForm } = this.state;
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
        title="Image Hosting"
        id={id}
      >
        <Row>
          <Col span="4" offset="1">
            <h3>
              <Icon type="github" /> GitHub
            </h3>
          </Col>
        </Row>
        <Form
          onSubmit={this.handleSubmit}
        >
          <FormItem
            key="repo"
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
            key="branch"
            label={githubForm.branch.label}
            help={githubForm.branch.help}
            validateStatus={githubForm.branch.validateStatus}
            required
            {...formItemLayout}
          >
            <Input
              placeholder="master eg."
              value={githubForm.branch.value}
              onChange={e => this.handleInput(e, 'branch')}
              onBlur={() => this.handleBlur('branch')}
            />
          </FormItem>
          <FormItem
            key="token"
            label={githubForm.token.label}
            help={githubForm.token.help}
            validateStatus={githubForm.token.validateStatus}
            required
            {...formItemLayout}
          >
            <Input
              placeholder="token"
              value={githubForm.token.value}
              onChange={e => this.handleInput(e, 'token')}
              onBlur={() => this.handleBlur('token')}
            />
          </FormItem>
          <FormItem
            key="path"
            label={githubForm.path.label}
            help={githubForm.path.help}
            validateStatus={githubForm.path.validateStatus}
            {...formItemLayout}
          >
            <Input
              placeholder="/img eg."
              value={githubForm.path.value}
              onChange={e => this.handleInput(e, 'path')}
              onBlur={() => this.handleBlur('path')}
            />
          </FormItem>
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
          {/* <FormItem key="submit" {...wrapFormItemLayout}>
            <Row>
            ...tailFormItemLayout

            </Row>

          </FormItem> */}
        </Form>
      </Module>
    );
  }
}
