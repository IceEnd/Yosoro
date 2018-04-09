import 'codemirror/lib/codemirror.css';
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import CodeMirror from 'codemirror';
import 'codemirror/addon/fold/markdown-fold';
import 'codemirror/mode/markdown/markdown';
import { updateMarkdownHtml } from '../../actions/markdown';
// import { appMarkdownAdjust } from '../../actions/app';

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
    editorWidthValue: PropTypes.number.isRequired,
    drag: PropTypes.bool.isRequired,
    setPreiewScrollRatio: PropTypes.func.isRequired,
  };

  constructor(props) {
    super(props);
    this.codeMirror = null;
    const textWidth = this.getTextWidth(props);
    this.state = {
      content: props.defaultContent,
      textWidth,
      listenScroll: true,
    };
  }

  componentDidMount() {
    this.noteRoot = document.getElementById('note_root_cont');
    window.addEventListener('resize', this.onWindowResize);
    this.setCodeMirror();
  }

  componentWillReceiveProps(nextProps) {
    const textWidth = this.getTextWidth(nextProps);
    this.setState({
      content: nextProps.defaultContent,
      textWidth,
    });
    if (this.props.uuid !== nextProps.uuid) {
      this.codeMirror.setValue(nextProps.defaultContent);
    }
  }

  componentDidUpdate() {
    const { start } = this.props;
    if (start !== -1) {
      this.editor.selectionStart = start + 1;
      this.editor.selectionEnd = start + 1;
    }
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.onWindowResize);
    this.deleteCodeMirror();
  }

  onWindowResize = () => {
    const { editorMode } = this.props;
    if (editorMode === 'edit') {
      const textWidth = this.getTextWidth();
      this.setState({
        textWidth,
      });
    }
  }

  getTextWidth = (props) => {
    let editorMode;
    let editorWidthValue;
    if (props) {
      editorMode = props.editorMode;
      editorWidthValue = props.editorWidthValue;
    } else {
      editorMode = this.props.editorMode;
      editorWidthValue = this.props.editorWidthValue;
    }
    // const { editorMode, editorWidthValue } = this.props;
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

  getRatio = (cm) => {
    const currentLine = cm.getCursor().line;
    const lines = cm.lineCount();
    return currentLine / lines;
  }

  setCodeMirror = () => {
    this.codeMirror = CodeMirror(this.container, {
      value: this.state.content,
      mode: 'markdown',
      lineNumbers: true,
      lineWrapping: true,
      // extraKeys: {"Ctrl-Q": function(cm){ cm.foldCode(cm.getCursor()); }},
      foldGutter: true,
      gutters: ['CodeMirror-linenumbers', 'CodeMirror-foldgutter'],
    });
    this.codeMirror.on('change', (cm) => {
      const content = cm.getValue();
      const { uuid } = this.props;
      this.props.dispatch(updateMarkdownHtml(content, uuid, -1));
    });
    this.codeMirror.on('scroll', this.handleScroll);
    this.codeMirror.on('keydown', this.handleKeyDown);
    this.codeMirror.on('focus', this.handleFocus);
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

  handleMouseDown = () => {
    this.props.setDrag(true);
  }

  handleMouseUp = () => {
    this.props.setDrag(false);
  }

  render() {
    const { textWidth } = this.state;
    const { editorWidth, editorMode, drag } = this.props;
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
    // const textWidth = this.getTextWidth();
    return (
      <div
        className={`editor-root ${rootClass} ${noBorder} ${drag ? 'drag' : ''}`}
        style={{ flexBasis: width }}
        ref={node => (this.editorRoot = node)}
      >
        <div
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
