import { toast } from 'react-toastify';
import {axiosMain} from '../http/axios/axios_main';

export default function* apiHandler({
  endpoint,
  successHandler,
  failHandler,
  failHandlerType = '',
  payload = {},
  apiType = '',
  token = false,
  isLogoutCall = false,
  baseAxios = axiosMain,
  // showToast = "",
}) {
  if (apiType.trim() === '') {
    throw new Error('apiType is require');
  }
  try {
    let response;
    if (!token) {
      if (apiType === 'get') {
        response = yield baseAxios.get(endpoint);
      } else if (apiType === 'post') {
        response = yield baseAxios.post(endpoint, payload);
      } else if (apiType === 'put') {
        response = yield baseAxios.put(endpoint, payload);
      } else if (apiType === 'delete') {
        response = yield baseAxios.delete(endpoint);
      }
    } else {
      const authToken = yield localStorage.getItem('authToken');
      const config = {
        headers: {
          Authorization: `${authToken}`,
        },
      };
      if (apiType === 'get') {
        response = yield baseAxios.get(endpoint, config);
      } else if (apiType === 'post') {
        response = yield baseAxios.post(endpoint, payload, config);
      } else if (apiType === 'put') {
        response = yield baseAxios.put(endpoint, payload, config);
      } else if (apiType === 'patch') {
        response = yield baseAxios.patch(endpoint, payload, config);
      } else if (apiType === 'delete') {
        response = yield baseAxios.delete(endpoint, config);
      }
    }
    if (response && (response.status === 200 || response.status === 201) && response.data) {
      yield successHandler(response.data);
      // showToast && successToast(response.data);
    } else if (response !== undefined && response.status !== undefined) {
      if (
        response.data.message !== undefined &&
        response.data.message !== '' &&
        typeof response.data.message === 'string'
      ) {
        if (failHandlerType === 'CUSTOM') {
          yield failHandler(response.data.message);
        } else {
          yield put(failHandler(response.data.message));
        }
      } else if (failHandlerType === 'CUSTOM') {
        yield failHandler('Server error! Please try again.');
      } else {
        yield put(failHandler('Server error! Please try again.'));
      }
    } else if (failHandlerType === 'CUSTOM') {
      yield failHandler('Something went wrong! Please try again.');
    } else {
      yield put(failHandler('Something went wrong! Please try again.'));
    }
  } catch (error) {
    if (
      error !== undefined &&
      error.response !== undefined &&
      error.response.status !== undefined
    ) {
      if (error.response.status === 400) {
        if (failHandlerType === 'CUSTOM') {
          yield failHandler(error.response.data.message);
        } else {
          yield put(failHandler(error.response.data.message));
        }
      } else if (error.response.status === 401) {
        toast.error('Session expired! please login again ');
        localStorage.clear();
        window.location.reload();
        if (isLogoutCall) {
          successHandler({});
        } else {
          // yield put(logout({ logoutType: "manual" }));
        }
      } else if (
        error.response.data.message !== undefined &&
        error.response.data.message !== '' &&
        typeof error.response.data.message === 'string'
      ) {
        if (failHandlerType === 'CUSTOM') {
          yield failHandler(error.response.data.message);
        } else {
          yield put(failHandler(error.response.data.message));
        }
      } else if (failHandlerType === 'CUSTOM') {
        yield failHandler('Server error! Please try again later.');
      } else {
        yield put(failHandler('Server error! Please try again later.'));
      }
    } else if (failHandlerType === 'CUSTOM') {
      yield failHandler('Something went wrong! Please try again later.');
    } else {
      yield put(failHandler('Something went wrong! Please try again later.'));
    }
  }
}
