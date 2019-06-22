
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { ipcRenderer } from 'electron';
import Scrollbars from 'Share/Scrollbars';
import autobind from 'autobind-decorator';
import Muya from 'Utils/muya/index';
import {
  UPLOAD_IMAGE,
  UPLOAD_IMAGE_SUCCESS,
  UPLOAD_IMAGE_FAILED,
} from 'Actions/imageHosting';
import { saveNote } from 'Actions/projects';
import { updateMarkdownHtml } from 'Actions/markdown';
import { isCanUpload } from 'Utils/db/app';
import {
  debounce,
} from 'Utils/utils';
import { withDispatch, withTheme } from 'Components/HOC/context';
import * as notifications from '../share/notifications';
import { eventTOC } from '../../events/eventDispatch';

let key = 0;
let seed = 0;


@withDispatch
@withTheme
export default class Editor extends Component {
  static displayName = 'MarkdownEditor';
  static propTypes = {
    dispatch: PropTypes.func.isRequired,
    // theme: PropTypes.string.isRequired,
    uuid: PropTypes.string.isRequired,
    defaultContent: PropTypes.string.isRequired,
    start: PropTypes.number.isRequired,
    editorMode: PropTypes.string.isRequired,
    fontSize: PropTypes.number.isRequired,
    editorWidthValue: PropTypes.number.isRequired,
    drag: PropTypes.bool.isRequired,
    note: PropTypes.shape({
      projectUuid: PropTypes.string.isRequired,
      projectName: PropTypes.string.isRequired,
      fileUuid: PropTypes.string.isRequired,
      fileName: PropTypes.string.isRequired,
    }).isRequired,
    imageHostingConfig: PropTypes.shape({
      default: PropTypes.oneOf(['github', 'weibo', 'SM.MS']).isRequired,
      github: PropTypes.shape({
        repo: PropTypes.string.isRequired,
        branch: PropTypes.string.isRequired,
        token: PropTypes.string.isRequired,
        path: PropTypes.string.isRequired,
        domain: PropTypes.string.isRequired,
      }).isRequired,
    }).isRequired,
  };

  constructor() {
    super();
    this.muya = null;
    this.state = {
      uploading: false,
    };
  }

  componentDidMount() {
    this.mounted = true;
    this.noteRoot = document.getElementById('note_root_cont');
    this.setMuya();
    eventTOC.on('toc-jump', this.handleTOCJump);
  }

  componentDidUpdate(prevProps) {
    const { start } = this.props;
    if (start !== -1) {
      this.editor.selectionStart = start + 1;
      this.editor.selectionEnd = start + 1;
    }
    if (prevProps.uuid !== this.props.uuid) {
      this.muya.setMarkdown(this.props.defaultContent);
    }
  }

  componentWillUnmount() {
    eventTOC.removeListener('toc-jump', this.handleTOCJump);
    this.destroyMuya();
  }

  setMuya = () => {
    this.muya = new Muya(this.container, {
      focusMode: true,
      markdown: this.props.defaultContent,
      imageAction: this.imageAction,
      imageUploadAction: this.imageUploadAction,
      // imagePathPicker
    });
    window.muya = this.muya;
    this.addChangeEvent();
  }

  // 停止编辑500ms, 异步保存文件内容
  autoSave = debounce(() => {
    const { note: { projectName, projectUuid, fileName, fileUuid }, defaultContent, dispatch } = this.props;
    ipcRenderer.send('auto-save-content-to-file', {
      projectName,
      fileName,
      content: defaultContent,
    });
    dispatch(saveNote(projectUuid, fileUuid));
  }, 500);

  addChangeEvent() {
    if (this.muya) {
      this.muya.on('change', this.handleChange);
    }
  }

  handleTOCJump = (data) => {
    if (this.codeMirror) {
      const { defaultContent } = this.props;
      const { depth, text } = data;
      const reg = new RegExp(`^\\s*${'#'.repeat(depth)}\\s+${text}\\s*`, 'ig');
      const lines = defaultContent.split('\n');
      const length = lines.length;
      let targetLineNum = -1;
      for (let i = 0; i < length; i++) {
        if (reg.test(lines[i])) {
          targetLineNum = i;
          break;
        }
      }
      if (targetLineNum >= 0) {
        this.codeMirror.off('scroll', this.handleScroll);
        const height = this.codeMirror.heightAtLine(targetLineNum, 'local');
        this.codeMirror.scrollTo(null, height);
        setTimeout(() => {
          this.codeMirror.on('scroll', this.handleScroll);
        }, 100);
      }
    }
  }

  handleChange = ({ markdown }) => {
    const { uuid } = this.props;
    this.props.dispatch(updateMarkdownHtml(markdown, uuid, -1));
    this.autoSave();
  }

  updateCode = () => {
    const { editorMode, editorWidthValue, defaultContent } = this.props;
    const textWidth = this.getTextWidth(editorMode, editorWidthValue);
    this.setState({
      content: defaultContent,
      textWidth,
    });
  }

  destroyMuya = () => {
    if (this.muya) {
      this.muya.destroy();
      this.muya = null;
    }
  }

  imageAction = image => image;

  imageUploadAction = (image, cb) => {
    const { imageHostingConfig } = this.props;
    if (!isCanUpload()) {
      notifications.uploadNotification.show();
      return;
    }
    ipcRenderer.once(`pic-upload-sync-cb-${++seed}`, (event, args) => {
      const { code, data } = args;
      if (code === 0) {
        this.props.dispatch({
          type: UPLOAD_IMAGE_SUCCESS,
          data,
        });
        if (cb) {
          cb(data);
        }
      } else {
        this.props.dispatch({
          type: UPLOAD_IMAGE_FAILED,
        });
      }
    });
    ipcRenderer.send('pic-upload-sync', {
      files: {
        filePath: image,
      },
      seed,
      imageHostingConfig,
    });
  }

  @autobind
  handleDragAndPaste(cm, e, type) {
    const dataTransfer = e[type];
    if (dataTransfer && dataTransfer.files.length > 0) {
      if (dataTransfer.files.length !== 1) { // 只允许一次上传一个图片
        notifications.sigleNotification.show();
        return null;
      }
      if (!/.(png|jpg|jpeg|gif|webp|svg)$/ig.test(dataTransfer.files[0].name)) { // 文件类型不对
        notifications.invaildNotification.show();
        return null;
      }
      e.preventDefault();
      const files = dataTransfer.files[0];
      this.handleUpload(cm, files);
    }
  }

  @autobind
  handleUpload(cm, files) {
    const { imageHostingConfig } = this.props;
    if (!isCanUpload()) {
      notifications.uploadNotification.show();
      return;
    }
    const uuid = `${Date.now()}${key++}`;
    cm.doc.replaceSelection(`![Uploading ${uuid}]()`);
    this.props.dispatch({
      type: UPLOAD_IMAGE,
      imageHostingConfig,
      files,
      uuid,
      from: 'editor',
    });
  }

  render() {
    const { editorMode, drag, fontSize } = this.props;
    let rootClass = '';
    if (editorMode === 'write') {
      rootClass = `${editorMode}-mode'`;
    }
    return (
      <div
        className={`editor-root ${rootClass} ${drag ? 'drag' : ''}`}
        style={{ fontSize: `${fontSize}px` }}
        ref={node => (this.editorRoot = node)}
      >
        <Scrollbars>
          <div
            className="code-container"
            style={{ width: '100%', minHeight: '100%' }}
            ref={node => (this.container = node)}
          />
        </Scrollbars>
      </div>
    );
  }
}
