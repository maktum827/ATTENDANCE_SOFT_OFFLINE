import {
  legacy_createStore as createStore,
  combineReducers,
  applyMiddleware,
} from 'redux';
import { thunk } from 'redux-thunk';
import { composeWithDevTools } from 'redux-devtools-extension';

import {
  // allOfficiantAttendance,
  allStaffReducer,
  // allStudentAttendance,
  allStudentsReducer,
  connectionReducer,
  dutyReducer,
  loadUserReducer,
  // officiantAttendReducer,
  PDFReducer,
  routineReducer,
  settingsReducer,
  // studentAttendReducer,
  timeRulesReducer,
  userDataReducer,
  userDevicesReducers,
} from '../reducers/othersReducers';

import {
  allDevicesReducer,
  allLogsReducers,
  connectTheDevice,
  deviceCapacityReducer,
  // getStudentAttendanceReducersLocal,
  // getTeacherAttendanceReducersLocal,
  liveLog,
  newDeviceReducer,
  pushReducer,
  AttendanceReducers,
  zkDeviceDeleteReducers,
  zkNewUserReducer,
  zkTecoUserReducer,
} from '../reducers/zktecoReducers';

const reducer = combineReducers({
  user: loadUserReducer,
  userData: userDataReducer,
  connection: connectionReducer,
  PDF: PDFReducer,
  duty: dutyReducer,
  allStaff: allStaffReducer,
  allStudents: allStudentsReducer,
  devices: userDevicesReducers,
  newRoutine: routineReducer,
  settings: settingsReducer,
  // zkteco
  zkConnection: connectTheDevice,
  newDevice: newDeviceReducer,
  allLogs: allLogsReducers,
  zkNewUser: zkNewUserReducer,
  zkUsers: zkTecoUserReducer,
  deleteZkDevice: zkDeviceDeleteReducers,
  pushData: pushReducer,
  allDevices: allDevicesReducer,
  lvieLog: liveLog,
  allAttendance: AttendanceReducers,
  capacity: deviceCapacityReducer,
  timeRules: timeRulesReducer,
});

// making store
const middleware = [thunk];
// let store;

// if (process.env.NODE_ENV === 'development') {
const store = createStore(
  reducer,
  composeWithDevTools(applyMiddleware(...middleware)),
);
// } else {
// store = createStore(reducer, applyMiddleware(...middleware));
// }
export default store;
