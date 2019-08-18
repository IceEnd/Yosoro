
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
import { debounce, animatedScrollTo } from 'Utils/utils';
import { withDispatch, withTheme } from 'Components/HOC/context';
import * as notifications from '../share/notifications';
import { eventTOC } from '../../events/eventDispatch';

let key = 0;
let seed = 0;

const STANDAR_Y = 70;


@withDispatch
@withTheme
export default class Editor extends Component {
  static displayName = 'MarkdownEditor';
  static propTypes = {
    dispatch: PropTypes.func.isRequired,
    uuid: PropTypes.string.isRequired,
    defaultContent: PropTypes.string.isRequired,
    editorMode: PropTypes.string.isRequired,
    fontSize: PropTypes.number.isRequired,
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
      uploadfor: null,
    };
  }

  componentDidMount() {
    this.mounted = true;
    this.noteRoot = document.getElementById('note_root_cont');
    this.setMuya();
    eventTOC.on('toc-jump', this.handleTOCJump);
    eventTOC.on('get-toc', this.getTOC);
    // bind keybord events
    ipcRenderer.on('Editor:Paragraph', this.handleParagraph);
  }

  componentDidUpdate(prevProps) {
    if (prevProps.uuid !== this.props.uuid) {
      // 先解除 change 事件
      this.removeChangeEvent();
      this.muya.setMarkdown(this.props.defaultContent, {
        anchor: {
          ch: 0,
          line: 0,
        },
        focus: {
          ch: 0,
          line: 0,
        },
      });
      // clear history
      this.muya.clearHistory();
      this.scrollToCursor(0);
      // 再次绑定 change 事件
      this.addChangeEvent();
    }
  }

  componentWillUnmount() {
    eventTOC.removeListener('toc-jump', this.handleTOCJump);
    eventTOC.removeListener('get-toc', this.getTOC);
    ipcRenderer.removeListener('Editor:Paragraph', this.handleParagraph);
    this.destroyMuya();
  }

  setMuya = () => {
    const { fontSize, defaultContent } = this.props;
    this.muya = new Muya(this.container, {
      focusMode: false,
      fontSize,
      markdown: defaultContent,
      imageAction: this.imageAction,
      imageUploadAction: this.imageUploadAction,
      // imagePathPicker
    });
    window.muya = this.muya;
    this.addChangeEvent();
  }

  getTOC = () => {
    const res = this.muya.getTOC();
    eventTOC.emit('return-toc', res);
  }

  scrollToCursor(duration = 300) {
    setImmediate(() => {
      if (!this.editorContainer) {
        this.editorContainer = document.querySelector('#editorContainer');
      }
      const container = this.muya.container.parentElement;
      if (container) {
        const { y } = this.muya.getSelection().cursorCoords;
        animatedScrollTo(container, (container.scrollTop + y) - STANDAR_Y, duration);
      }
    });
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
      setTimeout(() => this.muya.on('change', this.handleChange), 0);
    }
  }

  removeChangeEvent() {
    if (this.muya) {
      this.muya.off('change', this.handleChange);
    }
  }

  handleTOCJump = (id) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView();
    }
  }

  handleChange = ({ markdown }) => {
    const { uuid } = this.props;
    this.props.dispatch(updateMarkdownHtml(markdown, uuid, -1));
    this.autoSave();
  }

  handleParagraph = (e, type) => {
    if (this.muya && type) {
      this.muya.updateParagraph(type);
    }
  }

  destroyMuya = () => {
    if (this.muya) {
      this.muya.destroy();
      this.muya = null;
    }
  }

  imageAction = (image) => {
    if (typeof image === 'string') {
      return image;
    }
    return 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjRweCIgIGhlaWdodD0iNjRweCIgIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgdmlld0JveD0iMCAwIDEwMCAxMDAiIHByZXNlcnZlQXNwZWN0UmF0aW89InhNaWRZTWlkIiBjbGFzcz0ibGRzLWVjbGlwc2UiIHN0eWxlPSJiYWNrZ3JvdW5kOiBub25lOyI+PHBhdGggbmctYXR0ci1kPSJ7e2NvbmZpZy5wYXRoQ21kfX0iIG5nLWF0dHItZmlsbD0ie3tjb25maWcuY29sb3J9fSIgc3Ryb2tlPSJub25lIiBkPSJNMTAgNTBBNDAgNDAgMCAwIDAgOTAgNTBBNDAgNDIgMCAwIDEgMTAgNTAiIGZpbGw9IiM4Y2QwZTUiIHRyYW5zZm9ybT0icm90YXRlKDExOS44OCA1MCA1MSkiPjxhbmltYXRlVHJhbnNmb3JtIGF0dHJpYnV0ZU5hbWU9InRyYW5zZm9ybSIgdHlwZT0icm90YXRlIiBjYWxjTW9kZT0ibGluZWFyIiB2YWx1ZXM9IjAgNTAgNTE7MzYwIDUwIDUxIiBrZXlUaW1lcz0iMDsxIiBkdXI9IjFzIiBiZWdpbj0iMHMiIHJlcGVhdENvdW50PSJpbmRlZmluaXRlIj48L2FuaW1hdGVUcmFuc2Zvcm0+PC9wYXRoPjwvc3ZnPg==';
  }

  imageUploadAction = ({ filePath, base64 }, cb) => {
    const { imageHostingConfig, uuid } = this.props;
    if (!isCanUpload()) {
      notifications.uploadNotification.show();
      return;
    }
    this.setState({
      uploadfor: uuid,
    });
    ipcRenderer.once(`pic-upload-sync-cb-${++seed}`, (event, args) => {
      const { code, data } = args;
      if (code === 0) {
        this.props.dispatch({
          type: UPLOAD_IMAGE_SUCCESS,
          data,
        });
        if (cb && this.state.uploadfor === this.props.uuid) {
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
        filePath,
        base64,
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
    const { editorMode, fontSize } = this.props;
    let rootClass = '';
    if (editorMode === 'write') {
      rootClass = `${editorMode}-mode'`;
    }
    return (
      <div
        className={`editor-root ${rootClass}`}
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
