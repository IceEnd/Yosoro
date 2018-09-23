import React from 'react';
import PropTypes from 'prop-types';
import NoteItem from '../share/notebook/NoteItem';

const Notes = (props) => {
  const { notes } = props;
  if (notes.length === 0) {
    return (<p className="tips">List is empty.</p>);
  }
  return (
    <ul className="list">
      {notes.map((item) => {
        const { name } = item;
        let showName = '';
        if (!/.md$/ig.test(name)) {
          return null;
        }
        showName = name.replace(/.md$/ig, '');
        return (
          <NoteItem
            key={item.id}
            type="note"
            isCloud
            className="list-item"
            title={showName}
            hasRemove
            hasDownload
            removeFn={props.openRemove}
            downloadFn={props.downloadNote}
            item={item}
          />
        );
      })}
    </ul>
  );
};

Notes.displayName = 'CloudDriveNotes';
Notes.propTypes = {
  notes: PropTypes.array.isRequired,
  downloadNote: PropTypes.func.isRequired,
  openRemove: PropTypes.func.isRequired,
};

export default Notes;
