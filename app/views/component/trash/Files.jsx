import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { ipcRenderer } from 'electron';
import { Icon, Tooltip, Modal, message } from 'antd';
import { permantRemoveNote, restoreNote } from '../../actions/projects';

const confirm = Modal.confirm;

export default class Projects extends Component {
  static displayName = 'TrashNotes';
  static propTypes = {
    dispatch: PropTypes.func.isRequired,
    notes: PropTypes.arrayOf(PropTypes.shape({
      uuid: PropTypes.string.isRequired,
      name: PropTypes.string.isRequired,
      description: PropTypes.string.isRequired,
      labels: PropTypes.arrayOf(PropTypes.string).isRequired,
      status: PropTypes.number.isRequired,
    })).isRequired,
    trash: PropTypes.shape({
      projectName: PropTypes.string.isRequired,
      projectUuid: PropTypes.string.isRequired,
    }).isRequired,
  }

  constructor() {
    super();
    this.state = {
      name: '',
      uuid: '-1',
    };
  }

  setNote = (name, uuid) => {
    this.setState({
      name,
      uuid,
    });
  }

  // 还原笔记Confirm
  openrRestore = (e, uuid, name) => {
    e.stopPropagation();
    this.setNote(name, uuid);
    confirm({
      title: `Do you want to restore "${name}"?`,
      content: 'This operation will cover the existing note.',
      onCancel: () => {
        this.setNote('', '-1', 'restore');
      },
      onOk: () => {
        this.restoreNote(uuid, name);
      },
    });
  }

  openDelete = (e, uuid, name) => {
    e.stopPropagation();
    this.setNote(name, uuid);
    confirm({
      title: `Do you want to permanently remove "${name}"?`,
      content: 'Unrestoreable after deleting.',
      onCancel: () => {
        this.setNote('', '-1');
      },
      onOk: () => {
        this.removeNote(uuid, name);
      },
    });
  }

  // 还原笔记
  restoreNote = (uuid, name) => {
    const { trash: { projectUuid, projectName }, dispatch } = this.props;
    const data = ipcRenderer.sendSync('restore-note', {
      projectName,
      name,
    });
    if (!data.success) {
      message.error(`Restore "${name}" failed`);
      return false;
    }
    dispatch(restoreNote(projectUuid, uuid));
  }

  // 永久删除笔记
  removeNote = (uuid, name) => {
    const { trash: { projectUuid, projectName }, dispatch } = this.props;
    const data = ipcRenderer.sendSync('permanent-remove-note', {
      projectName,
      name,
    });
    if (!data.success) {
      message.error(`Deleting "${name}" failed`);
      return false;
    }
    dispatch(permantRemoveNote(projectUuid, uuid));
  }

  render() {
    const { notes } = this.props;
    if (notes.length === 0) {
      return (
        <div className="content">
          <p className="tips">Notebook is empty.</p>
        </div>
      );
    }
    const noteHtml = '<use class="trash-notebook-use" xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="#icon_svg_note" />';
    return (
      <div className="content">
        <ul className="list">
          {notes.map((item) => {
            const { uuid, name } = item;
            return (
              <li
                className="list-item"
                key={`trash-note-${uuid}`}
              >
                <div className="list-item__img">
                  <svg className="menu-svg" viewBox="0 0 59 59" dangerouslySetInnerHTML={{ __html: noteHtml }} />
                </div>
                <h3 className="list-item__title">{name}</h3>
                <div className="list-item__option">
                  <span
                    className="list-item__options__item"
                    onClick={e => this.openrRestore(e, uuid, name)}
                  >
                    <Tooltip placement="bottom" title="restore note">
                      <Icon type="export" />
                    </Tooltip>
                  </span>
                  <span
                    className="list-item__options__item"
                    onClick={e => this.openDelete(e, uuid, name)}
                  >
                    <Tooltip placement="bottom" title="delete note">
                      <Icon type="delete" />
                    </Tooltip>
                  </span>
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    );
  }
}
