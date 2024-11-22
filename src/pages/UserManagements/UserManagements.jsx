import React, { useState } from 'react';
import './UserManagements.css';
import CustomCheckbox from '../../components/CustomComponents/CustomCheckbox/CustomCheckbox';

function UserManagements() {
    const [selectedUsers, setSelectedUsers] = useState([]);
    const [emailStatus, setEmailStatus] = useState({});

    const users = [
        { id: 1, email: 'ahmadnkw1@hotmail.com', date: '10/2/2024' },
        { id: 2, email: 'user2@example.com', date: '11/2/2024' },
        { id: 3, email: 'user3@example.com', date: '12/2/2024' },
    ];

    const fields = ["id", "email", "date"]

    fields.map((field) => {
        console.log(field);
    });

    users.map((user) => {
        <tr>
        fields.map((field) => {
                <td>  console.log(user[field]);</td>
            });
        </tr>
    });

    const handleCheckboxChange = (user) => {
        setSelectedUsers((prevSelected) =>
            prevSelected.includes(user.id)
                ? prevSelected.filter((id) => id !== user.id)
                : [...prevSelected, user.id]
        );

        // Log user details to the console
        console.log(`User Selected:`, {
            id: user.id,
            email: user.email,
            date: user.date,
        });
    };

    const handleSelectAll = () => {
        if (selectedUsers.length === users.length) {
            setSelectedUsers([]); // Deselect all if all are selected
        } else {
            setSelectedUsers(users.map(user => user.id)); // Select all
        }
    };

    const handleSendEmail = (userId) => {
        const user = users.find(user => user.id === userId);
        console.log(`Sending email to:`, user);

        setEmailStatus((prevStatus) => ({
            ...prevStatus,
            [userId]: 'sent', // Mark as sent
        }));

        setTimeout(() => {
            setEmailStatus((prevStatus) => ({
                ...prevStatus,
                [userId]: 'default', // Reset to default after 5 seconds
            }));
        }, 5000);
    };

    const handleSendEmailToSelected = () => {
        const selectedUserDetails = users.filter(user => selectedUsers.includes(user.id));
        console.log('Sending email to selected users:', selectedUserDetails);
    };

    return (
        <div className="user-managements-container">
            <div className="user-managements-header-container">
                <button onClick={handleSelectAll}>
                    {selectedUsers.length === users.length ? 'Deselect All' : 'Select All'}
                </button>
                <h1 className="user-managements-header">UserManagements</h1>
                <button onClick={handleSendEmailToSelected}>Send Email</button>
            </div>
            <table className="user-managements-table">
                <thead>
                    <tr>
                        <th></th>
                        <th>ID</th>
                        <th>Email</th>
                        <th>Date</th>
                        <th>Action</th>

                    </tr>
                </thead>
                <tbody>
                    {users.map((user) => (
                        <tr key={user.id}>
                            <td>
                                <CustomCheckbox
                                    id={`checkbox-${user.id}`}
                                    name="userCheckbox"
                                    value={user.id}
                                    checked={selectedUsers.includes(user.id)}
                                    onChange={() => handleCheckboxChange(user)}
                                />
                            </td>
                            <td>{user.id}</td>
                            <td>{user.email}</td>
                            <td>{user.date}</td>
                            <td>
                                <button
                                    onClick={() => handleSendEmail(user.id)}
                                    disabled={emailStatus[user.id] === 'sent'}
                                >
                                    {emailStatus[user.id] === 'sent' ? 'Email Sent' : 'Send Email'}
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

export default UserManagements;