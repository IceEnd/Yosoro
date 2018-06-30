import React from 'react';
import PropTypes from 'prop-types';
import { CSSTransition } from 'react-transition-group';
import {
  NavLink,
} from 'react-router-dom';
import SVGIcon from './share/SVGIcon';

import logo from '../assets/images/logo.png';

const cloudActive = (match, location) => {
  const { pathname } = location;
  if (/\/cloud\//ig.test(pathname)) {
    return true;
  }
  return false;
};
const AppToolBar = (props) => {
  const defaultDriver = props.defaultDrive.toLowerCase();
  const avatar = props.avatar;

  return (
    <div className="tool-bar" id="app_tool_bar">
      <div className="app-title-bar" />
      <div className="logo">
        {avatar ? (
          <CSSTransition
            classNames="fade"
            timeout={1000}
            in
          >
            <img className="avatar" alt="avatar" src={avatar} />
          </CSSTransition>
        ) : (
          <img alt="logo" src={logo} />
        )}
      </div>
      <ul className="menu-list">
        <li className="menu-item">
          <NavLink to="/note" activeClassName="cur">
            <span className="menu-item-radius">
              <SVGIcon
                className="menu-svg"
                id="#icon_svg_pencil"
                viewBox="0 0 485.219 485.22"
                useClassName="menu-svg-use use-pencil"
              />
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
              <SVGIcon
                className="menu-svg"
                viewBox="0 0 548.176 548.176"
                id="#icon_svg_cloud"
                useClassName="menu-svg-use use-img"
              />
            </span>
          </NavLink>
        </li>
        <li className="menu-item">
          <NavLink to="/trash" activeClassName="cur">
            <span className="menu-item-radius">
              <SVGIcon
                className="menu-svg"
                viewBox="0 0 268.476 268.476"
                id="#icon_svg_trash"
                useClassName="menu-svg-use use-trash"
              />
            </span>
          </NavLink>
        </li>
      </ul>
    </div>
  );
};

AppToolBar.displayName = 'AppToolBar';
AppToolBar.propTypes = {
  defaultDrive: PropTypes.string.isRequired,
  avatar: PropTypes.string.isRequired,
};

export default AppToolBar;
