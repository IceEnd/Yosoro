import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { markedTOC } from 'Utils/utils';
import { eventTOC } from '../../events/eventDispatch';

const renderLabel = (depth) => {
  const label = '#'.repeat(depth);
  return (<span className="header-label">{label}</span>);
};

export default class TOC extends PureComponent {
  static displayName = 'MarkdownTOC';
  static propTypes = {
    visible: PropTypes.bool.isRequired,
    // content: PropTypes.string.isRequired,
  };
  static defaultProps = {
    visible: false,
  };

  static getDerivedStateFromProps(props) {
    const { visible, content } = props;
    let headers = [];
    if (visible && content) {
      headers = markedTOC(content);
    }
    return {
      headers,
    };
  }

  constructor() {
    super();
    this.state = {
      headers: [],
    };
  }

  handleClick = (text) => {
    eventTOC.emit('toc-jump', text);
  }

  render() {
    const { visible } = this.props;
    const { headers } = this.state;
    if (visible) {
      return (
        <div className="toc-content">
          { visible && headers.length > 0 ? (
            <ul className="toc-list">
              {headers.map((head) => {
                const { depth, text } = head;
                return (
                  <li
                    className="toc-item"
                    onClick={() => this.handleClick(text)}
                    role="presentation"
                  >
                    {renderLabel(depth)}
                    {text}
                  </li>
                );
              })}
            </ul>
          ) : (
            <p className="tips">No content</p>
          )}
        </div>
      );
    }
    return null;
  }
}

