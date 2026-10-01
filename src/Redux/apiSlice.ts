import { createApi } from '@reduxjs/toolkit/query/react';
import { axiosBaseQuery } from '../services/axiosBaseQuery';



export const apiSlice = createApi({
reducerPath: 'api',
baseQuery: axiosBaseQuery(), // axios under the hood
tagTypes: ['Auth',],
endpoints: () => ({}), // endpoints are injected from feature slices
});