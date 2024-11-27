// src/hooks/useApi.js

import { useMakeRequestMutation } from '../redux/apiSlice';
import { useCallback } from 'react';

const useApi = () => {
    const [makeRequest, { isLoading, isError, error, data }] = useMakeRequestMutation();

    const callApi = useCallback(async ({
        url,
        method,
        dataReq = null,
        successMessage = 'Operation successful!',
        errorMessage = 'Something went wrong!'
    }) => {
        try {
            console.log('Making API call to:', url);
            const storedToken = localStorage.getItem('authToken');
            console.log('Current Token:', storedToken);
            // Pass all arguments including successMessage and errorMessage
            const response = await makeRequest({ url, method, dataReq, successMessage, errorMessage }).unwrap();
            return response;
        }
        catch (err) {
            console.error("API call error:", err);
            throw err;
        }
    }, [makeRequest]);

    return { callApi, isLoading, isError, error, data };
};

export default useApi;