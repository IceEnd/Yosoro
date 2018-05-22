import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { Icon, Tooltip } from 'antd';

export default class NoteItem extends PureComponent {
  static displayName = 'NoteItem';
  static propTypes = {
    type: PropTypes.oneOf(['notebook', 'note']).isRequired,
    className: PropTypes.string.isRequired,
    item: PropTypes.object.isRequired,
    hasRestore: PropTypes.bool.isRequired, // 是否有还原按钮
    restoreFn: PropTypes.func.isRequired, // 复原按钮事件
    hasLogin: PropTypes.bool.isRequired, // 是否有进入按钮
    hasRemove: PropTypes.bool.isRequired, // 是否有删除按钮
    removeFn: PropTypes.func.isRequired, // 删除按钮事件
    itemClick: PropTypes.func.isRequired,
  };
  static defaultProps = {
    className: 'list-item',
    hasRestore: false,
    hasLogin: false,
    hasRemove: false,
    itemClick: () => {},
  };

  getSvgHtml = () => `<use class="trash-notebook-use" xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="#icon_svg_${this.props.type}" />'`;

  renderRestore = () => {
    const { hasRestore, restoreFn, item } = this.props;
    if (hasRestore) {
      return (
        <span
          className="list-item__options__item"
          onClick={e => restoreFn(e, item.uuid, item.name)}
        >
          <Tooltip placement="bottom" title="restore notebook">
            <Icon type="export" />
          </Tooltip>
        </span>
      );
    }
    return null;
  }

  renderRemove = () => {
    const { hasRemove, removeFn, item } = this.props;
    if (hasRemove) {
      return (
        <span
          className="list-item__options__item"
          onClick={e => removeFn(e, item.uuid, item.name)}
        >
          <Tooltip placement="bottom" title="delete notebook">
            <Icon type="delete" />
          </Tooltip>
        </span>
      );
    }
    return null;
  }

  renderLogin = () => {
    if (this.props.hasLogin) {
      return (
        <span className="list-item__options__item">
          <Tooltip placement="bottom" title="open notebook">
            <Icon type="login" />
          </Tooltip>
        </span>
      );
    }
    return null;
  }

  render() {
    const { className, itemClick, item } = this.props;
    return (
      <li
        className={className}
        onClick={itemClick}
        role="presentation"
      >
        <div className="list-item__img">
          <svg className="menu-svg" viewBox="0 0 59 59" dangerouslySetInnerHTML={{ __html: this.getSvgHtml() }} />
        </div>
        <h3 className="list-item__title">{item.name}</h3>
        <div className="list-item__option">
          {this.renderRestore()}
          {this.renderLogin()}
          {this.renderRemove()}
        </div>
      </li>
    );
  }
}
