import React, { memo, useMemo } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { message } from 'antd';
import { ipcRenderer } from 'electron';
import Scrollbars from 'Share/Scrollbars';
import { getFolderByUuid } from 'Utils/utils';
import Item from 'Share/notebook/NoteItem';
import { pushTrashFolder, permantRemoveFile, restoreFile } from 'Actions/projects';

const Content = memo((props) => {
  const { trashPath, notes, data } = props;
  let uuid;
  if (trashPath.length > 0) {
    uuid = trashPath[trashPath.length - 1].uuid;
  }
  const files = useMemo(() => {
    if (!uuid) {
      // root
      return notes.filter(item => item.status === 0);
    }
    return notes.filter(item => item.status === 1 && item.parentsId === uuid);
  }, [trashPath, notes]);
  const floders = useMemo(() => {
    if (!uuid) {
      return data;
    }
    const target = getFolderByUuid(data, uuid).head;
    return target.children || [];
  }, [trashPath]);

  // const handleClick = item => pushFolder(item.uuid, item.name);
  const deleteFile = (e, id, file) => {
    const response = ipcRenderer.sendSync('NOTES:permanent-remove-file', id);
    if (!response.success) {
      message.error(`Delete "${file}" failed`);
      return;
    }
    props.deleteFile(id);
  };
  const reFile = (e, item) => {
    const { uuid: id, name, parentsId } = item;
    const target = getFolderByUuid(props.folders, parentsId);
    if (!target) {
      message.error('The original folder does not exist');
      return;
    }
    const response = ipcRenderer.sendSync('NOTES:restore-file', {
      uuid: id,
      name,
      folder: target.path,
    });
    if (!response.success) {
      message.error('The original folder does not exist');
      return;
    }
    props.restoreFile(id);
  };

  return (
    <Scrollbars>
      <div className="content">
        <ul className="list">
          {floders.map(item => (
            <Item
              key={`trash-folder-${item.uuid}`}
              className="list-item"
              type="folder"
              hasRestore
              hasRemove
              item={item}
              // itemClick={() => handleClick(item)}
            />
          ))}
          {files.map(item => (
            <Item
              key={`trash-file-${item.uuid}`}
              className="list-item"
              type="document"
              hasRestore
              hasRemove
              removeFn={deleteFile}
              restoreFn={reFile}
              item={item}
            />
          ))}
        </ul>
      </div>
    </Scrollbars>
  );
});
Content.displayName = 'TrashContent';
Content.propTypes = {
  trashPath: PropTypes.arrayOf(PropTypes.shape({
    uuid: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
  })).isRequired,
  notes: PropTypes.arrayOf(PropTypes.shape({
    uuid: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    description: PropTypes.string.isRequired,
    labels: PropTypes.arrayOf(PropTypes.string).isRequired,
    status: PropTypes.number.isRequired,
    parentsId: PropTypes.string.isRequired,
  })).isRequired,
  data: PropTypes.arrayOf(PropTypes.shape({
    uuid: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    description: PropTypes.string.isRequired,
    status: PropTypes.number.isRequired,
  })).isRequired,
  folders: PropTypes.arrayOf(PropTypes.shape({
    uuid: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    status: PropTypes.number.isRequired,
  })).isRequired,
  // action func
  deleteFile: PropTypes.func.isRequired,
  restoreFile: PropTypes.func.isRequired,
};

function mapStateToProps(state, ownProps) {
  const { projects: { trashPath = [], projects, notes, trashProjects } } = state;
  return {
    trashPath,
    folders: projects,
    notes,
    data: trashProjects,
    ...ownProps,
  };
}

function mapDispatchToProps(dispatch) {
  return {
    pushFolder: (...args) => dispatch(pushTrashFolder(...args)),
    deleteFile: (...args) => dispatch(permantRemoveFile(...args)),
    restoreFile: (...args) => dispatch(restoreFile(...args)),
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(Content);
