import 'antd/dist/antd.css';
import React, { Component, Fragment } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Router, Route, Switch } from 'react-router-dom';
import { ipcRenderer } from 'electron';
import { message } from 'antd';
import AppToolBar from '../component/AppToolBar';
import SVG from '../component/SVG';
import Note from '../component/note/Note';
import Trash from '../component/trash/Trash';
import Cloud from '../component/cloud/Cloud';
// import ImageHosting from '../component/imageHosting/ImgaeHosting';

import { appLounch, FETCHING_ONEDRIVER_TOKEN } from '../actions/app';
import { getProjectList, saveNote } from '../actions/projects';

import '../assets/scss/index.scss';
import '../assets/scss/themes.scss';

class App extends Component {
  static displayName = 'App';
  static propTypes = {
    dispatch: PropTypes.func.isRequired,
    app: PropTypes.shape({
      status: PropTypes.number.isRequired,
      version: PropTypes.string.isRequired,
      settings: PropTypes.shape({
        theme: PropTypes.string.isRequired,
        editorMode: PropTypes.string.isRequired,
        markdownSettings: PropTypes.shape({
          editorWidth: PropTypes.number.isRequired,
        }).isRequired,
        defaultDriver: PropTypes.string.isRequired,
      }).isRequired,
      oneDriverTokenStatus: PropTypes.number.isRequired,
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
    driver: PropTypes.shape({
      status: PropTypes.number.isRequired,
      projects: PropTypes.array.isRequired,
      notes: PropTypes.array.isRequired,
      currentProjectName: PropTypes.string.isRequired,
    }).isRequired,
    history: PropTypes.any,
  }

  componentDidMount() {
    this.props.dispatch(appLounch());
    this.props.dispatch(getProjectList());
    this.listenEvent();
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.app.oneDriverTokenStatus === 1 && nextProps.app.oneDriverTokenStatus === 3) {
      message.error('One Driver auth failed');
    }
  }

  componentWillUnmount() {
    ipcRenderer.removeAllListeners('save-content');
    ipcRenderer.removeAllListeners('onedriver-oauth-reply');
    ipcRenderer.removeAllListeners('start-one-driver-upload-all');
  }

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
    ipcRenderer.on('onedriver-oauth-code-reply', (event, args) => {
      if (args.success) {
        this.props.dispatch({
          type: FETCHING_ONEDRIVER_TOKEN,
          code: args.code,
        });
      } else {
        console.warn(args.error);
      }
    });
    // 监听onedriver 同步
    // ipcRenderer.on('start-one-driver-upload-all', () => {
    //   const { app: { oAuthToken: { oneDriver } } } = this.props;
    //   this.props.dispatch({ type: ONEDRIVER_ALL_UPLOAD, tokenInfo: oneDriver });
    // });
  }

  render() {
    const { app, projectsData: { projects, searchResult, searchStatus, trashProjects, trash }, markdown, note, driver } = this.props;
    const { settings } = app;
    const { theme } = settings;
    const { dispatch, history } = this.props;
    return (
      <Fragment>
        <SVG />
        <Router history={history}>
          <div className={`container ${theme}`}>
            <AppToolBar defaultDriver={app.settings.defaultDriver} />
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
                  <Cloud driver={driver} dispatch={dispatch} />
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
  const { app, projects, markdown, note, driver } = state;
  return {
    app,
    projectsData: projects,
    markdown,
    note,
    driver,
  };
}

export default connect(mapStateToProps)(App);
