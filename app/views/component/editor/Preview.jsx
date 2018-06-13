import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import autobind from 'autobind-decorator';
import { ipcRenderer } from 'electron';
import { getWebviewPreJSPath } from '../../utils/utils';

import '../../assets/scss/preview.scss';

const isDEV = process.env.NODE_ENV === 'development';

const preJSPath = getWebviewPreJSPath();

const webviewPath = ipcRenderer.sendSync('get-webview-path');

export default class Preview extends PureComponent {
  static displayName = 'MarkdownPreview';
  static propTypes = {
    html: PropTypes.string.isRequired,
    editorMode: PropTypes.string.isRequired,
    // editorWidth: PropTypes.string.isRequired,
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
    this.webview.addEventListener('ipc-message', (event) => {
      const channel = event.channel;
      const { html } = this.props;
      switch (channel) {
        case 'wv-first-loaded':
          this.webview.send('wv-render-html', html);
          break;
        default:
          break;
      }
    });
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.editorMode !== nextProps.editorMode || this.props.editorWidthValue !== nextProps.editorWidthValue) {
      const bodyWidth = this.getBodyWidth(nextProps);
      this.setState({
        bodyWidth,
      });
    }
  }

  componentDidUpdate() {
    const { html } = this.props;
    this.webview.send('wv-render-html', html);
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

  getBodyWidth(props) {
    let editorMode;
    let editorWidthValue;
    // const { editorMode, editorWidthValue } = props;
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
    if (!this.preview || !this.noteRoot) {
      return '100%';
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

  setScrollRatio(radio) {
    const height = this.previewBody.offsetHeight;
    const scrollTop = height * radio;
    this.preview.scrollTop = scrollTop;
  }

  @autobind
  openWVDevTools() {
    if (this.webview) {
      this.webview.openDevTools();
    }
  }

  render() {
    const { bodyWidth } = this.state;
    const { editorMode, drag } = this.props;
    let rootClass = '';
    if (editorMode === 'immersion') {
      rootClass = 'hide';
    } else if (editorMode === 'preview') {
      rootClass = 'pre-mode';
    }
    return (
      <div
        className={`preview-root ${rootClass} ${drag ? 'drag' : ''}`}
        ref={node => (this.preview = node)}
      >
        {isDEV ? (
          <span
            className="wv-dev-tools"
            onClick={this.openWVDevTools}
          >
            devtools
          </span>
        ) : null}
        <div
          className="preview-body"
          style={{ width: bodyWidth }}
          ref={node => (this.previewBody = node)}
        >
          <webview
            id="webview"
            className="preview-webview"
            disableguestresize="true"
            src={webviewPath}
            preload={preJSPath}
            ref={node => (this.webview = node)}
          />
        </div>
      </div>
    );
  }
}
