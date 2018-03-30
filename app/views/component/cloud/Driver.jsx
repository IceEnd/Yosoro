import React, { Component, Fragment } from 'react';
import PropTypes from 'prop-types';
import { Spin, Breadcrumb, message, Icon, Tooltip } from 'antd';
import { DRIVER_FETCHING_PROJECTS, DRIVER_FETCHING_NOTES, DRIVER_BACK_ROOT, DRIVER_DOWNLOAD_NOTE } from '../../actions/driver';
import { getTokens } from '../../utils/db/app';

export default class Driver extends Component {
  static displayName = 'CloudDriver';
  static propTypes = {
    dispatch: PropTypes.func.isRequired,
    match: PropTypes.any.isRequired,
    driver: PropTypes.shape({
      status: PropTypes.number.isRequired,
      projects: PropTypes.array.isRequired,
      notes: PropTypes.array.isRequired,
      currentProjectName: PropTypes.string.isRequired,
    }).isRequired,
  }

  constructor() {
    super();
    this.state = {
      show: false,
      hasAuth: false,
      driverName: '',
      loadingText: 'Loading',
    };
  }

  componentDidMount() {
    this.checkOAuth();
  }

  setAutuStatus = flag => this.setState({
    show: true,
    hasAuth: flag,
  });

  setDriverName = name => this.setState({
    driverName: name,
  });

  checkOAuth = () => {
    const driver = this.props.match.params.driver;
    const { dispatch, driver: { currentProjectName } } = this.props;
    const oAuth = getTokens();
    let auth;
    if (driver === 'onedriver') {
      auth = oAuth.oneDriver;
      this.setDriverName('One Driver');
    } else {
      message.error('Not support this cloud driver');
      return false;
    }
    if (auth.token && auth.refreshToken) { // 已经授权
      this.setAutuStatus(true);
      this.setState({
        loadingText: 'Loading...',
      });
      if (currentProjectName) {
        this.props.dispatch({
          type: DRIVER_FETCHING_NOTES,
          folder: currentProjectName,
          driverName: driver,
        });
      } else {
        dispatch({
          type: DRIVER_FETCHING_PROJECTS,
          driverName: driver,
        });
      }
    } else {
      this.setAutuStatus(false); // 未授权
    }
  }

  chooseProject = (folder) => {
    this.setState({
      loadingText: 'Loading...',
    });
    this.props.dispatch({
      type: DRIVER_FETCHING_NOTES,
      folder,
      driverName: this.props.match.params.driver,
    });
  }

  backRoot = () => {
    this.props.dispatch({
      type: DRIVER_BACK_ROOT,
    });
  }

  // 下载单个笔记
  downloadNote = (name) => {
    const { driver: { currentProjectName } } = this.props;
    this.setState({
      loadingText: 'Downloading...',
    });
    this.props.dispatch({
      type: DRIVER_DOWNLOAD_NOTE,
      folder: currentProjectName,
      name,
      driverName: this.props.match.params.driver,
    });
  }

  renderBread = (type, blur, driverName, currentProjectName) => {
    if (type === 'notes') {
      return (
        <div className={`bread-bar ${blur}`}>
          <Breadcrumb>
            <Breadcrumb.Item>{driverName}</Breadcrumb.Item>
            <Breadcrumb.Item
              className="cursor-pointer"
              onClick={this.backRoot}
            >
              Yosoro
            </Breadcrumb.Item>
            <Breadcrumb.Item>{currentProjectName}</Breadcrumb.Item>
          </Breadcrumb>
        </div>
      );
    }
    return (
      <div className={`bread-bar ${blur}`}>
        <Breadcrumb>
          <Breadcrumb.Item>{driverName}</Breadcrumb.Item>
          <Breadcrumb.Item>Yosoro</Breadcrumb.Item>
        </Breadcrumb>
      </div>
    );
  };

  renderLoading = (status) => {
    const { loadingText } = this.state;
    if (status === 0) {
      return (
        <div className="loading">
          <Spin size="large" tip={loadingText} />
        </div>
      );
    }
    return null;
  }

  render() {
    const { show, hasAuth, driverName } = this.state;
    const notebookHtml = '<use class="trash-notebook-use" xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="#icon_svg_notebook" />';
    const noteHtml = '<use class="trash-notebook-use" xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="#icon_svg_note" />';
    if (!show) {
      return null;
    }
    if (!hasAuth) {
      return (
        <div className="content">
          <p className="tips">
            <Icon type="reload" onClick={this.checkOAuth} />
            Yosoro need to be authorized.
          </p>
        </div>
      );
    }
    const { driver: { projects, notes, status, currentProjectName } } = this.props;
    let blur = '';
    if (status === 0) {
      blur = 'blur';
    }
    if (currentProjectName) {
      return (
        <Fragment>
          {this.renderLoading(status)}
          {this.renderBread('notes', blur, driverName, currentProjectName)}
          {status === 2 ? (
            <div className={`content ${blur}`}>
              <p className="tips">
                <Icon type="reload" onClick={this.checkOAuth} />
                Fetch data failed.
              </p>
            </div>
          ) : (
            <div className={`content ${blur}`} id="app_cloud">
              {notes.length === 0 ? (
                <p className="tips">List is empty.</p>
              ) : (
                <ul className="list">
                  {notes.map((item) => {
                    const { name, id } = item;
                    let showName = '';
                    if (!/.md$/ig.test(name)) {
                      return null;
                    }
                    showName = name.replace(/.md$/ig, '');
                    return (
                      <li
                        className="list-item"
                        key={id}
                      >
                        <div className="list-item__img">
                          <svg className="menu-svg" viewBox="0 0 59 59" dangerouslySetInnerHTML={{ __html: noteHtml }} />
                        </div>
                        <h3 className="list-item__title">{showName}</h3>
                        <div className="list-item__option">
                          <span
                            className="list-item__options__item"
                            onClick={() => this.downloadNote(name)}
                          >
                            <Tooltip
                              placement="bottom"
                              title="download"
                              getPopupContainer={() => document.getElementById('app_cloud')}
                            >
                              <Icon type="download" />
                            </Tooltip>
                          </span>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          )}
        </Fragment>
      );
    }
    return (
      <Fragment>
        {this.renderLoading(status)}
        {this.renderBread('projects', blur, driverName, currentProjectName)}
        {status === 2 ? (
          <div className={`content ${blur}`} id="app_cloud">
            <p className="tips">
              <Icon type="reload" onClick={this.checkOAuth} />
              Fetch data failed.
            </p>
          </div>
        ) : (
          <div className={`content ${blur}`}>
            {projects.length === 0 ? (
              <p className="tips">List is empty.</p>
            ) : (
              <ul className="list">
                {projects.map((item) => {
                  if (typeof item.folder === 'undefined') {
                    return null;
                  }
                  return (
                    <li
                      className="list-item"
                      key={item.id}
                      onClick={() => this.chooseProject(item.name)}
                      role="presentation"
                    >
                      <div className="list-item__img">
                        <svg className="menu-svg" viewBox="0 0 59 59" dangerouslySetInnerHTML={{ __html: notebookHtml }} />
                      </div>
                      <h3 className="list-item__title">{item.name}</h3>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        )}
      </Fragment>
    );
  }
}
