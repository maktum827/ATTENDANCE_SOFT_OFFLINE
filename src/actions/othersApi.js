import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { BASE_URL_EXPRESS } from '../constants/othersConstants';

export const othersApi = createApi({
  reducerPath: 'othersApi',
  tagTypes: ['Rules'],
  baseQuery: fetchBaseQuery({ baseUrl: `${BASE_URL_EXPRESS}/api` }),

  endpoints: (builder) => ({
    loadUser: builder.query({
      query: () => `/load_user`,
    }),
    connectUser: builder.mutation({
      query: (userInfo) => ({
        url: `/connect_user`,
        method: 'POST',
        body: userInfo,
      }),
    }),
  }),
});

export const { useLoadUserQuery, useConnectUserMutation } = othersApi;
