import React from 'react';
import PropTypes from 'prop-types';
import { Row, Col, Button, Icon } from 'antd';
import { remote } from 'electron';
import logo from 'Assets/images/logo.png';
import Module from './Module';
import pkg from '../../../../package.json';

const { shell } = remote;

function openLink(link) {
  shell.openExternal(link);
}

const About = (props) => {
  const { id } = props;
  return (
    <Module
      title="About"
      id={id}
      className="about-module"
    >
      <Row justify="center" type="flex">
        <Col span="12" className="txt-center" style={{ paddingTop: '2rem' }} >
          <img className="logo" src={logo} alt="logo" />
        </Col>
      </Row>
      <Row justify="center" type="flex">
        <Col span="12" className="txt-center" style={{ paddingTop: '1rem' }} >
          Current Version: {pkg.version}
        </Col>
      </Row>
      <Row justify="center" type="flex">
        <Col span="24" className="txt-center" style={{ paddingTop: '1rem' }} >
          <Button
            type="ghost"
            className="btn"
            onClick={() => openLink('https://github.com/IceEnd/Yosoro/issues')}
          >Feedback</Button>
          <Button
            type="ghost"
            className="btn"
            onClick={() => openLink('https://yosoro.coolecho.net')}
          >Website</Button>
          <Button
            type="ghost"
            className="btn"
            onClick={() => openLink('https://github.com/IceEnd/Yosoro')}
          >GitHub</Button>
        </Col>
      </Row>
      <Row justify="center" type="flex">
        <Col span="12" className="txt-center" style={{ padding: '2rem' }} >
          <Icon type="mail" /> email: min@coolecho.net
        </Col>
      </Row>
    </Module>
  );
};

About.displayName = 'SettingsAbout';
About.propTypes = {
  id: PropTypes.string.isRequired,
};

export default About;
