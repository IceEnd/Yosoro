import React from 'react';
import PropTypes from 'prop-types';
import { Route, Switch, NavLink } from 'react-router-dom';
import Driver from './Driver';

import '../../assets/scss/driver.scss';

import oneDriverLogo from '../../assets/images/onedriver.png';

const Cloud = props => (
  <div className="cloud">
    <div className="cloud-bar">
      <div className="cloud-bar-content">
        <span className="label">Cloud Driver:</span>
        <NavLink to="/cloud/onedriver" activeClassName="cur" className="cloud-item">
          <span className="logo">
            <img alt="onedriver" src={oneDriverLogo} />
          </span>
        </NavLink>
      </div>
    </div>
    <Switch>
      <Route
        path="/cloud/:driver"
        render={routeProps => (
          <Driver driver={props.driver} {...routeProps} dispatch={props.dispatch} />
        )}
      />
    </Switch>
  </div>
);

Cloud.displayName = 'Cloud';
Cloud.propTypes = {
  dispatch: PropTypes.func.isRequired,
  driver: PropTypes.shape({
    status: PropTypes.number.isRequired,
    projects: PropTypes.array.isRequired,
    notes: PropTypes.array.isRequired,
    currentProjectName: PropTypes.string.isRequired,
  }).isRequired,
};

export default Cloud;
