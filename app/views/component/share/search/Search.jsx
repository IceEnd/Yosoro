/**
 *_______________#########________________________________
 *______________############______________________________
 *______________#############_____________________________
 *_____________##__###########____________________________
 *____________###__######_#####____________##_____##______
 *____________###_#######___####___________##____##_______
 *___________###__##########_####__________##___##________
 *__________####__###########_####_________######_________
 *________#####___###########__#####_______###____________
 *_______######___###_########___#####____##______________
 *_______#####___###___########___######_##_______________
 *______######___###__###########___######________________
 *_____######___####_##############__######_______________
 *____#######__#####################_########_____________
 *____#######__##############################_____________
 *___#######__######_#################_#######____________
 *___#######__######_######_#########___######____________
 *___#######____##__######___######_____######____________
 *___#######________######____#####_____#####_____________
 *____######________#####_____#####_____####______________
 *_____#####________####______#####_____###_______________
 *______#####______;###________###______#_________________
 *________##_______####________####_______________________
 */

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
          {...options}
          value={target}
          onChange={this.handleChange}
          onKeyDown={this.handleKeyDown}
        />
      </span>
    );
  }
}
