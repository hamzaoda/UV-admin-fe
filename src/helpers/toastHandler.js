// src/helpers/toastHandler.js
import { toast } from 'react-toastify';

// دالة لعرض رسالة نجاح
export const showSuccess = (message) => {
    toast.success(message, {
        autoClose: 3000,
    });
};

// دالة لعرض رسالة خطأ
export const showError = (message) => {
    toast.error(message, {
        autoClose: 5000,
    });
};