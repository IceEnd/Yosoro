import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Editor from './Editor';
// import Preview from './Preview';

export default class Markdown extends Component {
  static displayName = 'Markdown';
  static propTypes = {
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
    }).isRequired,
    markdownSettings: PropTypes.shape({
      editorWidth: PropTypes.number.isRequired,
    }).isRequired,
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
    editor: PropTypes.shape({
      fontSize: PropTypes.number.isRequired,
      previewFontSize: PropTypes.number.isRequired,
      cursorPosition: PropTypes.bool.isRequired,
    }).isRequired,
    editorMode: PropTypes.string.isRequired,
  };

  render() {
    const { markdown: { content, status, start, uuid }, editorMode, note, imageHostingConfig, editor: { fontSize, cursorPosition } } = this.props;
    if (status === 0) {
      return null;
    }
    return (
      <div className="markdown select-none">
        <div
          className="markdown-content"
          ref={node => (this.root = node)}
        >
          <Editor
            fontSize={fontSize}
            cursorPosition={cursorPosition}
            uuid={uuid}
            note={note}
            imageHostingConfig={imageHostingConfig}
            defaultContent={content}
            start={start}
            editorMode={editorMode}
          />
          {/* <Preview
            html={html}
            drag={drag}
            editorMode={editorMode}
            editorWidth={editorWidth}
            editorWidthValue={editorWidthValue}
            fontSize={previewFontSize}
            ref={node => (this.preview = node)}
          /> */}
        </div>
      </div>
    );
  }
}
