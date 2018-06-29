import {
  GET_USER_AVATAR,
  GET_USER_AVATAR_SUCCESS,
  GET_USER_AVATAR_FAILED,
  SET_USER_LOCAL_AVATAR,
} from '../actions/user';

const assign = Object.assign;

export default function updateUser(state = {
  avatar: '',
}, action) {
  switch (action.type) {
    case SET_USER_LOCAL_AVATAR:
    case GET_USER_AVATAR_SUCCESS: {
      return assign({}, state, {
        avatar: action.avatar,
      });
    }
    case GET_USER_AVATAR:
    case GET_USER_AVATAR_FAILED:
    default:
      return state;
  }
}
