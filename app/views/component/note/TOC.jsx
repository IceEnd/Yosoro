import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import Scrollbars from 'Share/Scrollbars';
import { eventTOC } from '../../events/eventDispatch';

const renderLabel = (depth) => {
  const label = '#'.repeat(depth);
  return (<span className="header-label">{label}</span>);
};

export default class TOC extends PureComponent {
  static displayName = 'MarkdownTOC';
  static propTypes = {
    visible: PropTypes.bool.isRequired,
  };
  static defaultProps = {
    visible: false,
  };

  constructor() {
    super();
    this.state = {
      headers: [],
    };
  }

  componentDidMount() {
    eventTOC.on('return-toc', this.setTOC);
    if (this.props.visible) {
      eventTOC.emit('get-toc');
    }
  }

  componentDidUpdate(prevProps) {
    if (!prevProps.visible && this.props.visible) {
      eventTOC.emit('get-toc');
    }
  }

  componentWillUnmount() {
    eventTOC.removeListener('return-toc', this.setTOC);
  }

  setTOC = (headers) => {
    this.setState({
      headers,
    });
  }

  handleClick = (id) => {
    eventTOC.emit('toc-jump', id);
  }

  render() {
    const { visible } = this.props;
    const { headers } = this.state;
    if (visible) {
      return (
        <div className="toc-content">
          { visible && headers.length > 0 ? (
            <Scrollbars>
              <ul className="toc-list">
                {headers.map((head) => {
                  const { content, lvl, slug } = head;
                  return (
                    <li
                      key={slug}
                      className="toc-item"
                      onClick={() => this.handleClick(slug)}
                      role="presentation"
                    >
                      {renderLabel(lvl)}
                      {content}
                    </li>
                  );
                })}
              </ul>
            </Scrollbars>
          ) : (
            <p className="tips">No content</p>
          )}
        </div>
      );
    }
    return null;
  }
}

