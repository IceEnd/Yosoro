import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Editor from './Editor';
import Preview from './Preview';
import { pushStateToStorage, mergeStateFromStorage, throttle } from '../../utils/utils';
// import { appMarkdownAdjust } from '../../actions/app';

export default class Markdown extends Component {
  static displayName = 'Markdown';
  static propTypes = {
    dispatch: PropTypes.func.isRequired,
    markdown: PropTypes.shape({
      parentsId: PropTypes.string.isRequired,
      uuid: PropTypes.string.isRequired,
      // file: PropTypes.string.isRequired,
      createDate: PropTypes.string.isRequired,
      latestDate: PropTypes.string.isRequired,
      name: PropTypes.string.isRequired,
      content: PropTypes.string.isRequired,
      html: PropTypes.string.isRequired,
      status: PropTypes.number.isRequired,
      start: PropTypes.number.isRequired,
    }).isRequired,
    markdownSettings: PropTypes.shape({
      editorWidth: PropTypes.number.isRequired,
    }).isRequired,
    editorMode: PropTypes.string.isRequired,
  };

  constructor(props) {
    super(props);
    const { markdownSettings } = props;
    this.setDragWidth = throttle((e) => {
      const width = this.root.offsetWidth;
      const rootLeft = this.root.offsetLeft;
      const x = e.clientX;
      const editorWidthValue = (x - rootLeft) / width;
      if (editorWidthValue <= 0.2 || editorWidthValue >= 0.8) {
        return false;
      }
      const editorWidth = `${editorWidthValue * 100}%`;
      // this.props.dispatch(appMarkdownAdjust({ editorWidth }));
      this.setState({
        editorWidth,
        editorWidthValue,
      });
    }, 60);
    this.state = mergeStateFromStorage('markdownState', {
      drag: false,
      editorWidth: `${markdownSettings.editorWidth * 100}%`,
      editorWidthValue: markdownSettings.editorWidth,
    });
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.markdownSettings.editorWidth !== nextProps.markdownSettings.editorWidth) {
      this.setState({
        editorWidth: `${nextProps.markdownSettings.editorWidth * 100}%`,
        editorWidthValue: nextProps.markdownSettings.editorWidth,
      });
    }
  }

  componentWillUnmount() {
    pushStateToStorage('markdownState', this.state);
  }

  // setWidth = (markdownWidth) => {
  //   this.setState({
  //     markdownWidth,
  //   });
  // }

  setDrag = (drag) => {
    this.setState({
      drag,
    });
  }

  setPreiewScrollRatio = (ratio) => {
    this.preview.setScrollRatio(ratio);
  }

  handleMouseMove = (e) => {
    // e.stopPropagation();
    e.persist();
    if (!this.state.drag) {
      return false;
    }
    this.setDragWidth(e);
  }

  handleMouseUp = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (this.state.drag) {
      this.setState({
        drag: false,
      });
    }
  }

  handMouseLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (this.state.drag) {
      this.setState({
        drag: false,
      });
    }
  }

  render() {
    const { markdown: { content, status, html, start, uuid }, dispatch, editorMode } = this.props;
    const { editorWidth, drag, editorWidthValue } = this.state;
    if (status === 0) {
      return null;
    }
    return (
      <div className="markdown">
        <div
          className="markdown-content"
          onMouseDown={this.handleMouseDown}
          onMouseMove={this.handleMouseMove}
          onMouseUp={this.handleMouseUp}
          onMouseLeave={this.handMouseLeave}
          ref={node => (this.root = node)}
        >
          <Editor
            uuid={uuid}
            setDrag={this.setDrag}
            defaultContent={content}
            dispatch={dispatch}
            start={start}
            editorWidth={editorWidth}
            editorMode={editorMode}
            editorWidthValue={editorWidthValue}
            setPreiewScrollRatio={this.setPreiewScrollRatio}
            drag={drag}
          />
          <Preview
            html={html}
            drag={drag}
            editorMode={editorMode}
            editorWidth={editorWidth}
            editorWidthValue={editorWidthValue}
            ref={node => (this.preview = node)}
          />
        </div>
      </div>
    );
  }
}
