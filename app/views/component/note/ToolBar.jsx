import React, { Component, Fragment } from 'react';
import PropTypes from 'prop-types';
import { ipcRenderer } from 'electron';
import classnames from 'classnames';
import { Icon, Tooltip, Menu, Dropdown, Popover } from 'antd';
import { withDispatch } from 'Components/HOC/context';
import { pushStateToStorage, mergeStateFromStorage } from 'Utils/utils';

import { searchNotes, clearSearchNotes, UPLOAD_NOTE_ONEDRIVE } from 'Actions/projects';
import { appSwitchEditMode } from 'Actions/app';
import { clearWorkspace } from 'Actions/note';
import { clearMarkdown, beforeSwitchSave, MARKDOWN_UPLOADING } from 'Actions/markdown';
import { POST_MEDIUM } from 'Actions/medium';
import TOC from './TOC';

import Search from '../share/search/Search';
import SVGIcon from '../share/SVGIcon';

const MenuItem = Menu.Item;

const VIEWS = ['normal', 'write', 'edit', 'preview', 'immersion'];

@withDispatch
export default class Tool extends Component {
  static displayName = 'NoteToolBar';
  static propTypes = {
    dispatch: PropTypes.func.isRequired,
    markdown: PropTypes.shape({
      parentsId: PropTypes.string.isRequired,
      uuid: PropTypes.string.isRequired,
      createDate: PropTypes.string.isRequired,
      latestDate: PropTypes.string.isRequired,
      name: PropTypes.string.isRequired,
      content: PropTypes.string.isRequired,
      html: PropTypes.string.isRequired,
      status: PropTypes.number.isRequired,
      start: PropTypes.number.isRequired,
      uploadStatus: PropTypes.number.isRequired,
    }).isRequired,
    note: PropTypes.shape({
      projectUuid: PropTypes.string.isRequired,
      projectName: PropTypes.string.isRequired,
      fileUuid: PropTypes.string.isRequired,
    }).isRequired,
    editorMode: PropTypes.string.isRequired,
    searchStatus: PropTypes.number.isRequired,
    blur: PropTypes.bool.isRequired,
  };

  static defaultProps = {
    blur: false,
  };

  static getDerivedStateFromProps(nextProps) {
    const { searchStatus } = nextProps;
    return {
      searchStatus: searchStatus === 1 ? 2 : searchStatus,
    };
  }

  constructor() {
    super();
    this.state = mergeStateFromStorage('noteExplorerState', {
      searchStatus: 0, // 0: 未搜索 1: 搜索中 2: 搜索完成
      tocVisible: false, // 是否展示TOC
    });
  }

  shouldComponentUpdate(nextProps) {
    if (this.props.editorMode !== nextProps.editorMode) {
      return false;
    }
    return true;
  }

  componentWillUnmount() {
    pushStateToStorage('noteExplorerState', this.state);
  }

  onSearch = (value) => {
    if (value) {
      const { dispatch, note, markdown } = this.props;
      if (markdown.uuid && note.projectName) {
        dispatch(beforeSwitchSave(note.projectName));
      }
      dispatch(clearMarkdown());
      dispatch(clearWorkspace());
      dispatch(searchNotes(value));
      dispatch(appSwitchEditMode('normal'));
      this.setState({
        searchStatus: 1,
      });
    }
  }

  onClose = () => {
    this.setState({
      searchStatus: 0,
    });
    const { dispatch, markdown, note } = this.props;
    if (markdown.uuid && note.projectName) {
      dispatch(beforeSwitchSave(note.projectName));
    }
    dispatch(clearMarkdown());
    dispatch(clearWorkspace());
    dispatch(clearSearchNotes());
  }

  setModeInk = (mode) => {
    const inkIndex = VIEWS.indexOf(mode);
    this.modeInk.style.transform = inkIndex ? `translateX(${inkIndex}00%)` : 'translateX(0)';
  }

  handleSwitchMode = (mode) => {
    const { dispatch, editorMode } = this.props;
    if (editorMode === mode) {
      return;
    }
    dispatch(appSwitchEditMode(mode));
    this.setModeInk(mode);
  }

  handleClick = (type) => {
    if (type === 'cloud-upload-o') {
      this.handleUpload();
    }
  }

  handleVisible = (type, value) => {
    this.setState({
      [type]: value,
    });
  }

  handleUpload = () => {
    const { markdown: { name, uuid, content, uploadStatus }, note: { projectUuid, projectName } } = this.props;
    if (uploadStatus === 1) { // 正在上传
      return false;
    }
    this.props.dispatch({
      type: MARKDOWN_UPLOADING,
    });
    this.props.dispatch({
      type: UPLOAD_NOTE_ONEDRIVE,
      param: {
        uuid,
        name,
        projectUuid,
        projectName,
        content,
      },
      toolbar: true,
    });
  }

  handleExport = ({ key }) => {
    const { markdown: { content, name, html }, note: { projectName } } = this.props;
    let data;
    if (key === 'md') {
      data = content;
    } else if (key === 'html') {
      data = html;
    } else if (key === 'pdf') {
      data = html;
    }
    ipcRenderer.send('export-note', {
      content,
      html,
      type: key,
      fileName: name,
      projectName,
      data,
    });
  }

  // 发布文章
  handlePublic = ({ key }) => {
    const { markdown: { content, name } } = this.props;
    if (key === 'medium') {
      this.props.dispatch({
        type: POST_MEDIUM,
        title: name,
        markdown: content,
      });
    }
  }

  renderDropDown = (menu, type, style = {}) => (
    <Dropdown
      overlay={menu}
      placement="bottomCenter"
    >
      <span
        className="tools-item font-icon"
      >
        <Icon type={type} style={style} />
      </span>
    </Dropdown>
  );

  renderIcon = (type, desc) => {
    const { markdown: { uploadStatus } } = this.props;
    if (type === 'export') {
      const menu = (
        <Menu onClick={this.handleExport}>
          <MenuItem key="md">Markdown</MenuItem>
          <MenuItem key="html">Html</MenuItem>
          <MenuItem key="pdf">PDF</MenuItem>
        </Menu>
      );
      return this.renderDropDown(menu, type);
    }
    if (type === 'upload') {
      const menu = (
        <Menu onClick={this.handlePublic}>
          <MenuItem key="medium">Medium</MenuItem>
        </Menu>
      );
      return this.renderDropDown(menu, type);
    }
    if (type === 'bars') { // 打开TOC
      const { markdown } = this.props;
      const { tocVisible } = this.state;
      const content = (<TOC {...markdown} visible={tocVisible} />);
      return (
        <Popover
          overlayClassName="toc-popover"
          trigger="click"
          placement="bottomRight"
          content={content}
          onVisibleChange={value => this.handleVisible('tocVisible', value)}
        >
          <span className="tools-item font-icon">
            <Icon type="bars" />
          </span>
        </Popover>
      );
    }
    if (type === 'layout') {
      return this.renderModeViews();
    }
    return (
      <span
        className="tools-item font-icon"
        onClick={() => this.handleClick(type)}
      >
        <Tooltip
          placement="bottom"
          title={desc}
        >
          {type === 'cloud-upload-o' && uploadStatus === 1 ? (
            <Icon type="loading" />
          ) : (
            <Icon type={type} />
          )}
        </Tooltip>
      </span>
    );
  }

  renderModeViews() {
    const { editorMode } = this.props;
    const inkIndex = VIEWS.indexOf(editorMode);
    const inkStyle = {
      width: `${(100 / VIEWS.length).toFixed(2)}%`,
      transform: inkIndex ? `translateX(${inkIndex}00%)` : 'translateX(0)',
    };
    const content = (
      <div className="mode-wrap">
        <ul className="mode-list">
          {VIEWS.map(item => (
            <li
              key={item}
              className="mode-item"
              role="presentation"
              onClick={() => this.handleSwitchMode(item)}
            >
              <SVGIcon
                className="tools-item-svg"
                viewBox="0 0 640 640"
                id={`#icon_svg_${item}_mode`}
              />
            </li>
          ))}
        </ul>
        <div key="inkBar" className="mode-ink" style={inkStyle} ref={node => (this.modeInk = node)} />
      </div>
    );
    return (
      <Popover
        key="modePopover"
        overlayClassName="edit-mode-popover"
        trigger="click"
        placement="bottomRight"
        content={content}
      >
        <span className="tools-item font-icon">
          <Icon type="layout" />
        </span>
      </Popover>
    );
  }

  render() {
    const { searchStatus } = this.state;
    const { markdown: { name, status }, blur } = this.props;
    const classStr = classnames('note-toolbar', {
      'note-blur': blur,
    });
    return (
      <div className={classStr}>
        <div className="search-root">
          <Search
            searchStatus={searchStatus}
            placeholder="input search text"
            onSearch={value => this.onSearch(value)}
            onClose={() => this.onClose()}
          />
        </div>
        {status === 1 ? (
          <Fragment>
            <h3 className="title">{name}</h3>
            <div className="tools">
              {this.renderIcon('cloud-upload-o', 'upload')}
              {this.renderIcon('export', 'export')}
              {this.renderIcon('upload', 'public')}
              {this.renderIcon('bars', 'toc')}
              {this.renderIcon('layout', 'layout')}
            </div>
          </Fragment>
        ) : (null)}
      </div>
    );
  }
}
