import React, { PureComponent, Fragment } from 'react';
import PropTypes from 'prop-types';
import { Icon, Tooltip } from 'antd';
import Search from '../share/search/Search';
import { searchNotes, clearSearchNotes, UPLOAD_NOTE_ONEDRIVER } from '../../actions/projects';
import { pushStateToStorage, mergeStateFromStorage } from '../../utils/utils';
import { appSwitchEditMode } from '../../actions/app';
import { clearWorkspace } from '../../actions/note';
import { clearMarkdown, beforeSwitchSave, MARKDOWN_UPLOADING } from '../../actions/markdown';

export default class Tool extends PureComponent {
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
  };

  constructor() {
    super();
    this.state = mergeStateFromStorage('noteExplorerState', {
      searchStatus: 0, // 0: 未搜索 1: 搜索中 2: 搜索完成
    });
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.searchStatus === 1) {
      this.setState({
        searchStatus: 2,
      });
    }
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

  handleSwitchMode = () => {
    const { dispatch, editorMode } = this.props;
    dispatch(appSwitchEditMode(editorMode));
  }

  handleClick = (type) => {
    if (type === 'cloud-upload-o') {
      this.handleUpload();
    }
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
      type: UPLOAD_NOTE_ONEDRIVER,
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

  renderIcon = (type, desc) => {
    const { markdown: { uploadStatus } } = this.props;
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

  renderEditModalIcon = () => {
    const { editorMode } = this.props;
    const iconHtml = `<use class="" xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="#icon_svg_${editorMode}_mode" />`;
    return (
      <span
        className="tools-item"
        onClick={this.handleSwitchMode}
      >
        <Tooltip
          placement="bottom"
          title={editorMode}
        >
          <svg className="tools-item-svg" viewBox="0 0 640 640" dangerouslySetInnerHTML={{ __html: iconHtml }} />
        </Tooltip>
      </span>
    );
  }

  render() {
    const { searchStatus } = this.state;
    const { markdown: { name, status } } = this.props;
    return (
      <div className="note-toolbar">
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
              {/* {this.renderIcon('link')}
              {this.renderIcon('picture')}
              {this.renderIcon('code-o')}
              {this.renderIcon('smile-o')}
              {this.renderIcon('tag')}
              {this.renderIcon('arrows-alt')} */}
              {/* {this.renderIcon('arrows-alt')} */}
              {this.renderEditModalIcon()}
            </div>
          </Fragment>
        ) : (null)}
      </div>
    );
  }
}
