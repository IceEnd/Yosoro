import React, { Component, Fragment } from 'react';
import PropTypes from 'prop-types';
import { Breadcrumb, message, Icon, Modal } from 'antd';
import autobind from 'autobind-decorator';
import { withDispatch } from 'Components/HOC/context';
import Notebooks from './Notebooks';
import Notes from './Notes';
import Loading from '../share/Loading';
import {
  DRIVE_FETCHING_PROJECTS,
  DRIVE_FETCHING_NOTES,
  DRIVE_BACK_ROOT,
  DRIVE_DOWNLOAD_NOTE,
  DRIVE_DELETE_ITEM,
} from '../../actions/drive';
import { getTokens } from '../../utils/db/app';

const confirm = Modal.confirm;
const BreadcrumbItem = Breadcrumb.Item;

@withDispatch
export default class Drive extends Component {
  static displayName = 'CloudDrive';
  static propTypes = {
    dispatch: PropTypes.func.isRequired,
    match: PropTypes.any.isRequired,
    drive: PropTypes.shape({
      status: PropTypes.number.isRequired,
      projects: PropTypes.array.isRequired,
      notes: PropTypes.array.isRequired,
      currentProjectName: PropTypes.string.isRequired,
    }).isRequired,
    note: PropTypes.shape({
      projectUuid: PropTypes.string.isRequired,
      projectName: PropTypes.string.isRequired,
      fileUuid: PropTypes.string.isRequired,
      fileName: PropTypes.string.isRequired,
    }).isRequired,
  }

  constructor(props) {
    super(props);
    this.state = {
      show: false,
      hasAuth: false,
      driveName: '',
      loadingText: 'Loading',
    };
  }

  componentDidMount() {
    this.checkOAuth();
  }

  getValidNotes() {
    const { notes } = this.props.drive;
    return notes.filter(note => /.md$/ig.test(note.name));
  }

  setAutuStatus(flag) {
    this.setState({
      show: true,
      hasAuth: flag,
    });
  }

  setDriveName(name) {
    this.setState({
      driveName: name,
    });
  }

  checkOAuth() {
    let drive = this.props.match.params.drive;
    const { dispatch, drive: { currentProjectName } } = this.props;
    const oAuth = getTokens();
    let auth;
    if (drive === 'onedrive') {
      drive = 'onedriver';
      auth = oAuth.oneDriver;
      this.setDriveName('One Drive');
    } else {
      message.error('Not support this cloud drive');
      return false;
    }
    if (auth.token && auth.refreshToken) { // 已经授权
      this.setAutuStatus(true);
      this.setState({
        loadingText: 'Loading...',
      });
      if (currentProjectName) {
        this.props.dispatch({
          type: DRIVE_FETCHING_NOTES,
          folder: currentProjectName,
          driveName: drive,
        });
      } else {
        dispatch({
          type: DRIVE_FETCHING_PROJECTS,
          driveName: drive,
        });
      }
    } else {
      this.setAutuStatus(false); // 未授权
    }
  }

  @autobind
  handleRefresh() {
    this.checkOAuth();
  }

  @autobind
  chooseProject(folder) {
    this.setState({
      loadingText: 'Loading...',
    });
    let driveName = this.props.match.params.drive;
    if (driveName === 'onedrive') {
      driveName = 'onedriver';
    }
    this.props.dispatch({
      type: DRIVE_FETCHING_NOTES,
      folder,
      driveName,
    });
  }

  @autobind
  backRoot() {
    const { drive: { currentProjectName } } = this.props;
    if (currentProjectName) {
      this.props.dispatch({
        type: DRIVE_BACK_ROOT,
      });
    } else {
      this.handleRefresh();
    }
  }

  // 下载单个笔记
  @autobind
  downloadNote(name) {
    const { drive: { currentProjectName }, note } = this.props;
    this.setState({
      loadingText: 'Downloading...',
    });
    let driveName = this.props.match.params.drive;
    if (driveName === 'onedrive') {
      driveName = 'onedriver';
    }
    let needUpdateEditor = false;
    if (note.projectUuid !== '-1' && note.fileUuid !== '-1' && note.projectName === currentProjectName && `${note.fileName}.md` === name) {
      needUpdateEditor = true;
    }
    this.props.dispatch({
      type: DRIVE_DOWNLOAD_NOTE,
      folder: currentProjectName,
      name,
      driveName,
      needUpdateEditor,
    });
  }

  // 打开删除笔记提示框
  @autobind
  openDelete(e, type, name, id, parentReference) {
    e.stopPropagation();
    confirm({
      title: `Remove "${name.replace(/.md$/ig, '')}"?`,
      content: 'It can be reduced in the cloud drive.',
      onOk: () => {
        this.deleteItem(type, name, id, parentReference);
      },
    });
  }

  /**
   * @desc 删除单个Item
   * @param {String} type 'note' or 'project'
   */
  deleteItem(type, name, id, parentReference) {
    this.setState({
      loadingText: 'Deleting...',
    });
    let driveName = this.props.match.params.drive;
    if (driveName === 'onedrive') {
      driveName = 'onedriver';
    }
    let jsonItemId;
    if (type === 'note') {
      // 搜索匹配.json文件
      const { notes } = this.props.drive;
      const jsonName = `${name.replace(/.md$/ig, '')}.json`;
      const nl = notes.length;
      for (let i = 0; i < nl; i++) {
        if (notes[i].name === jsonName) {
          jsonItemId = notes[i].id;
          break;
        }
      }
    }
    this.props.dispatch({
      type: DRIVE_DELETE_ITEM,
      itemId: id,
      parentReference,
      driveName,
      jsonItemId,
      deleteType: type,
    });
  }

  renerList(status, driveName, currentProjectName, blur) {
    if (status === 2) {
      return (
        <div className={`content ${blur}`} id="app_cloud">
          <p className="tips">
            <Icon type="reload" onClick={this.handleRefresh} />
            Fetch data failed.
          </p>
        </div>
      );
    }
    if (currentProjectName) {
      return this.renderNotes(status, driveName, currentProjectName, blur);
    }
    return this.renderProject(status, driveName, currentProjectName, blur);
  }

  /**
   * @param {Number} status 请求状态
   * @param {String} driveName 驱动名称
   * @param {String} currentProjectName
   * @param {String} blur
   */
  renderNotes(status, driveName, currentProjectName, blur) {
    const notes = this.getValidNotes();
    return (
      <div className={`content ${blur}`} id="app_cloud">
        <Notes
          notes={notes}
          downloadNote={this.downloadNote}
          openRemove={this.openDelete}
        />
      </div>
    );
  }

  renderProject(status, driveName, currentProjectName, blur) {
    const { drive: { projects } } = this.props;
    return (
      <div className={`content ${blur}`}>
        <Notebooks
          projects={projects}
          chooseProject={this.chooseProject}
          openRemove={this.openDelete}
        />
      </div>
    );
  }

  renderBread(blur, driveName, currentProjectName) {
    return (
      <div className={`bread-bar ${blur}`}>
        <div className="bread-container">
          <Breadcrumb>
            <BreadcrumbItem>{driveName}</BreadcrumbItem>
            <BreadcrumbItem
              className="cursor-pointer"
              onClick={this.backRoot}
            >
              Yosoro
            </BreadcrumbItem>
            {currentProjectName ? (
              <BreadcrumbItem>
                {currentProjectName}
              </BreadcrumbItem>
            ) : null}
          </Breadcrumb>
          <div className="tools">
            <Icon type="reload" onClick={this.handleRefresh} />
          </div>
        </div>
      </div>
    );
  }

  renderLoading(status) {
    const { loadingText } = this.state;
    if (status === 0) {
      return (
        <Loading tip={loadingText} />
      );
    }
    return null;
  }

  render() {
    const { show, hasAuth, driveName } = this.state;
    if (!show) {
      return null;
    }
    if (!hasAuth) {
      return (
        <div className="content">
          <p className="tips">
            <Icon type="reload" onClick={this.handleRefresh} />
            Yosoro need to be authorized.
          </p>
        </div>
      );
    }
    const { drive: { status, currentProjectName } } = this.props;
    let blur = '';
    if (status === 0) {
      blur = 'blur';
    }
    return (
      <Fragment>
        {this.renderLoading(status)}
        {this.renderBread(blur, driveName, currentProjectName)}
        {this.renerList(status, driveName, currentProjectName, blur)}
      </Fragment>
    );
  }
}
