import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { BASE_URL_FLASK } from '../constants/othersConstants';

export const zkTecoApi = createApi({
  reducerPath: 'zkTecoApi',
  baseQuery: fetchBaseQuery({ baseUrl: `${BASE_URL_FLASK}/api/zkteco` }),
  tagTypes: [
    'Attendance',
    'Users',
    'Departments',
    'Classes',
    'Users',
    'Designations',
    'TimeRules',
    'Devices',
    'Academy',
    'Integrations',
    'ClassesGroups',
  ],
  endpoints: (builder) => ({
    addAcademy: builder.mutation({
      query: (formData) => ({
        url: `/add_academy`,
        method: 'POST',
        body: formData,
      }),
      invalidatesTags: ['Academy'],
    }),

    getAcademy: builder.query({
      query: () => `/get_academy`,
      providesTags: ['Academy'],
    }),

    freeData: builder.mutation({
      query: (deviceData) => ({
        url: `/free_data`,
        method: 'POST',
        body: deviceData,
      }),
    }),

    closeDevice: builder.mutation({
      query: (deviceData) => ({
        url: `/close_device`,
        method: 'POST',
        body: deviceData,
      }),
    }),

    formatDevice: builder.mutation({
      query: (data) => ({
        url: `/format_device`,
        method: 'POST',
        body: data,
      }),
    }),

    connectAttendanceDevice: builder.mutation({
      query: (data) => ({
        url: `/connect_device`,
        method: 'POST',
        body: data,
      }),
    }),

    addZkNewUser: builder.mutation({
      query: (data) => ({
        url: `/add_zk_user`,
        method: 'POST',
        body: data,
      }),
    }),

    getZkUsers: builder.mutation({
      query: (data) => ({
        url: `/get_zk_users`,
        method: 'POST',
        body: data,
      }),
      providesTags: ['Users'],
    }),

    deleteZkUser: builder.mutation({
      query: (data) => ({
        url: `/delete_zk_user`,
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Users'],
    }),

    getAttendance: builder.query({
      query: () => `/get_attendance`,
      providesTags: ['Attendance'],
    }),

    getTodayAttendance: builder.query({
      query: () => `/get_today_attendance`,
    }),

    getDeviceCapacity: builder.query({
      query: (deviceData) => ({
        url: `/device_capacity`,
        method: 'POST',
        body: deviceData,
      }),
    }),

    deleteAttendance: builder.mutation({
      query: (id) => ({
        url: `/delete_attendance/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Attendance'],
    }),

    insertPastLogs: builder.mutation({
      query: (devices) => ({
        url: `/insert_past_logs`,
        method: 'POST',
        body: devices,
      }),
      invalidatesTags: ['Attendance'],
    }),

    sendShiftSms: builder.mutation({
      query: ({ data }) => ({
        url: `/send_shift_messages`,
        method: 'POST',
        body: data,
      }),
    }),

    getLateMessages: builder.query({
      query: () => `/late_messages`,
    }),

    addDepartment: builder.mutation({
      query: (data) => ({
        url: `/add_department`,
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Departments'],
    }),

    getDepartments: builder.query({
      query: () => `/get_departments`,
      providesTags: ['Departments'],
    }),

    deleteDepartment: builder.mutation({
      query: (id) => ({
        url: `/delete_department/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Departments'],
    }),

    addClass: builder.mutation({
      query: (data) => ({
        url: `/add_class`,
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Classes'],
    }),

    getClasses: builder.query({
      query: () => `/get_classes`,
      providesTags: ['Classes'],
    }),

    deleteClass: builder.mutation({
      query: (id) => ({
        url: `/delete_class/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Classes'],
    }),

    addGroup: builder.mutation({
      query: (data) => ({
        url: `/add_group`,
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['ClassesGroups'],
    }),

    getGroups: builder.query({
      query: () => `/get_groups`,
      providesTags: ['ClassesGroups'],
    }),

    deleteGroup: builder.mutation({
      query: (id) => ({
        url: `/delete_group/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['ClassesGroups'],
    }),

    addDesignation: builder.mutation({
      query: (data) => ({
        url: `/add_designation`,
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Designations'],
    }),

    getDesignations: builder.query({
      query: () => `/get_designations`,
      providesTags: ['Designations'],
    }),

    deleteDesignation: builder.mutation({
      query: (id) => ({
        url: `/delete_designation/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Designations'],
    }),

    addUser: builder.mutation({
      query: (formData) => ({
        url: `/add_user`,
        method: 'POST',
        body: formData, // ✅ Send FormData directly
      }),
      invalidatesTags: ['Users'],
    }),

    getUsers: builder.query({
      query: () => `/get_users`,
      providesTags: ['Users'],
    }),

    getTimeRules: builder.query({
      query: () => `/get_time_rules`,
      providesTags: ['TimeRules'],
    }),

    addTimeRules: builder.mutation({
      query: (data) => ({
        url: `/add_time_rules`,
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['TimeRules'],
    }),

    deleteRule: builder.mutation({
      query: (id) => ({
        url: `/delete_time_rule/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['TimeRules'],
    }),

    addDevice: builder.mutation({
      query: (data) => ({
        url: `/add_device`,
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Devices'],
    }),

    getDevices: builder.query({
      query: () => `/get_devices`,
      providesTags: ['Devices'],
    }),

    getConnectedDevices: builder.query({
      query: () => `/connect_device`,
      providesTags: ['Devices'],
    }),

    deleteDevice: builder.mutation({
      query: (id) => ({
        url: `/delete_device/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Devices'],
    }),
    softwareActivation: builder.mutation({
      query: (code) => ({
        url: `/activation`,
        method: 'POST',
        body: code,
      }),
    }),

    addSmsService: builder.mutation({
      query: (data) => ({
        url: `/add_sms_service`,
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Integrations'],
    }),

    getSmsService: builder.query({
      query: () => `/get_sms_service`,
      providesTags: ['Integrations'],
    }),

    deleteMessageIntegration: builder.mutation({
      query: () => ({
        url: `/delete_message_integration`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Integrations'],
    }),
  }),
});

export const {
  useFreeDataMutation,
  useCloseDeviceMutation,
  useFormatDeviceMutation,
  useConnectAttendanceDeviceMutation,
  useGetZkUsersMutation,
  useDeleteZkUserMutation,
  useGetAttendanceQuery,
  useDeleteAttendanceMutation,
  useInsertPastLogsMutation,
  useAddZkNewUserMutation,
  useGetDeviceCapacityQuery,
  useGetLateMessagesQuery,
  useSendShiftSmsMutation,
  useGetTodayAttendanceQuery,
  useAddDepartmentMutation,
  useGetDepartmentsQuery,
  useDeleteDepartmentMutation,
  useAddClassMutation,
  useGetClassesQuery,
  useDeleteClassMutation,
  useAddUserMutation,
  useGetUsersQuery,
  useAddGroupMutation,
  useGetGroupsQuery,
  useDeleteGroupMutation,
  useAddDesignationMutation,
  useGetDesignationsQuery,
  useDeleteDesignationMutation,
  useAddTimeRulesMutation,
  useGetTimeRulesQuery,
  useDeleteRuleMutation,
  useAddDeviceMutation,
  useGetDevicesQuery,
  useDeleteDeviceMutation,
  useGetConnectedDevicesQuery,
  useAddAcademyMutation,
  useGetAcademyQuery,
  useSoftwareActivationMutation,
  useAddSmsServiceMutation,
  useGetSmsServiceQuery,
  useDeleteMessageIntegrationMutation,
} = zkTecoApi;
