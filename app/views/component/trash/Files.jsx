import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Empty } from 'antd';
import { Scrollbars } from 'react-custom-scrollbars';
import NoteItem from '../share/notebook/NoteItem';
import HOCList from './HOCList';

@HOCList('note')
export default class TestList extends Component {
  static displayName = 'TrashProjects';
  static propTypes = {
    notes: PropTypes.arrayOf(PropTypes.shape({
      uuid: PropTypes.string.isRequired,
      name: PropTypes.string.isRequired,
      description: PropTypes.string.isRequired,
      labels: PropTypes.arrayOf(PropTypes.string).isRequired,
      status: PropTypes.number.isRequired,
    })).isRequired,
    openRestore: PropTypes.func.isRequired,
    openRemove: PropTypes.func.isRequired,
  }

  render() {
    const { notes } = this.props;
    if (notes.length === 0) {
      return (
        <div className="content">
          <Empty className="tips" />
        </div>
      );
    }
    return (
      <Scrollbars autoHide>
        <div className="content">
          <ul className="list">
            {this.props.notes.map((item) => {
              const { uuid } = item;
              return (
                <NoteItem
                  key={`trash-note-${uuid}`}
                  className="list-item"
                  type="note"
                  hasRestore
                  hasRemove
                  restoreFn={this.props.openRestore}
                  removeFn={this.props.openRemove}
                  item={item}
                />
              );
            })}
          </ul>
        </div>
      </Scrollbars>
    );
  }
}
