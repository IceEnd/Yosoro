import React, { Fragment } from 'react';
import Projects from './project/Projects';
import Files from './Files';

const Explorer = () => ((
  <Fragment>
    <Projects />
    <Files />
  </Fragment>
));

Explorer.displayName = 'NoteExplorer';
export default Explorer;
