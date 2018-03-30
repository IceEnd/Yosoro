import React from 'react';

const Loading = () => {
  const loading = '<use class="app-loading-svg" xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="#app_loading" />';
  return (
    <div className="app-lounch-loading">
      <svg className="loading-cont" viewBox="0 0 57 57" dangerouslySetInnerHTML={{ __html: loading }} />
    </div>
  );
};

Loading.displayName = 'AppLoading';

export default Loading;
