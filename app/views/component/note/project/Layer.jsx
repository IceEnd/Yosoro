import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { Input } from 'antd';
import { eventFolder } from '../../../events/eventDispatch';

let container = null;

const Layer = (props) => {
  // const { visiable, value } = props;
  const [value, changeValue] = useState('');
  const [visible, toggleVisible] = useState(false);
  const [pos, setPos] = useState({
    top: 0,
    left: 0,
  });

  const showLayer = (uuid) => {
    // console.log(uuid);
    const target = document.querySelector(`.f-${uuid}`);
    const { left, right, height } = target.getBoundingClientRect();
    console.log(left, right, height);
    toggleVisible(true);
  };

  useEffect(() => {
    console.log('------');
    eventFolder.on('show-layer', showLayer);

    return () => {
      console.log('========');
      eventFolder.removeListener('show-layer', showLayer);
    };
  }, []);

  if (visible) {
    if (!container) {
      container = document.createElement('div');
      document.body.append(container);
    }
    return ReactDOM.createPortal(
      <div>
        Name: <Input size="small" placeholder="folder name" value={value} onChange={changeValue} />
      </div>,
      container
    );
  }
  return null;
};

Layer.displayName = 'FolderLayer';

export default Layer;
