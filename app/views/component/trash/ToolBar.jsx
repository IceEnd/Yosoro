import React, { memo, useMemo } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import Title from 'Share/title/Title';
import { trashBack } from 'Actions/projects';

const Bar = memo((props) => {
  const { trashPath, back } = props;
  let hasBack = false;
  let title = 'Trash';
  let iconType = 'delete';
  const target = useMemo(() => {
    if (trashPath.length <= 0) {
      return null;
    }
    return trashPath[trashPath.length - 1];
  }, [trashPath]);
  if (target) {
    title = target.name;
    iconType = 'book';
    hasBack = true;
  }
  return (
    <Title
      title={title}
      iconType={iconType}
      hasBack={hasBack}
      handleBack={back}
    />
  );
});

Bar.displayName = 'TrashToolBar';
Bar.propTypes = {
  trashPath: PropTypes.arrayOf(PropTypes.shape({
    uuid: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
  })).isRequired,
  back: PropTypes.func.isRequired,
};

function mapStateToProps(state, ownProps) {
  const { projects: { trashPath = [] } } = state;
  return {
    trashPath,
    ...ownProps,
  };
}

function mapDispatchToProps(dispatch) {
  return {
    back: (...args) => dispatch(trashBack(...args)),
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(Bar);
