import React from 'react';
import Scrollbars from 'Share/Scrollbars';
import Folder from './Folder';
import Trash from './Trash';

// {...props}
const Projects = (props) => {
  return (
    <div className="project-explorer">
      <Scrollbars>
        <div>
          <Trash />
          <Folder />
        </div>
      </Scrollbars>
    </div>
  );
};

export default Projects;
