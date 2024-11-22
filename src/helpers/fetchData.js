// fetchData.js

import axios from "axios";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

/**
 * fetchData - A utility function to make HTTP requests using Axios.
 *
 * @param {string} url - The endpoint URL (relative or absolute).
 * @param {string} method - The HTTP method (e.g., 'GET', 'POST', 'PUT', 'DELETE').
 * @param {object} [data=null] - The request payload for methods like POST, PUT, etc.
 * @param {boolean} [useToken=true] - Whether to include the Authorization header with a token from localStorage.
 *
 * @returns {Promise<object>} - The response data from the server.
 *
 * @throws {Error} - Throws an error if the request fails or the server returns an error status.
 */

const fetchData = async (url, method, data = null, useToken = true) => {
    try {
        // Initialize headers
        const headers = {
            "Content-Type": "application/json",
        };

        // Include Authorization header if useToken is true and token exists in localStorage
        if (useToken) {
            const storedToken = localStorage.getItem("token");
            if (storedToken) {
                headers["Authorization"] = `Bearer ${storedToken}`;
            }
        }

        // Configure Axios request options
        const config = {
            method: method.toLowerCase(), // Axios expects lowercase method names
            url,
            headers,
        };

        // Attach the request body if data is provided and method allows a body
        const methodsWithBody = ["post", "put", "patch", "delete"];
        if (data && methodsWithBody.includes(method.toLowerCase())) {
            config.data = data;
        }

        // Perform the Axios request
        const response = await axios(config);
        console.log(response);
        if (method === "PUT") {
            toast.success("Data Updated Successfully");
        } else if (method === "DELETE") {
            toast.success("Data Deleted Successfully");
        }

        // Axios automatically parses JSON responses, so return the data directly
        return response.data;
    } catch (error) {
        // Handle Axios errors

        if (error.response) {
            // Server responded with a status other than 2xx
            // Attempt to extract a meaningful error message

            const errorMessage = error.response.data ? error.response.data : error.response.statusText ? error.response.statusText : "An error occurred while fetching data.";

            // Display the error message as a toast
            toast.error(errorMessage);

            // return errorMessage;
            return errorMessage;
        } else if (error.message.includes("Invalid token")) {
            toast.error("Your session has expired. Please log in again.");
            localStorage.removeItem("token");
            window.location.href = "/login";
        } else if (error.request) {
            toast.error(error.request);
            // Request was made but no response was received
            // return error.request;
            return error.request;
        } else {
            toast.error(error.message);
            // Something happened in setting up the request
            // return error.message;
            return error.request;
        }
    }
};

export default fetchData;
