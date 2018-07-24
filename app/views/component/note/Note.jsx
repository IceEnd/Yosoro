import React from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';
import Explorer from './Explorer';
import Markdown from '../editor/Markdown';
import ToolBar from './ToolBar';
import Loading from '../share/Loading';

import '../../assets/scss/note.scss';

const NoteWorkspace = (props) => {
  const { projects, markdown, dispatch, note, markdownSettings, editorMode, searchStatus, searchResult, exportQueue: { status: exportStatus }, imageHosting } = props;
  let projectData;
  if (searchStatus === 0) {
    projectData = projects;
  } else if (searchStatus === 1) {
    projectData = searchResult;
  }
  const blur = exportStatus === 1;
  const contClass = classnames('note-root-cont', {
    'note-blur': blur,
  });
  return (
    <div className="note-root">
      {blur ? (
        <Loading tip="Exporting..." />
      ) : null}
      <ToolBar
        markdown={markdown}
        editorMode={editorMode}
        dispatch={dispatch}
        searchStatus={searchStatus}
        note={note}
        blur={blur}
      />
      <div className={contClass} id="note_root_cont">
        <Explorer
          projects={projectData}
          dispatch={dispatch}
          note={note}
          editorMode={editorMode}
          searchStatus={searchStatus}
          hasEdit={markdown.hasEdit}
        />
        <Markdown
          imageHosting={imageHosting}
          markdown={markdown}
          markdownSettings={markdownSettings}
          dispatch={dispatch}
          editorMode={editorMode}
          note={note}
        />
      </div>
    </div>
  );
};

NoteWorkspace.displayName = 'NoteSpace';
NoteWorkspace.propTypes = {
  dispatch: PropTypes.func.isRequired,
  imageHosting: PropTypes.shape({
    default: PropTypes.oneOf(['github']).isRequired,
    github: PropTypes.shape({
      repo: PropTypes.string.isRequired,
      branch: PropTypes.string.isRequired,
      token: PropTypes.string.isRequired,
      path: PropTypes.string.isRequired,
      domain: PropTypes.string.isRequired,
    }).isRequired,
  }).isRequired,
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
  exportQueue: PropTypes.shape({
    status: PropTypes.number.isRequired,
  }).isRequired,
};

export default NoteWorkspace;
