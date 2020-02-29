import React from 'react';
import ToolBar from './ToolBar';
import Content from './Content';

import '../../assets/scss/trash.scss';

const Trash = () => (
  <div className="trash">
    <ToolBar />
    <Content />
  </div>
);

Trash.displayName = 'Trash';

export default Trash;
