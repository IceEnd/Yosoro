import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import autobind from 'autobind-decorator';
import { ipcRenderer, remote } from 'electron';
import classNames from 'classnames';
import { getWebviewPreJSPath } from '../../utils/utils';
import LoadingImg from '../../assets/images/loading.svg';

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
      loading: true,
    };
  }

  componentDidMount() {
    this.noteRoot = document.getElementById('note_root_cont');
    window.addEventListener('resize', this.onWindowResize);
    this.webview.addEventListener('ipc-message', this.onWVMessage);
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
    const { html, editorMode } = this.props;
    this.webview.send('wv-render-html', {
      html,
      editorMode,
    });
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.onWindowResize);
    this.webview.removeEventListener('ipc-message', this.onWVMessage);
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

  @autobind
  onWVMessage(event) {
    const channel = event.channel;
    const { html, editorMode } = this.props;
    switch (channel) {
      case 'wv-first-loaded': {
        this.webview.send('wv-render-html', {
          html,
          editorMode,
        });
        this.setState({
          loading: false,
        });
        break;
      }
      case 'did-click-link': {
        let href = '';
        if (event.args && event.args.length) {
          href = event.args[0];
        }
        if (/^https?:\/\//i.test(href)) {
          remote.shell.openExternal(href);
        }
        break;
      }
      default:
        break;
    }
  }

  getBodyWidth(props) {
    let editorMode;
    let editorWidthValue;
    if (props) {
      editorMode = props.editorMode;
      editorWidthValue = props.editorWidthValue;
    } else {
      editorMode = this.props.editorMode;
      editorWidthValue = this.props.editorWidthValue;
    }
    if (editorMode === 'normal') {
      return '100%';
    }
    if (editorMode === 'preview') {
      return '100%';
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
    // const height = this.previewBody.offsetHeight;
    // const scrollTop = height * radio;
    // this.preview.scrollTop = scrollTop;
    this.webview.send('wv-scroll', radio);
  }

  @autobind
  openWVDevTools() {
    if (this.webview) {
      this.webview.openDevTools();
    }
  }

  renderLoading() {
    if (this.state.loading) {
      return (
        <img
          className="preview-loading"
          src={LoadingImg}
          style={{
            position: 'absolute',
          }}
          alt=""
        />
      );
    }
  }

  render() {
    const { bodyWidth } = this.state;
    const { editorMode, drag } = this.props;
    const rootClass = classNames(
      'preview-root',
      {
        hide: editorMode === 'immersion',
      },
      {
        'pre-mode': editorMode === 'preview',
      },
      {
        drag,
      }
    );
    return (
      <div
        className={rootClass}
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
        {this.renderLoading()}
        <div
          className="preview-body"
          style={{ width: bodyWidth }}
          ref={node => (this.previewBody = node)}
        >
          <webview
            id="webview"
            className="preview-webview"
            autoresize="on"
            webpreferences="contextIsolation=yes"
            disableblinkfeatures="Auxclick"
            src={webviewPath}
            preload={preJSPath}
            onDrop={e => e.preventDefault()}
            ref={node => (this.webview = node)}
          />
        </div>
      </div>
    );
  }
}
