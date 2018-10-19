import React from 'react';

const dispatchContext = React.createContext();

export const { Provider, Consumer } = dispatchContext;

function hocCreator(propsName, displayName) {
  return (Component) => {
    const HOC = props => (
      <Consumer>
        {(value) => {
          const context = {
            [propsName]: value[propsName],
          };
          return (<Component {...props} {...context} />);
        }}
      </Consumer>
    );
    HOC.displayName = displayName;
    return HOC;
  };
}

export const withDispatch = hocCreator('dispatch', 'WithDispatch');
export const withTheme = hocCreator('theme', 'WithTheme');

export default dispatchContext;
