import 'codemirror/lib/codemirror.css';
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { ipcRenderer } from 'electron';
import autobind from 'autobind-decorator';
import CodeMirror from 'codemirror';
import 'codemirror/addon/fold/markdown-fold';
import 'codemirror/mode/markdown/markdown';
import ReactResizeDetector from 'react-resize-detector';
import { UPLOAD_IMAGE } from 'Actions/imageHosting';
import { withDispatch } from 'Components/HOC/context';
import Notification from '../share/Notification';
import { updateMarkdownHtml } from '../../actions/markdown';
import { throttle, debounce } from '../../utils/utils';
import eventMd from '../../events/eventMD';

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
export default class Editor extends Component {
  static displayName = 'MarkdownEditor';
  static propTypes = {
    dispatch: PropTypes.func.isRequired,
    uuid: PropTypes.string.isRequired,
    defaultContent: PropTypes.string.isRequired,
    start: PropTypes.number.isRequired,
    editorWidth: PropTypes.string.isRequired,
    setDrag: PropTypes.func.isRequired,
    editorMode: PropTypes.string.isRequired,
    fontSize: PropTypes.number.isRequired,
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
    this.noteRoot = document.getElementById('note_root_cont');
    window.addEventListener('resize', throttle(this.onWindowResize, 60));
    this.container.addEventListener('resize', this.handleContainerResize);
    this.setCodeMirror();
    eventMd.on('sync-value', this.syncValue);
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
      this.addChangeEvent(); // 重新绑定change事件
    }
  }

  componentWillUnmount() {
    window.removeEventListener('resize', throttle(this.onWindowResize, 60));
    eventMd.removeAllListeners('sync-value');
    this.deleteCodeMirror();
  }

  onWindowResize = () => {
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
    if (editorMode === 'normal' || editorMode === 'immersion') {
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

  setCodeMirror = () => {
    this.codeMirror = CodeMirror(this.container, {
      value: this.props.defaultContent,
      mode: 'markdown',
      lineNumbers: true,
      lineWrapping: true,
      // extraKeys: {"Ctrl-Q": function(cm){ cm.foldCode(cm.getCursor()); }},
      foldGutter: true,
      gutters: ['CodeMirror-linenumbers', 'CodeMirror-foldgutter'],
    });
    this.addChangeEvent();
    // this.codeMirror.on('change', this.handleChange);
    this.codeMirror.on('scroll', this.handleScroll);
    this.codeMirror.on('keydown', this.handleKeyDown);
    this.codeMirror.on('focus', this.handleFocus);
    // this.codeMirror.on('dragenter', this.handleDragEnter);
    // this.codeMirror.on('dragleave', this.handleDragLeave);
    // this.codeMirror.on('dragover', this.handleDragOver);
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
    const { note: { projectName, fileName }, defaultContent } = this.props;
    ipcRenderer.send('auto-save-content-to-file', {
      projectName,
      fileName,
      content: defaultContent,
    });
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
    const element = cm.getScrollerElement();
    const heigth = element.scrollHeight;
    const ratio = element.scrollTop / heigth;
    this.props.setPreiewScrollRatio(ratio);
  }

  handleFocus = (cm) => {
    const currentLine = cm.getCursor().line;
    const lines = cm.lineCount();
    this.props.setPreiewScrollRatio(currentLine / lines);
  }

  handleKeyDown = (cm) => {
    this.setState({
      listenScroll: false,
    });
    const ratio = this.getRatio(cm);
    this.props.setPreiewScrollRatio(ratio);
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

  // handleDragStart = (e) => {
  //   e.preventDefault();
  // }

  // handleDragEnter = () => {
  //   // console.log('enter');
  // }

  // handleDragLeave = () => {
  //   // console.log('leave');
  // }

  handleDragOver = () => {
    // console.log('over');
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
    const current = imageHostingConfig.default;
    if (!imageHostingConfig[current].token) {
      uploadNotification.show();
      return null;
    }
    const uuid = `${Date.now()}${key++}`;
    cm.doc.replaceSelection(`![Uploading ${uuid}]()`);
    this.props.dispatch({
      type: UPLOAD_IMAGE,
      current,
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
    } else if (editorMode === 'immersion') {
      width = '100%';
      split = false;
      noBorder = 'no-border';
      rootClass = 'immersion-mode';
    }
    const textWidth = this.getTextWidth(editorMode, editorWidthValue);
    return (
      <div
        className={`editor-root ${rootClass} ${noBorder} ${drag ? 'drag' : ''}`}
        style={{ flexBasis: width, fontSize: `${fontSize}px` }}
        ref={node => (this.editorRoot = node)}
      >
        <ReactResizeDetector handleWidth onResize={this.handleCodeMirrorResize} />
        <div
          className="code-container"
          style={{ width: textWidth, height: '100%' }}
          ref={node => (this.container = node)}
        />
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
