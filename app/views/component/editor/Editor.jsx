
import 'Assets/scss/code/dark.scss';
import 'Assets/scss/code/editor.scss';
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { ipcRenderer } from 'electron';
import { Scrollbars } from 'react-custom-scrollbars';
import autobind from 'autobind-decorator';
import CheerS from 'Utils/cheers/CheerS';
import ReactResizeDetector from 'react-resize-detector';
import { UPLOAD_IMAGE } from 'Actions/imageHosting';
import { saveNote } from 'Actions/projects';
import { updateMarkdownHtml } from 'Actions/markdown';
import { isCanUpload } from 'Utils/db/app';
import { throttle, debounce } from 'Utils/utils';
import { withDispatch, withTheme } from 'Components/HOC/context';
import Notification from '../share/Notification';
import { eventMD, eventTOC } from '../../events/eventDispatch';

let key = 0;

const uploadNotification = new Notification({
  title: 'Image upload failed',
  body: 'Please check the network or configuration',
  key: 'editor-upload-notification',
});

const invaildNotification = new Notification({
  title: 'Only support uploading images',
  body: 'Support upload jpg, jpeg, png, svg, webp',
  key: 'editor-invaild-notification',
});

const sigleNotification = new Notification({
  title: 'Image upload failed',
  body: 'Uploading multiple files is not supported',
  key: 'editor-single-file-notification',
});

@withDispatch
@withTheme
export default class Editor extends Component {
  static displayName = 'MarkdownEditor';
  static propTypes = {
    dispatch: PropTypes.func.isRequired,
    theme: PropTypes.string.isRequired,
    uuid: PropTypes.string.isRequired,
    defaultContent: PropTypes.string.isRequired,
    start: PropTypes.number.isRequired,
    editorWidth: PropTypes.string.isRequired,
    setDrag: PropTypes.func.isRequired,
    editorMode: PropTypes.string.isRequired,
    fontSize: PropTypes.number.isRequired,
    cursorPosition: PropTypes.number.isRequired,
    editorWidthValue: PropTypes.number.isRequired,
    drag: PropTypes.bool.isRequired,
    setPreiewScrollRatio: PropTypes.func.isRequired,
    note: PropTypes.shape({
      projectUuid: PropTypes.string.isRequired,
      projectName: PropTypes.string.isRequired,
      fileUuid: PropTypes.string.isRequired,
      fileName: PropTypes.string.isRequired,
    }).isRequired,
    imageHostingConfig: PropTypes.shape({
      default: PropTypes.oneOf(['github']).isRequired,
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
    this.codeMirror = null;
    this.containerResize = debounce(() => {
      this.codeMirror.refresh();
    }, 100);
    this.state = {
      listenScroll: true,
    };
  }

  componentDidMount() {
    this.mounted = true;
    this.noteRoot = document.getElementById('note_root_cont');
    window.addEventListener('resize', this.onWindowResize);
    this.container.addEventListener('resize', this.handleContainerResize);
    this.setCodeMirror();
    eventMD.on('sync-value', this.syncValue);
    eventTOC.on('toc-jump', this.handleTOCJump);
  }

  componentDidUpdate(prevProps) {
    const { start } = this.props;
    if (start !== -1) {
      this.editor.selectionStart = start + 1;
      this.editor.selectionEnd = start + 1;
    }
    if (prevProps.uuid !== this.props.uuid) {
      this.removeChangeEvent(); // 取消change事件
      this.codeMirror.setValue(this.props.defaultContent);
      this.codeMirror.clearHistory();
      this.addChangeEvent(); // 重新绑定change事件
    }
  }

  componentWillUnmount() {
    window.removeEventListener('resize', throttle(this.onWindowResize, 60));
    eventMD.removeAllListeners('sync-value');
    eventTOC.removeListener('toc-jump', this.handleTOCJump);
    this.deleteCodeMirror();
  }

  @autobind
  onWindowResize() {
    const { editorMode } = this.props;
    if (editorMode === 'edit') {
      const { editorWidthValue } = this.props;
      const textWidth = this.getTextWidth(editorMode, editorWidthValue);
      this.setState({
        textWidth,
      });
    }
  }

  getRatio = (cm) => {
    const currentLine = cm.getCursor().line;
    const lines = cm.lineCount();
    return currentLine / lines;
  }

  getTextWidth(editorMode, editorWidthValue) {
    if (editorMode === 'normal' || editorMode === 'immersion' || editorMode === 'write') {
      return '100%';
    }
    if (this.editorRoot) {
      let parentWidth;
      if (editorMode === 'edit') {
        parentWidth = this.noteRoot.offsetWidth;
      } else {
        parentWidth = this.editorRoot.offsetParent.offsetWidth;
      }
      let res = '100%';
      if (editorWidthValue && parentWidth) {
        res = `${parentWidth * editorWidthValue}px`;
      }
      return res;
    }
    return '100%';
  }

  getTheme = () => {
    const { theme } = this.props;
    switch (theme) {
      case 'light':
        return 'default';
      case 'dark':
        return 'dark';
      default:
        return 'default';
    }
  }

  setCodeMirror = () => {
    const theme = this.getTheme();
    this.codeMirror = CheerS(this.container, {
      value: this.props.defaultContent,
      mode: {
        name: 'markdown',
        highlightFormatting: true,
        strikethrough: true,
        fencedCodeBlockHighlighting: true,
      },
      lineNumbers: true,
      lineWrapping: true,
      foldGutter: true,
      gutters: ['CodeMirror-linenumbers', 'CodeMirror-foldgutter'],
      theme,
      scrollbarStyle: 'overlay',
    });
    this.addChangeEvent();
    this.codeMirror.on('scroll', this.handleScroll);
    this.codeMirror.on('keydown', this.handleKeyDown);
    this.codeMirror.on('focus', this.handleFocus);
    this.codeMirror.on('drop', this.handleDrop);
    this.codeMirror.on('paste', this.handlePaste);
  }

  syncValue = () => {
    const { top } = this.codeMirror.getScrollInfo();
    this.codeMirror.setValue(this.props.defaultContent);
    this.codeMirror.scrollTo(0, top);
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

  removeChangeEvent() {
    if (this.codeMirror) {
      this.codeMirror.off('change', this.handleChange);
    }
  }

  addChangeEvent() {
    if (this.codeMirror) {
      this.codeMirror.on('change', this.handleChange);
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

  handleChange = (cm) => {
    const content = cm.getValue();
    const { uuid } = this.props;
    this.props.dispatch(updateMarkdownHtml(content, uuid, -1));
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

  deleteCodeMirror = () => {this.codeMirror = null;}

  handleScroll = (cm) => {
    const { listenScroll } = this.state;
    if (!listenScroll) {
      this.setState({
        listenScroll: true,
      });
      return false;
    }
    const { top, height, clientHeight } = cm.getScrollInfo();
    const scrollHeight = height - clientHeight || 1;
    const ratio = top / scrollHeight;
    this.props.setPreiewScrollRatio(ratio);
  }

  handleFocus = (cm) => {
    this.handleNeedScroll(cm);
  }

  handleKeyDown = (cm) => {
    this.setState({
      listenScroll: false,
    });
    this.handleNeedScroll(cm);
  }

  handleNeedScroll = (cm) => {
    const { cursorPosition } = this.props;
    if (cursorPosition) {
      const ratio = this.getRatio(cm);
      this.props.setPreiewScrollRatio(ratio);
    }
  }

  @autobind
  handleMouseDown() {
    this.props.setDrag(true);
  }

  @autobind
  handleMouseUp() {
    this.props.setDrag(false);
  }

  @autobind
  handleCodeMirrorResize() {
    this.containerResize();
  }

  @autobind
  handleDrop(cm, e) {
    this.handleDragAndPaste(cm, e, 'dataTransfer');
  }

  @autobind
  handlePaste(cm, e) {
    this.handleDragAndPaste(cm, e, 'clipboardData');
  }

  @autobind
  handleDragAndPaste(cm, e, type) {
    const dataTransfer = e[type];
    if (dataTransfer && dataTransfer.files.length > 0) {
      if (dataTransfer.files.length !== 1) { // 只允许一次上传一个图片
        sigleNotification.show();
        return null;
      }
      if (!/.(png|jpg|jpeg|gif|webp|svg)$/ig.test(dataTransfer.files[0].name)) { // 文件类型不对
        invaildNotification.show();
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
    // const  = imageHostingConfig.default;
    if (!isCanUpload()) {
      uploadNotification.show();
      return;
    }
    const uuid = `${Date.now()}${key++}`;
    cm.doc.replaceSelection(`![Uploading ${uuid}]()`);
    this.props.dispatch({
      type: UPLOAD_IMAGE,
      // current,
      imageHostingConfig,
      files,
      uuid,
      from: 'editor',
    });
  }

  render() {
    // const { textWidth } = this.state;
    const { editorWidth, editorMode, editorWidthValue, drag, fontSize } = this.props;
    let width = editorWidth;
    let rootClass = '';
    let split = true;
    let noBorder = '';
    if (editorMode === 'preview') {
      width = '0';
      rootClass = 'hide';
      split = false;
      noBorder = 'no-border';
    } else if (editorMode === 'immersion' || editorMode === 'write') {
      width = '100%';
      split = false;
      noBorder = 'no-border';
      rootClass = `${editorMode}-mode'`;
    }
    const textWidth = this.getTextWidth(editorMode, editorWidthValue);
    return (
      <div
        className={`editor-root ${rootClass} ${noBorder} ${drag ? 'drag' : ''}`}
        style={{ flexBasis: width, fontSize: `${fontSize}px` }}
        ref={node => (this.editorRoot = node)}
      >
        <ReactResizeDetector handleWidth onResize={this.handleCodeMirrorResize} />
        <Scrollbars>
          <div
            className="code-container"
            style={{ width: textWidth, height: '100%' }}
            ref={node => (this.container = node)}
          />
        </Scrollbars>
        { split ? (
          <span
            className="resize-right"
            onMouseDown={this.handleMouseDown}
            onMouseUp={this.handleMouseUp}
          />
        ) : null}
      </div>
    );
  }
}
