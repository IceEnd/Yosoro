import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import Editor from './Editor';

function mapStateToProps(state, ownProps) {
  return {
    status: state.markdown.status,
    ...ownProps,
  };
}

@connect(mapStateToProps)
export default class Markdown extends Component {
  static displayName = 'Markdown';
  static propTypes = {
    status: PropTypes.number.isRequired,
  };

  render() {
    if (this.props.status === 0) {
      return null;
    }
    return (
      <div className="markdown select-none">
        <div
          className="markdown-content"
          ref={node => (this.root = node)}
        >
          <Editor />
        </div>
      </div>
    );
  }
}
