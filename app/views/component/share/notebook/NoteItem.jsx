import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { Icon, Tooltip } from 'antd';
import SVGIcon from '../SVGIcon';

export default class NoteItem extends PureComponent {
  static displayName = 'NoteItem';
  static propTypes = {
    type: PropTypes.oneOf(['notebook', 'note']).isRequired,
    className: PropTypes.string.isRequired,
    item: PropTypes.object.isRequired,
    isCloud: false, // 是否来自Cloud
    title: PropTypes.string,
    hasRestore: PropTypes.bool.isRequired, // 是否有还原按钮
    restoreFn: PropTypes.func.isRequired, // 复原按钮事件
    hasLogin: PropTypes.bool.isRequired, // 是否有进入按钮
    hasDownload: PropTypes.bool.isRequired, // 是否有下载按钮
    downloadFn: PropTypes.func.isRequired, // 下载按钮事件
    hasRemove: PropTypes.bool.isRequired, // 是否有删除按钮
    removeFn: PropTypes.func.isRequired, // 删除按钮事件
    itemClick: PropTypes.func.isRequired,
  };
  static defaultProps = {
    className: 'list-item',
    hasRestore: false,
    hasLogin: false,
    hasDownload: false,
    hasRemove: false,
    isCloud: false,
    itemClick: () => {},
  };

  getUseId() {
    const { type } = this.props;
    return `#icon_svg_${type}`;
  }

  handleRemove = (e, item) => {
    const { isCloud, type } = this.props;
    if (isCloud) {
      this.props.removeFn(e, type, item.name, item.id, item.parentReference);
    } else {
      this.props.removeFn(e, item.uuid, item.name);
    }
  }

  renderRestore() {
    const { hasRestore, restoreFn, item, type } = this.props;
    if (hasRestore) {
      return (
        <span
          className="list-item__options__item"
          onClick={e => restoreFn(e, item.uuid, item.name)}
        >
          <Tooltip placement="bottom" title={`restore ${type}`}>
            <Icon type="export" />
          </Tooltip>
        </span>
      );
    }
    return null;
  }

  renderDownload() {
    const { hasDownload, downloadFn, item, type } = this.props;
    if (hasDownload) {
      return (
        <span
          className="list-item__options__item"
          onClick={() => downloadFn(item.name)}
        >
          <Tooltip
            placement="bottom"
            title={`download ${type}`}
            getPopupContainer={() => document.getElementById('app_cloud')}
          >
            <Icon type="download" />
          </Tooltip>
        </span>
      );
    }
    return null;
  }

  renderRemove() {
    const { hasRemove, item, type } = this.props;
    if (hasRemove) {
      return (
        <span
          className="list-item__options__item"
          onClick={e => this.handleRemove(e, item)}
        >
          <Tooltip placement="bottom" title={`delete ${type}`}>
            <Icon type="delete" />
          </Tooltip>
        </span>
      );
    }
    return null;
  }

  renderLogin() {
    if (this.props.hasLogin) {
      const { type } = this.props;
      return (
        <span className="list-item__options__item">
          <Tooltip placement="bottom" title={`open ${type}`}>
            <Icon type="login" />
          </Tooltip>
        </span>
      );
    }
    return null;
  }

  render() {
    const { className, itemClick, item, title } = this.props;
    return (
      <li
        className={className}
        onClick={itemClick}
        role="presentation"
      >
        <div className="list-item__img">
          <SVGIcon
            className="menu-svg"
            viewBox="0 0 59 59"
            id={this.getUseId()}
            useClassName="trash-notebook-use"
          />
        </div>
        <h3 className="list-item__title">
          {title || item.name}
        </h3>
        <div className="list-item__option">
          {this.renderRestore()}
          {this.renderLogin()}
          {this.renderDownload()}
          {this.renderRemove()}
        </div>
      </li>
    );
  }
}
