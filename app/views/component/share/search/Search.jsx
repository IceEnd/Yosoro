/**
 * @name Search 笔记搜索组件
 * @prop {number} searchStatus 搜索状态 0: 未搜索 1: 搜索中 2: 搜索完成
 * @prop {string} placeholder 输入框placeholder
 * @prop {object} style 搜索框样式
 * @prop {function} onSearch 搜索方法回调
 * @prop {function} onClose 关闭搜索回调
 * @class
 */
import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { Input, Icon } from 'antd';

import './search.scss';

export default class Search extends PureComponent {
  static displayName = 'Search';
  static propTypes = {
    searchStatus: PropTypes.number.isRequired, // 0: 未搜索 1: 搜索中 2: 搜索完成
    placeholder: PropTypes.string.isRequired,
    style: PropTypes.object,
    onSearch: PropTypes.func.isRequired,
    onClose: PropTypes.func.isRequired,
  };
  static defaultProps = {
    searchStatus: 0,
    placeholder: 'input search text',
  };

  constructor() {
    super();
    this.state = {
      target: '',
    };
  }

  // 处理搜索事件
  handleSearch = () => {
    const { target } = this.state;
    if (target === '') {
      return false;
    }
    this.props.onSearch(target);
  }

  // 关闭搜索
  handleClose = () => {
    this.setState({
      target: '',
    });
    this.props.onClose();
  }

  // 监听input改变
  handleChange = (event) => {
    this.setState({
      target: event.target.value,
    });
  }

  // 监听键盘事件
  handleKeyDown = (event) => {
    if (event.keyCode === 13) { // 键盘回车
      this.handleSearch();
    }
  }

  renderSeachIcon = () => (
    <Icon type="search" onClick={this.handleSearch} />
  );

  renderCloseIcon = () => (
    <Icon type="close-circle" onClick={this.handleClose} />
  )

  renderLoadingIcon = () => (<Icon type="loading" />)

  render() {
    const { placeholder, style, searchStatus } = this.props;
    const { target } = this.state;
    const options = {
      prefix: this.renderSeachIcon(),
      type: 'text',
      placeholder,
    };
    if (searchStatus === 2) {
      options.suffix = this.renderCloseIcon();
    } else if (searchStatus === 1) {
      options.suffix = this.renderLoadingIcon();
    }
    return (
      <span
        className="search-wrapper"
        style={style}
      >
        <Input
          className="input-search"
          {...options}
          value={target}
          onChange={this.handleChange}
          onKeyDown={this.handleKeyDown}
        />
      </span>
    );
  }
}
