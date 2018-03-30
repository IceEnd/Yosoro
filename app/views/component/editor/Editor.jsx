import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { updateMarkdownHtml } from '../../actions/markdown';
// import { appMarkdownAdjust } from '../../actions/app';

export default class Editor extends Component {
  static displayName = 'MarkdownEditor';
  static propTypes = {
    dispatch: PropTypes.func.isRequired,
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
  }

  componentWillReceiveProps(nextProps) {
    const textWidth = this.getTextWidth(nextProps);
    this.setState({
      content: nextProps.defaultContent,
      textWidth,
    });
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

  handleScroll = () => {
    const { listenScroll } = this.state;
    if (!listenScroll) {
      this.setState({
        listenScroll: true,
      });
      return false;
    }
    const heigth = this.editor.scrollHeight;
    const ratio = this.editor.scrollTop / heigth;
    this.props.setPreiewScrollRatio(ratio);
  }

  handleChange = (e) => {
    const content = e.target.value;
    this.props.dispatch(updateMarkdownHtml(content, -1));
  }

  handleClick = (e) => {
    const { content } = this.state;
    const start = e.target.selectionStart;
    const lines = content.substr(0, start).split('\n').length - 1;
    const lineAmount = content.split('\n').length;
    this.props.setPreiewScrollRatio(lines / lineAmount);
  }

  handleKeyDown = (e) => {
    if (e.keyCode === 9) { // 制表符
      e.preventDefault();
      const val = e.target.value;
      const start = e.target.selectionStart;
      const end = e.target.selectionEnd;
      const content = `${val.substring(0, start)}\t${val.substring(end)}`;
      this.props.dispatch(updateMarkdownHtml(content, start));
    }
    this.setState({
      listenScroll: false,
    });
    const { content } = this.state;
    const start = e.target.selectionStart;
    const lines = content.substr(0, start).split('\n').length - 1;
    const lineAmount = content.split('\n').length;
    this.props.setPreiewScrollRatio(lines / lineAmount);
  }

  handleMouseDown = () => {
    this.props.setDrag(true);
  }

  handleMouseUp = () => {
    this.props.setDrag(false);
  }

  render() {
    const { content, textWidth } = this.state;
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
        style={{ width }}
        ref={node => (this.editorRoot = node)}
      >
        <div
          style={{ width: textWidth, height: '100%' }}
        >
          <textarea
            className="text"
            placeholder="write something..."
            value={content}
            onChange={this.handleChange}
            onKeyDown={this.handleKeyDown}
            onScroll={this.handleScroll}
            onClick={this.handleClick}
            ref={node => (this.editor = node)}
          />
        </div>
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
