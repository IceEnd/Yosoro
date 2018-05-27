import React from 'react';
import SVGIcon from './share/SVGIcon';

const Loading = () => (
  <div className="app-lounch-loading">
    <SVGIcon
      className="loading-cont"
      viewBox="0 0 57 57"
      id="#app_loading"
      useClassName="app-loading-svg"
    />
  </div>
);

Loading.displayName = 'AppLoading';

export default Loading;
