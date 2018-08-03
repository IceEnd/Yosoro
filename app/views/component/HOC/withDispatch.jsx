import React from 'react';

const dispatchContext = React.createContext();

export const { Provider, Consumer } = dispatchContext;

export const widthDispatch = (Component) => {
  const HOC = props => (
    <Consumer>
      {value => (
        <Component {...props} dispatch={value} />
      )}
    </Consumer>
  );
  HOC.displayName = 'WithDispatch';
  return HOC;
};

export default dispatchContext;
