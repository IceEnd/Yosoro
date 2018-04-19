import 'antd/dist/antd.css';
import 'whatwg-fetch';
import React, { Component, Fragment } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Router, Route, Switch } from 'react-router-dom';
import { ipcRenderer, remote } from 'electron';
import { message, notification } from 'antd';
import AppToolBar from '../component/AppToolBar';
import SVG from '../component/SVG';
import Note from '../component/note/Note';
import Trash from '../component/trash/Trash';
import Cloud from '../component/cloud/Cloud';
// import About from '../component/about/About';
// import ImageHosting from '../component/imageHosting/ImgaeHosting';

import { appLounch, FETCHING_ONEDRIVE_TOKEN, FETCHING_GITHUB_RELEASES, CLOSE_UPDATE_NOTIFICATION } from '../actions/app';
import { getProjectList, saveNote } from '../actions/projects';

import '../assets/scss/index.scss';
import '../assets/scss/themes.scss';

const { shell } = remote;

class App extends Component {
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
        defaultDrive: PropTypes.string.isRequired,
      }).isRequired,
      oneDriveTokenStatus: PropTypes.number.isRequired,
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
    }).isRequired,
    drive: PropTypes.shape({
      status: PropTypes.number.isRequired,
      projects: PropTypes.array.isRequired,
      notes: PropTypes.array.isRequired,
      currentProjectName: PropTypes.string.isRequired,
    }).isRequired,
    history: PropTypes.any,
  };

  constructor() {
    super();
    this.state = {
      updateNotification: false,
    };
  }

  componentDidMount() {
    ipcRenderer.send('start-release-schedule');
    const { dispatch } = this.props;
    dispatch(appLounch());
    dispatch(getProjectList());
    this.fetchReleases();
    this.listenEvent();
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.app.oneDriveTokenStatus === 1 && nextProps.app.oneDriveTokenStatus === 3) {
      message.error('One Driver auth failed');
    }
    if (this.props.app.allowShowUpdate && !nextProps.app.allowShowUpdate) {
      ipcRenderer.send('stop-release-schedule');
    }
  }

  componentDidUpdate() {
    const { app: { latestVersion, showUpdate, allowShowUpdate } } = this.props;
    if (allowShowUpdate && showUpdate) {
      this.updateNotification(latestVersion);
    }
  }

  componentWillUnmount() {
    if (this.props.app.allowShowUpdate) {
      ipcRenderer.send('stop-release-schedule');
    }
    ipcRenderer.removeAllListeners('save-content');
    ipcRenderer.removeAllListeners('onedriver-oauth-reply');
    ipcRenderer.removeAllListeners('start-one-driver-upload-all');
    ipcRenderer.removeAllListeners('fetch-releases');
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

  // 监听
  listenEvent = () => {
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
        this.props.dispatch(saveNote(parentsId, uuid));
      }
      if (!data.success) { // 保存失败
        message.error('Save failed.');
        return false;
      }
    });
    // 监听oneDriver 返回token
    ipcRenderer.on('onedrive-oauth-code-reply', (event, args) => {
      if (args.success) {
        this.props.dispatch({
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
    // 监听onedriver 同步
    // ipcRenderer.on('start-one-driver-upload-all', () => {
    //   const { app: { oAuthToken: { oneDriver } } } = this.props;
    //   this.props.dispatch({ type: ONEDRIVER_ALL_UPLOAD, tokenInfo: oneDriver });
    // });
  }

  openReleases = () => {
    shell.openExternal('https://github.com/IceEnd/Yosoro/releases');
  }

  render() {
    const { app, projectsData: { projects, searchResult, searchStatus, trashProjects, trash }, markdown, note, drive } = this.props;
    const { settings } = app;
    const { theme } = settings;
    const { dispatch, history } = this.props;
    return (
      <Fragment>
        <SVG />
        <Router history={history}>
          <div className={`container ${theme}`}>
            <AppToolBar defaultDrive={app.settings.defaultDrive} />
            <Switch>
              <Route
                path="/note"
                exact
                render={() => (
                  <Note
                    projects={projects}
                    searchResult={searchResult}
                    searchStatus={searchStatus}
                    markdown={markdown}
                    dispatch={dispatch}
                    note={note}
                    markdownSettings={app.settings.markdownSettings}
                    editorMode={app.settings.editorMode}
                  />
                )}
              />
              <Route
                path="/trash"
                render={() => (
                  <Trash
                    dispatch={dispatch}
                    projects={trashProjects}
                    trash={trash}
                  />
                )}
              />
              {/* <Route
                path="/images"
                render={() => (
                  <ImageHosting dispatch={dispatch} />
                )}
              /> */}
              <Route
                path="/cloud"
                render={() => (
                  <Cloud drive={drive} dispatch={dispatch} />
                )}
              />
            </Switch>
          </div>
        </Router>
      </Fragment>
    );
  }
}

function mapStateToProps(state) {
  const { app, projects, markdown, note, drive } = state;
  return {
    app,
    projectsData: projects,
    markdown,
    note,
    drive,
  };
}

export default connect(mapStateToProps)(App);
