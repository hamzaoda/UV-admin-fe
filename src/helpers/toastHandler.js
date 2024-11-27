// src/helpers/toastHandler.js
import { toast } from 'react-toastify';

export const showSuccess = (message) => {
    toast.success(message, {
        autoClose: 1500,
    });
};

export const showError = (message) => {
    toast.error(message, {
        autoClose: 5000,
    });
};