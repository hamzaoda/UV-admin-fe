// src/hooks/useApi.js
import { useMakeRequestMutation } from '../redux/apiSlice';

const useApi = () => {
    const [makeRequest, { isLoading, isError, error, data }] = useMakeRequestMutation();

    const callApi = async ({ 
        url, 
        method, 
        dataReq = null, 
        token = true, 
        successMessage = 'Operation successful!', 
        errorMessage = 'Something went wrong!' 
    }) => {
        const response = await makeRequest({ url, method, dataReq, token, successMessage, errorMessage }).unwrap();
        return response;
    };

    return { callApi, isLoading, isError, error, data };
};

export default useApi;