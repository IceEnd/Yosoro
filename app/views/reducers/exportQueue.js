import {
  EXPORT_INIT_QUEUE,
  EXPORT_COMPOLETE,
} from '../actions/exportQueue';

const assign = Object.assign;

export default function exportQueue(state = {
  status: 0, // 0: pending 1: exporting 2: over
}, action) {
  switch (action.type) {
    case EXPORT_INIT_QUEUE:
      return assign({}, state, {
        status: 1,
      });
    case EXPORT_COMPOLETE:
      return assign({}, state, {
        status: 0,
      });
    default:
      return state;
  }
}
