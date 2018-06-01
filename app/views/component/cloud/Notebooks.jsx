import React from 'react';
import PropTypes from 'prop-types';
import NoteItem from '../share/notebook/NoteItem';

const Notebooks = (props) => {
  const { projects } = props;
  if (projects.length === 0) {
    return (<p className="tips">List is empty.</p>);
  }
  return (
    <ul className="list">
      {projects.map((item) => {
        if (typeof item.folder === 'undefined') {
          return null;
        }
        return (
          <NoteItem
            key={item.id}
            type="notebook"
            className="list-item"
            hasRemove
            isCloud
            itemClick={() => props.chooseProject(item.name)}
            removeFn={props.openRemove}
            item={item}
          />
        );
      })}
    </ul>
  );
};

Notebooks.displayName = 'CloudDriveNotebooks';
Notebooks.propTypes = {
  projects: PropTypes.array.isRequired,
  // chooseProject: PropTypes.func.isRequired,
  openRemove: PropTypes.func.isRequired,
};

export default Notebooks;
