import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { BASE_URL_EXPRESS } from '../constants/othersConstants';

export const onlineApi = createApi({
  reducerPath: 'onlineApi',
  baseQuery: fetchBaseQuery({ baseUrl: `${BASE_URL_EXPRESS}/api` }),
  tagTypes: ['Devices', 'Rules'],
  endpoints: (builder) => ({
    allStaff: builder.query({
      query: (code) => `/others/staffs/${code}`,
    }),

    allStudents: builder.query({
      query: (code) => `/others/students/${code}`,
    }),

    pushAttendance: builder.mutation({
      query: ({ data, code }) => ({
        url: `/others/add_attendance/${code}`,
        method: 'POST',
        body: data,
      }),
    }),

    getSettings: builder.query({
      query: (code) => `/others/settings/${code}`,
    }),

    sendSMS: builder.mutation({
      query: ({ data, code }) => ({
        url: `/others/sms_send/${code}`,
        method: 'POST',
        body: data,
      }),
    }),

    devices: builder.query({
      query: (code) => `/others/user_devices/${code}`,
      providesTags: ['Devices'],
    }),

    getUserData: builder.mutation({
      query: (data) => ({
        url: `/others/get_data`,
        method: 'POST',
        body: data,
      }),
    }),

    getTimeRules: builder.query({
      query: (code) => `/others/time_rules/${code}`,
      providesTags: ['Rules'],
    }),

    saveAttendanceDevice: builder.mutation({
      query: (data) => ({
        url: `/others/save_device`,
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Devices'],
    }),
    allClass: builder.query({
      query: (code) => ({
        url: `/others/classes/${code}`,
        method: 'GET',
      }),
    }),

    newTimeRule: builder.mutation({
      query: ({ data, code }) => ({
        url: `/others/save_time_rule/${code}`,
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Rules'],
    }),
  }),
});

export const {
  useAllStaffQuery,
  useAllStudentsQuery,
  usePushAttendanceMutation,
  useGetSettingsQuery,
  useGetTimeRulesQuery,
  useDevicesQuery,
  useSaveAttendanceDeviceMutation,
  useGetUserDataMutation,
  useAllClassQuery,
  useNewTimeRuleMutation,
  useSendSMSMutation,
} = onlineApi;
