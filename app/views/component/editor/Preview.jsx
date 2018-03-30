import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';

import '../../assets/scss/preview.scss';

export default class Preview extends PureComponent {
  static displayName = 'MarkdownPreview';
  static propTypes = {
    html: PropTypes.string.isRequired,
    editorMode: PropTypes.string.isRequired,
    editorWidth: PropTypes.string.isRequired,
    drag: PropTypes.bool.isRequired,
    editorWidthValue: PropTypes.number.isRequired,
  };

  constructor(props) {
    super(props);
    const bodyWidth = this.getBodyWidth(props);
    this.state = {
      bodyWidth,
    };
  }

  componentDidMount() {
    this.noteRoot = document.getElementById('note_root_cont');
    window.addEventListener('resize', this.onWindowResize);
  }

  componentWillReceiveProps(nextProps) {
    const bodyWidth = this.getBodyWidth(nextProps);
    this.setState({
      bodyWidth,
    });
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.onWindowResize);
  }

  onWindowResize = () => {
    const { editorMode } = this.props;
    if (editorMode === 'edit') {
      const bodyWidth = this.getBodyWidth();
      this.setState({
        bodyWidth,
      });
    }
  }

  getBodyWidth= (props) => {
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
    if (editorMode === 'normal') {
      return '100%';
    }
    if (editorMode === 'preview') {
      return '70%';
    }
    if (this.preview) {
      let parentWidth;
      if (editorMode === 'edit') {
        parentWidth = this.noteRoot.offsetWidth;
      } else {
        parentWidth = this.preview.offsetParent.offsetWidth;
      }
      let res = '100%';
      if (editorWidthValue && parentWidth) {
        res = `${parentWidth * (1 - editorWidthValue)}px`;
      }
      return res;
    }
    return '100%';
  }

  setScrollRatio = (radio) => {
    const height = this.prevewBody.offsetHeight;
    const scrollTop = height * radio;
    this.preview.scrollTop = scrollTop;
  }

  render() {
    const { bodyWidth } = this.state;
    const { html, editorMode, drag, editorWidth } = this.props;
    let rootClass = '';
    let rootWidth = `${100 - parseFloat(editorWidth.replace(/%$/, ''))}%`;
    if (editorMode === 'immersion') {
      rootClass = 'hide';
      rootWidth = '0';
    } else if (editorMode === 'preview') {
      rootClass = 'pre-mode';
      rootWidth = '100%';
    }
    // const bodyWidth = this.getBodyWidth();
    return (
      <div
        className={`preview-root ${rootClass} ${drag ? 'drag' : ''}`}
        ref={node => (this.preview = node)}
        style={{ width: rootWidth }}
      >
        <div
          className="preview-body"
          dangerouslySetInnerHTML={{ __html: html }}
          style={{ width: bodyWidth }}
          ref={node => (this.prevewBody = node)}
        />
      </div>
    );
  }
}
