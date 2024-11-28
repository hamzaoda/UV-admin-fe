import React, { useState, useEffect } from 'react';
import './UserManagements.css';
import useApi from '../../hooks/useApi';
import ReactPaginate from 'react-paginate'; // Import react-paginate

function UserManagements() {
    const [currentPage, setCurrentPage] = useState(0); // 0-based index for react-paginate
    const usersPerPage = 9; // Number of users per page
    const [users, setUsers] = useState([]); // State to store fetched users
    const [isSendingEmail, setIsSendingEmail] = useState(false); // Loading state for sending email
    const { callApi, isLoading, isError, error } = useApi();

    // Fields to display in the table
    const fields = ["email", "country", "createdAt"]; // Added "country"

    // Fetch users when the component mounts
    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const response = await callApi({
                    url: '/cms/list',
                    method: 'GET',
                    successMessage: 'Users fetched successfully!',
                    errorMessage: 'Error fetching users.',
                });

                if (response.isSuccess) {
                    setUsers(response.data); // Update the users state with fetched data
                } else {
                    console.error('API Error:', response.message);
                }

                console.log('Fetched Users:', response);
            } catch (error) {
                console.error('Fetch Users Error:', error);
            }
        };

        fetchUsers();
    }, [callApi]);

    // Calculate total pages based on fetched users
    const totalPages = Math.ceil(users.length / usersPerPage);

    // Get current page's users
    const offset = currentPage * usersPerPage;
    const currentUsers = users.slice(offset, offset + usersPerPage);

    // Handle page change
    const handlePageChange = ({ selected }) => {
        setCurrentPage(selected);
    };

    // Handle send email button click
    const handleSendEmail = async () => {
        setIsSendingEmail(true); // Set loading to true
        try {
            const response = await callApi({
                url: '/cms/send-email',
                method: 'POST',
                dataReq: { type: 'Welcome' },
                successMessage: 'Email sent successfully!',
                errorMessage: 'Error sending email.',
            });

            if (!response.isSuccess) {
                console.error('API Error:', response.message);
            }
        } catch (error) {
            console.error('Send Email Error:', error);
        } finally {
            setIsSendingEmail(false); // Set loading to false
        }
    };

    return (
        <div className="user-managements-container">
            {isSendingEmail && (
                <div className="loading-overlay">
                    <div className="loading-spinner"></div>
                </div>
            )}

            <div className='user-managements-header-container'>
                <select className='user-managements-select'>
                    <option value="Welcome">Welcome</option>
                </select>
                <h1>User Management</h1>
                <button
                    className='user-managements-btn'
                    onClick={handleSendEmail}
                    disabled={isSendingEmail} // Disable button while sending email
                >
                    {isSendingEmail ? 'Sending...' : 'Send Email'}
                </button>
            </div>

            <table className="user-managements-table">
                <thead>
                    <tr>
                        {fields.map((field) => (
                            <th key={field}>
                                {field === 'createdAt'
                                    ? 'Date'
                                    : field.charAt(0).toUpperCase() + field.slice(1)}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {currentUsers.length === 0 ? (
                        <tr>
                            <td colSpan={fields.length}>No users found.</td>
                        </tr>
                    ) : (
                        currentUsers.map((user) => (
                            <tr key={user._id}>
                                {fields.map((field) => (
                                    <td key={field}>
                                        {field === 'createdAt'
                                            ? new Date(user.createdAt).toLocaleDateString()
                                            : user[field]}
                                    </td>
                                ))}
                            </tr>
                        ))
                    )}
                </tbody>
            </table>

            {/* Pagination Controls using react-paginate */}
            {totalPages > 1 && (
                <div className="pagination-container">
                    <ReactPaginate
                        previousLabel={'Previous'}
                        nextLabel={'Next'}
                        breakLabel={'...'}
                        breakClassName={'break-me'}
                        pageCount={totalPages}
                        marginPagesDisplayed={2}
                        pageRangeDisplayed={5} // Adjusted for better UX
                        onPageChange={handlePageChange}
                        containerClassName={'pagination'}
                        activeClassName={'active'}
                        forcePage={currentPage}
                    />
                </div>
            )}
        </div>
    );
}

export default UserManagements;
