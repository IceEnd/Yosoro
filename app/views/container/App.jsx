import React, { Component, Fragment } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Router, Route, Switch } from 'react-router-dom';
import { ipcRenderer, remote } from 'electron';
import { message, notification } from 'antd';
import AppToolBar from 'Components/AppToolBar';
import SVG from 'Components/SVG';
import Note from 'Components/note/Note';
import Trash from 'Components/trash/Trash';
import Cloud from 'Components/cloud/Cloud';
import Images from 'Components/images/Images';
import Settings from 'Components/settings/Settings';
import { Provider } from 'Components/HOC/context';
import { getTokens } from 'Utils/db/app';

import {
  GET_USER_AVATAR,
  SET_USER_LOCAL_AVATAR,
} from 'Actions/user';
import {
  appLounch,
  appSwitchEditMode,
  FETCHING_ONEDRIVE_TOKEN,
  FETCHING_GITHUB_RELEASES,
  CLOSE_UPDATE_NOTIFICATION,
} from 'Actions/app';
import { getProjectList, saveNote } from 'Actions/projects';
import { EXPORT_INIT_QUEUE, EXPORT_COMPOLETE } from 'Actions/exportQueue';
import {
  UPLOAD_IMAGE_SUCCESS,
  UPLOAD_IMAGE_FAILED,
  IMAGES_GET_LIST,
} from 'Actions/imageHosting';
import {
  REPLACE_UPLOAD_IMAGE_TEXT,
} from 'Actions/markdown';

import 'Assets/scss/index.scss';
import 'Assets/scss/theme/light.scss';
import 'Assets/scss/theme/dark.scss';
import 'Assets/scss/scrollbar.css';

const { shell } = remote;

function mapStateToProps(state) {
  const { app, projects, markdown, note, drive, exportQueue, user, imageHosting } = state;
  return {
    app,
    projectsData: projects,
    markdown,
    note,
    drive,
    exportQueue,
    user,
    imageHosting,
  };
}

@connect(mapStateToProps)
export default class App extends Component {
  static displayName = 'App';
  static propTypes = {
    dispatch: PropTypes.func.isRequired,
    app: PropTypes.shape({
      status: PropTypes.number.isRequired,
      version: PropTypes.string.isRequired,
      latestVersion: PropTypes.string.isRequired,
      versionFetchStatus: PropTypes.number.isRequired, // 0: 请求中 1: 请求成功 2: 请求失败
      showUpdate: PropTypes.bool.isRequired,
      allowShowUpdate: PropTypes.bool.isRequired,
      settings: PropTypes.shape({
        theme: PropTypes.string.isRequired,
        editorMode: PropTypes.string.isRequired,
        markdownSettings: PropTypes.shape({
          editorWidth: PropTypes.number.isRequired,
        }).isRequired,
        editor: PropTypes.shape({
          fontSize: PropTypes.number.isRequired,
          previewFontSize: PropTypes.number.isRequired,
          cursorPosition: PropTypes.bool.isRequired,
        }),
        defaultDrive: PropTypes.string.isRequired,
        sortBy: PropTypes.oneOf(['normal', 'create-date', 'latest-date']).isRequired,
      }).isRequired,
      oneDriveTokenStatus: PropTypes.number.isRequired,
      platform: PropTypes.string.isRequired,
      imageHostingConfig: PropTypes.shape({
        default: PropTypes.oneOf(['github', 'weibo', 'SM.MS']).isRequired,
        github: PropTypes.shape({
          repo: PropTypes.string.isRequired,
          branch: PropTypes.string.isRequired,
          token: PropTypes.string.isRequired,
          path: PropTypes.string.isRequired,
          domain: PropTypes.string.isRequired,
        }).isRequired,
        weibo: PropTypes.shape({
          username: PropTypes.string.isRequired,
          password: PropTypes.string.isRequired,
          cookie: PropTypes.string.isRequired,
          useCookie: PropTypes.bool.isRequired,
          quality: PropTypes.oneOf(['thumbnail', 'mw690', 'large']).isRequired,
        }).isRequired,
      }),
      mediumConfig: PropTypes.shape({
        medium: PropTypes.shape({
          id: PropTypes.string.isRequired,
          username: PropTypes.string.isRequired,
          token: PropTypes.string.isRequired,
          url: PropTypes.string.isRequired,
          imageUrl: PropTypes.string.isRequired,
          publishStatus: PropTypes.string.isRequired,
        }).isRequired,
      }).isRequired,
    }),
    projectsData: PropTypes.shape({
      projects: PropTypes.arrayOf(PropTypes.shape({
        uuid: PropTypes.string.isRequired,
        name: PropTypes.string.isRequired,
        description: PropTypes.string.isRequired,
        labels: PropTypes.arrayOf(PropTypes.string).isRequired,
        status: PropTypes.number.isRequired,
        notes: PropTypes.array.isRequired,
      })).isRequired,
      trashProjects: PropTypes.arrayOf(PropTypes.shape({
        uuid: PropTypes.string.isRequired,
        name: PropTypes.string.isRequired,
        description: PropTypes.string.isRequired,
        labels: PropTypes.arrayOf(PropTypes.string).isRequired,
        status: PropTypes.number.isRequired,
        notes: PropTypes.array.isRequired,
      })).isRequired,
      searchStatus: PropTypes.number.isRequired,
      searchResult: PropTypes.arrayOf(PropTypes.shape({
        uuid: PropTypes.string.isRequired,
        name: PropTypes.string.isRequired,
        description: PropTypes.string.isRequired,
        labels: PropTypes.arrayOf(PropTypes.string).isRequired,
        status: PropTypes.number.isRequired,
        notes: PropTypes.array.isRequired,
      })).isRequired,
      trash: PropTypes.shape({
        projectName: PropTypes.string.isRequired,
        projectUuid: PropTypes.string.isRequired,
      }).isRequired,
    }).isRequired,
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
      fileName: PropTypes.string.isRequired,
    }).isRequired,
    drive: PropTypes.shape({
      status: PropTypes.number.isRequired,
      projects: PropTypes.array.isRequired,
      notes: PropTypes.array.isRequired,
      currentProjectName: PropTypes.string.isRequired,
    }).isRequired,
    // // 文件导出队列
    exportQueue: PropTypes.shape({
      status: PropTypes.number.isRequired,
    }).isRequired,
    // // 用户信息
    user: PropTypes.shape({
      avatar: PropTypes.string.isRequired,
    }).isRequired,
    // 图床
    imageHosting: PropTypes.shape({
      images: PropTypes.array.isRequired,
    }).isRequired,
    history: PropTypes.any,
  };

  constructor(props) {
    super(props);
    this.state = {
      updateNotification: false,
    };
    document.body.className = props.app.settings.theme;
  }

  componentDidMount() {
    const { dispatch } = this.props;
    dispatch(appLounch());
    dispatch(getProjectList());
    this.fetchReleases();
    this.listenEvent();
    this.getLocalAvatar();
    this.fetchAvatar();
    this.setTheme();

    ipcRenderer.send('start-release-schedule');
    ipcRenderer.send('get-images-list');
  }

  componentDidUpdate(prevProps) {
    const { app: { latestVersion, showUpdate, allowShowUpdate } } = this.props;
    if (allowShowUpdate && showUpdate) {
      this.updateNotification(latestVersion);
    }
    if (prevProps.app.allowShowUpdate && !allowShowUpdate) {
      ipcRenderer.send('stop-release-schedule');
    }
    this.setTheme();
  }

  componentWillUnmount() {
    if (this.props.app.allowShowUpdate) {
      ipcRenderer.send('stop-release-schedule');
    }
    const listeners = [
      'save-content',
      'onedriver-oauth-reply',
      'start-one-driver-upload-all',
      'fetch-releases',
      'async-export-file',
      'async-export-file-complete',
      'app-switch-edit-mode',
      'pic-upload',
      'get-images-list',
    ];
    for (const item of listeners) {
      ipcRenderer.removeAllListeners(item);
    }
  }

  setTheme() {
    const { theme } = this.props.app.settings;
    if (document.body.className !== theme) {
      document.body.className = theme;
    }
  }

  // 获取本地存储的头像
  getLocalAvatar() {
    const avatar = ipcRenderer.sendSync('get-local-avatar');
    if (avatar) {
      this.props.dispatch({
        type: SET_USER_LOCAL_AVATAR,
        avatar,
      });
    }
  }

  updateNotification = (latestVersion) => {
    const { updateNotification } = this.state;
    if (updateNotification) {
      return false;
    }
    const desc = (
      <div
        onClick={this.openReleases}
      >
        The new version {latestVersion} has been released.
      </div>
    );
    const msg = (
      <div onClick={this.openReleases}>
        Update Yosoro
      </div>
    );
    notification.info({
      message: msg,
      description: desc,
      duration: null,
      className: 'cursor-pointer',
      onClose: () => {
        this.props.dispatch({ type: CLOSE_UPDATE_NOTIFICATION });
        this.setState({
          updateNotification: false,
        });
      },
    });
    this.setState({
      updateNotification: true,
    });
  }

  fetchReleases = () => this.props.dispatch({ type: FETCHING_GITHUB_RELEASES });

  fetchAvatar() {
    // 获取用户头像
    const defaultDrive = this.props.app.settings.defaultDrive;
    const oAuth = getTokens();
    let auth;
    if (defaultDrive === 'oneDrive') {
      auth = oAuth.oneDriver;
    }
    if (auth.token && auth.refreshToken) {
      this.props.dispatch({
        type: GET_USER_AVATAR,
        driveName: defaultDrive,
      });
    }
  }

  // 监听
  listenEvent = () => {
    const { dispatch } = this.props;
    // 监听保存动作
    ipcRenderer.on('save-content', () => {
      const { projectName } = this.props.note;
      const { status, content, name, parentsId, uuid, hasEdit } = this.props.markdown;
      if (status === 0 || !hasEdit) { // 不进行保存操作
        return false;
      }
      const param = {
        content,
        projectName,
        fileName: name,
      };
      const data = ipcRenderer.sendSync('save-content-to-file', param);
      if (parentsId && uuid) {
        dispatch(saveNote(parentsId, uuid));
      }
      if (!data.success) { // 保存失败
        message.error('Save failed.');
        return false;
      }
    });
    // 监听oneDriver 返回token
    ipcRenderer.on('onedrive-oauth-code-reply', (event, args) => {
      if (args.success) {
        dispatch({
          type: FETCHING_ONEDRIVE_TOKEN,
          code: args.code,
        });
      } else {
        console.warn(args.error);
      }
    });
    ipcRenderer.on('fetch-releases', () => {
      this.fetchReleases();
    });
    // 异步导出文件
    ipcRenderer.on('async-export-file', () => {
      dispatch({
        type: EXPORT_INIT_QUEUE,
      });
    });
    // 异步导出文件完成
    ipcRenderer.on('async-export-file-complete', () => {
      dispatch({
        type: EXPORT_COMPOLETE,
      });
    });
    // Switch editor mode
    ipcRenderer.on('app-switch-edit-mode', (event, mode) => {
      if (this.props.app.settings.editorMode !== mode) {
        dispatch(appSwitchEditMode(mode, true));
      }
    });
    // image uploaded
    ipcRenderer.on('pic-upload', (event, payload) => {
      const { code, data } = payload;
      if (code !== 0) {
        dispatch({
          type: UPLOAD_IMAGE_FAILED,
          data,
        });
        return;
      }
      dispatch({
        type: REPLACE_UPLOAD_IMAGE_TEXT,
        data,
      });
      dispatch({
        type: UPLOAD_IMAGE_SUCCESS,
        data,
      });
    });

    ipcRenderer.on('get-images-list', (event, payload) => {
      dispatch({
        type: IMAGES_GET_LIST,
        payload,
      });
    });
  }

  openReleases = () => {
    shell.openExternal('https://github.com/IceEnd/Yosoro/releases');
  }

  render() {
    const { app, projectsData: { projects, searchResult, searchStatus, trashProjects, trash }, markdown, note, drive, exportQueue, user } = this.props;
    const { settings, platform } = app;
    const { dispatch, history } = this.props;
    const notDarwin = platform === 'darwin' ? '' : 'not-darwin';
    return (
      <Provider value={{ dispatch, theme: app.settings.theme, platform }}>
        <Fragment>
          <SVG />
          <Router history={history}>
            <div className={`container ${notDarwin} ${platform}`}>
              <AppToolBar
                defaultDrive={app.settings.defaultDrive}
                avatar={user.avatar}
              />
              <Switch>
                {/* 笔记部分 */}
                <Route
                  path="/note"
                  exact
                  render={() => (
                    <Note
                      projects={projects}
                      searchResult={searchResult}
                      searchStatus={searchStatus}
                      markdown={markdown}
                      note={note}
                      markdownSettings={app.settings.markdownSettings}
                      editorMode={app.settings.editorMode}
                      editor={settings.editor}
                      exportQueue={exportQueue}
                      imageHostingConfig={app.imageHostingConfig}
                      sortBy={app.settings.sortBy}
                    />
                  )}
                />
                {/* 回收站 */}
                <Route
                  path="/trash"
                  render={() => (
                    <Trash
                      projects={trashProjects}
                      trash={trash}
                    />
                  )}
                />
                <Route
                  path="/images"
                  render={() => (
                    <Images
                      list={this.props.imageHosting.images}
                      dispatch={this.props.dispatch}
                    />
                  )}
                />
                {/* cloud dirve */}
                <Route
                  path="/cloud"
                  render={() => (
                    <Cloud
                      drive={drive}
                      note={note}
                    />
                  )}
                />
                <Route
                  path="/settings"
                  render={() => (
                    <Settings
                      imageHostingConfig={app.imageHostingConfig}
                      mediumConfig={app.mediumConfig}
                      {...app.settings}
                    />
                  )}
                />
              </Switch>
            </div>
          </Router>
        </Fragment>
      </Provider>
    );
  }
}
