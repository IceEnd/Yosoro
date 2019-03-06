import React from 'react';
import PropTypes from 'prop-types';

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
    HOC.propTypes = {
      forwardedRef: PropTypes.any,
    };
    return React.forwardRef((props, ref) =>
      <HOC {...props} forwardedRef={ref} />
    );
  };
}

export const withDispatch = hocCreator('dispatch', 'WithDispatch');
export const withTheme = hocCreator('theme', 'WithTheme');
export const withPlatform = hocCreator('platform', 'WithPlatform');

export default dispatchContext;
