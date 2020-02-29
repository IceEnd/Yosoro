import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Modal, message } from 'antd';
import { ipcRenderer } from 'electron';
import autobind from 'autobind-decorator';
import { permantRemoveNote, restoreFile, permantRemoveNotebook, pushTrashFolder, restoreNotebook } from '../../actions/projects';

const confirm = Modal.confirm;

function getDisplayName(WrappedComponent) {
  return WrappedComponent.displayName ||
         WrappedComponent.name ||
         'Component';
}

export default function HOCListFactory(listType) {
  return function HOCList(WrappedComponent) {
    return class HOC extends Component {
      static displayName = `HOC${getDisplayName(WrappedComponent)}`;
      static propTypes = {
        dispatch: PropTypes.func.isRequired,
        trash: PropTypes.shape({
          projectName: PropTypes.string.isRequired,
          projectUuid: PropTypes.string.isRequired,
        }).isRequired,
      };

      constructor() {
        super();
        this.state = {
          name: '',
          uuid: '-1',
        };
      }

      setTarget(name, uuid) {
        this.setState({
          name,
          uuid,
        });
      }

      @autobind
      handleGoIn(uuid, name) {
        this.props.dispatch(pushTrashFolder(uuid, name));
      }

      // 还原项目
      restoreProject(uuid, name) {
        const data = ipcRenderer.sendSync('NOTES:restore-notebook', {
          name,
        });
        if (!data.success) {
          message.error(`Restore "${name}" failed`);
          return false;
        }
        this.props.dispatch(restoreNotebook(uuid));
      }

      // 还原笔记
      restoreFile(uuid, name) {
        const { trash: { projectUuid, projectName }, dispatch } = this.props;
        const data = ipcRenderer.sendSync('NOTES:restore-note', {
          projectName,
          name,
        });
        if (!data.success) {
          message.error(`Restore "${name}" failed`);
          return false;
        }
        dispatch(restoreFile(projectUuid, uuid));
      }

      // 打开还原项目弹框
      @autobind
      openRestore(e, uuid, name) {
        e.stopPropagation();
        this.setTarget(name, uuid);
        confirm({
          title: `Do you want to restore "${name}"?`,
          content: 'This operation will cover the existing files.',
          onCancel: () => {
            this.setTarget('', '-1');
          },
          onOk: () => {
            if (listType === 'projects') {
              this.restoreProject(uuid, name);
            } else {
              this.restoreFile(uuid, name);
            }
          },
        });
      }

      // 永久删除笔记本
      removeNotebook(uuid, name) {
        const data = ipcRenderer.sendSync('NOTES:permanent-remove-filebook', {
          name,
        });
        if (!data.success) {
          message.error('Deleting notebook failed');
          return false;
        }
        if (data.code === 1) { // 笔记本不存在
          message.error('Notebook done note exist');
        }
        this.props.dispatch(permantRemoveNotebook(uuid));
      }

      // 永久删除笔记
      removeNote(uuid, name) {
        const { trash: { projectUuid, projectName }, dispatch } = this.props;
        const data = ipcRenderer.sendSync('NOTES:permanent-remove-file', {
          projectName,
          name,
        });
        if (!data.success) {
          message.error(`Deleting "${name}" failed`);
          return false;
        }
        if (data.code === 1) {
          message.error('Note does not exist');
        }
        dispatch(permantRemoveNote(projectUuid, uuid));
      }

      // 完全删除项目确认框
      @autobind
      openRemove(e, uuid, name) {
        e.stopPropagation();
        this.setTarget(name, uuid, 'delete');
        confirm({
          title: `Do you want to permanently remove "${name}"?`,
          content: 'Unrestoreable after deleting.',
          onCancel: () => {
            this.setTarget('', '-1');
          },
          onOk: () => {
            if (listType === 'projects') {
              this.removeNotebook(uuid, name);
            } else {
              this.removeNote(uuid, name);
            }
          },
        });
      }

      render() {
        return (
          <WrappedComponent
            {...this.props}
            openRemove={this.openRemove}
            openRestore={this.openRestore}
            handleGoIn={this.handleGoIn}
          />
        );
      }
    };
  };
}
