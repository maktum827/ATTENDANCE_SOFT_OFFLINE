
import axios from 'axios';

// Helper function to handle API requests
export const apiRequest = async (dispatch, actionTypes, requestConfig) => {
    const [REQUEST, SUCCESS, FAIL] = actionTypes;
    try {
        dispatch({ type: REQUEST });

        const { method, url, data, headers } = requestConfig;
        const config = { headers };
        const response = method === 'get' || method === 'delete'
            ? await axios[method](url, config)
            : await axios[method](url, data, config);

        dispatch({
            type: SUCCESS,
            payload: response.data,
        });
    } catch (error) {
        dispatch({
            type: FAIL,
            payload: error.response?.data?.message || error.message,
        });
    }
};
