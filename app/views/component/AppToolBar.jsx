import React from 'react';
import PropTypes from 'prop-types';
import {
  NavLink,
} from 'react-router-dom';

import logo from '../assets/images/logo.png';

const cloudActive = (match, location) => {
  const { pathname } = location;
  if (/\/cloud\//ig.test(pathname)) {
    return true;
  }
  return false;
};

const AppToolBar = (props) => {
  const pencilHtml = '<use class="menu-svg-use use-pencil" xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="#icon_svg_pencil" />';
  const noteHtml = '<use class="menu-svg-use use-img" xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="#icon_svg_cloud" />';
  const trashHtml = '<use class="menu-svg-use use-trash" xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="#icon_svg_trash" />';
  const defaultDriver = props.defaultDriver.toLowerCase();
  return (
    <div className="tool-bar" id="app_tool_bar">
      <div className="app-title-bar" />
      <div className="logo">
        <img alt="log" src={logo} />
      </div>
      <ul className="menu-list">
        <li className="menu-item">
          <NavLink to="/note" activeClassName="cur">
            <span className="menu-item-radius">
              <svg className="menu-svg" viewBox="0 0 485.219 485.22" dangerouslySetInnerHTML={{ __html: pencilHtml }} />
            </span>
          </NavLink>
        </li>
        <li className="menu-item">
          <NavLink
            to={`/cloud/${defaultDriver}`}
            activeClassName="cur"
            isActive={cloudActive}
          >
            <span className="menu-item-radius">
              <svg className="menu-svg" viewBox="0 0 548.176 548.176" dangerouslySetInnerHTML={{ __html: noteHtml }} />
            </span>
          </NavLink>
        </li>
        <li className="menu-item">
          <NavLink to="/trash" activeClassName="cur">
            <span className="menu-item-radius">
              <svg className="menu-svg" viewBox="0 0 268.476 268.476" dangerouslySetInnerHTML={{ __html: trashHtml }} />
            </span>
          </NavLink>
        </li>
      </ul>
    </div>
  );
};

AppToolBar.displayName = 'AppToolBar';
AppToolBar.propTypes = {
  defaultDriver: PropTypes.string.isRequired,
};

export default AppToolBar;
