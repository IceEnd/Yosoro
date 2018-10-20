import React from 'react';

const dispatchContext = React.createContext();

export const { Provider, Consumer } = dispatchContext;

function hocCreator(propsName, displayName) {
  return (Component) => {
    const HOC = (props) => {
      const { forwardedRef, ...rest } = props;
      return (
        <Consumer>
          {(value) => {
            const context = {
              [propsName]: value[propsName],
            };
            return (<Component ref={forwardedRef} {...rest} {...context} />);
          }}
        </Consumer>
      );
    };
    HOC.displayName = displayName;
    return React.forwardRef((props, ref) =>
      <HOC {...props} forwardedRef={ref} />
    );
  };
}

export const withDispatch = hocCreator('dispatch', 'WithDispatch');
export const withTheme = hocCreator('theme', 'WithTheme');

export default dispatchContext;
