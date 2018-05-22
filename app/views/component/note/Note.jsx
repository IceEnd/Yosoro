import React from 'react';
import PropTypes from 'prop-types';
import Explorer from './Explorer';
import Markdown from '../editor/Markdown';
import ToolBar from './ToolBar';

import '../../assets/scss/note.scss';

const NoteWorkspace = (props) => {
  const { projects, markdown, dispatch, note, markdownSettings, editorMode, searchStatus, searchResult } = props;
  let projectData;
  if (searchStatus === 0) {
    projectData = projects;
  } else if (searchStatus === 1) {
    projectData = searchResult;
  }
  return (
    <div className="note-root">
      <ToolBar
        markdown={markdown}
        editorMode={editorMode}
        dispatch={dispatch}
        searchStatus={searchStatus}
        note={note}
      />
      <div className="note-root-cont" id="note_root_cont">
        <Explorer
          projects={projectData}
          dispatch={dispatch}
          note={note}
          editorMode={editorMode}
          searchStatus={searchStatus}
          hasEdit={markdown.hasEdit}
        />
        <Markdown
          markdown={markdown}
          markdownSettings={markdownSettings}
          dispatch={dispatch}
          editorMode={editorMode}
        />
      </div>
    </div>
  );
};

NoteWorkspace.displayName = 'NoteSpace';
NoteWorkspace.propTypes = {
  dispatch: PropTypes.func.isRequired,
  projects: PropTypes.arrayOf(PropTypes.shape({
    uuid: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    description: PropTypes.string.isRequired,
    labels: PropTypes.arrayOf(PropTypes.string).isRequired,
    status: PropTypes.number.isRequired,
    notes: PropTypes.array.isRequired,
  })).isRequired,
  searchResult: PropTypes.arrayOf(PropTypes.shape({
    uuid: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    description: PropTypes.string.isRequired,
    labels: PropTypes.arrayOf(PropTypes.string).isRequired,
    status: PropTypes.number.isRequired,
    notes: PropTypes.array.isRequired,
  })).isRequired,
  searchStatus: PropTypes.number.isRequired,
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
    hasEdit: PropTypes.bool.isRequired,
    uploadStatus: PropTypes.number.isRequired,
  }).isRequired,
  note: PropTypes.shape({
    projectUuid: PropTypes.string.isRequired,
    projectName: PropTypes.string.isRequired,
    fileUuid: PropTypes.string.isRequired,
    exportStatus: PropTypes.number.isRequired,
  }).isRequired,
  markdownSettings: PropTypes.shape({
    editorWidth: PropTypes.number.isRequired,
  }).isRequired,
  editorMode: PropTypes.string.isRequired,
};

export default NoteWorkspace;
