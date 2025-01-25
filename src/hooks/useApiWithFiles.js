// src/hooks/useApiWithFiles.js
import { useMakeFormDataRequestMutation } from '../redux/apiSlice';
import { useCallback } from 'react';

const useApiWithFiles = () => {
    const [makeRequest, { isLoading, isError, error, data }] = useMakeFormDataRequestMutation();

    const callApi = useCallback(async ({
        url,
        method,
        dataReq = null,
        files = {},
        successMessage = 'Operation successful!',
        errorMessage = 'Something went wrong!'
    }) => {

        try {
            console.log('Making API call to:', url);
            const storedToken = localStorage.getItem('authToken');
            console.log('Current Token:', storedToken);
            const formData = new FormData();

            // Append JSON data as a string in a field named "json"
            if (dataReq) {
                formData.append('json', JSON.stringify(dataReq));
            }
            // Append files
            for (const key in files) {
                if (files[key]) {
                    if (Array.isArray(files[key])) {
                        files[key].forEach(file => { // Assuming it's an array of File objects
                            formData.append(key, file, file.name);
                        });
                    } else if (files[key] instanceof File) { // Handle single File object if needed
                        formData.append(key, files[key], files[key].name);
                    }
                }
            }

            const response = await makeRequest({ url, method, dataReq: formData, successMessage, errorMessage }).unwrap();
            return response;
        }
        catch (err) {
            console.error("API call error:", err);
            throw err;
        }
    }, [makeRequest]);

    return { callApi, isLoading, isError, error, data };
};

export default useApiWithFiles;