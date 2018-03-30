import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Icon, Tooltip, Modal, message } from 'antd';
import { ipcRenderer } from 'electron';
import { permantRemoveNotebook, chooseTrashProject, restoreNotebook } from '../../actions/projects';

const confirm = Modal.confirm;

export default class Projects extends Component {
  static displayName = 'TrashProjects';
  static propTypes = {
    dispatch: PropTypes.func.isRequired,
    projects: PropTypes.arrayOf(PropTypes.shape({
      uuid: PropTypes.string.isRequired,
      name: PropTypes.string.isRequired,
      description: PropTypes.string.isRequired,
      labels: PropTypes.arrayOf(PropTypes.string).isRequired,
      status: PropTypes.number.isRequired,
      notes: PropTypes.array.isRequired,
    })).isRequired,
  }

  constructor() {
    super();
    this.state = {
      name: '',
      uuid: '-1',
    };
  }

  setProject = (name, uuid) => {
    this.setState({
      name,
      uuid,
    });
  }

  handleGoIn = (uuid, name) => {
    this.props.dispatch(chooseTrashProject(uuid, name));
  }

  // 还原项目
  openrRestore = (e, uuid, name) => {
    e.stopPropagation();
    this.setProject(name, uuid);
    confirm({
      title: `Do you want to restore "${name}"?`,
      content: 'This operation will cover the existing files.',
      onCancel: () => {
        this.setProject('', '-1');
      },
      onOk: () => {
        this.restoreProject(uuid, name);
      },
    });
  }

  // 完全删除项目确认框
  openRemove = (e, uuid, name) => {
    e.stopPropagation();
    this.setProject(name, uuid, 'delete');
    confirm({
      title: `Do you want to permanently remove "${name}"?`,
      content: 'Unrestoreable after deleting.',
      onCancel: () => {
        this.setProject('', '-1');
      },
      onOk: () => {
        this.removeProject(uuid, name);
      },
    });
  }

  // 永久删除
  removeProject = (uuid, name) => {
    const data = ipcRenderer.sendSync('permanent-remove-notebook', {
      name,
    });
    if (!data.success) {
      message.error('Deleting notebook failed');
      return false;
    }
    this.props.dispatch(permantRemoveNotebook(uuid));
  }

  restoreProject = (uuid, name) => {
    const data = ipcRenderer.sendSync('restore-notebook', {
      name,
    });
    if (!data.success) {
      message.error(`Restore "${name}" failed`);
      return false;
    }
    this.props.dispatch(restoreNotebook(uuid));
  }

  render() {
    const notebookHtml = '<use class="trash-notebook-use" xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="#icon_svg_notebook" />';
    const { projects } = this.props;
    if (projects.length === 0) {
      return (
        <div className="content">
          <p className="tips">Trash can is empty.</p>
        </div>
      );
    }
    return (
      <div className="content">
        <ul className="list">
          {this.props.projects.map((item) => {
            const { uuid, name } = item;
            return (
              <li
                className="list-item"
                key={`trash-project-${uuid}`}
                onClick={() => this.handleGoIn(uuid, name)}
                role="presentation"
              >
                <div className="list-item__img">
                  <svg className="menu-svg" viewBox="0 0 59 59" dangerouslySetInnerHTML={{ __html: notebookHtml }} />
                </div>
                <h3 className="list-item__title">{name}</h3>
                <div className="list-item__option">
                  <span
                    className="list-item__options__item"
                    onClick={e => this.openrRestore(e, uuid, name)}
                  >
                    <Tooltip placement="bottom" title="restore notebook">
                      <Icon type="export" />
                    </Tooltip>
                  </span>
                  <span className="list-item__options__item">
                    <Tooltip placement="bottom" title="open notebook">
                      <Icon type="login" />
                    </Tooltip>
                  </span>
                  <span
                    className="list-item__options__item"
                    onClick={e => this.openRemove(e, uuid, name)}
                  >
                    <Tooltip placement="bottom" title="delete notebook">
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
