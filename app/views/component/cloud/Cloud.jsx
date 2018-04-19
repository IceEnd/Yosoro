import React from 'react';
import PropTypes from 'prop-types';
import { Route, Switch, NavLink } from 'react-router-dom';
import Drive from './Drive';

import '../../assets/scss/drive.scss';

import oneDriveLogo from '../../assets/images/onedrive.png';

const Cloud = props => (
  <div className="cloud">
    <div className="cloud-bar">
      <div className="cloud-bar-content">
        <span className="label">Cloud Drive:</span>
        <NavLink to="/cloud/onedrive" activeClassName="cur" className="cloud-item">
          <span className="logo">
            <img alt="onedrive" src={oneDriveLogo} />
          </span>
        </NavLink>
      </div>
    </div>
    <Switch>
      <Route
        path="/cloud/:drive"
        render={routeProps => (
          <Drive drive={props.drive} {...routeProps} dispatch={props.dispatch} />
        )}
      />
    </Switch>
  </div>
);

Cloud.displayName = 'Cloud';
Cloud.propTypes = {
  dispatch: PropTypes.func.isRequired,
  drive: PropTypes.shape({
    status: PropTypes.number.isRequired,
    projects: PropTypes.array.isRequired,
    notes: PropTypes.array.isRequired,
    currentProjectName: PropTypes.string.isRequired,
  }).isRequired,
};

export default Cloud;
