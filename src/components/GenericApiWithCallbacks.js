// src/components/GenericApiExample.js
import React, { useState, useEffect } from 'react';
import useApi from '../hooks/useApi';

const GenericApiExample = () => {
    const { callApi, isLoading, isError, error, data } = useApi();
    const [items, setItems] = useState([]);
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');

    // جلب البيانات عند تحميل المكون
    useEffect(() => {
        const fetchItems = async () => {
            const response = await callApi({
                url: '/items',
                method: 'GET',
                token: true,
                successMessage: 'Items fetched successfully!',
                errorMessage: 'Failed to fetch items!',
            });
            if (response) {
                setItems(response);
            }
        };
        fetchItems();
    }, [callApi]);

    const handleCreate = async () => {
        const newItem = { name, description };
        const response = await callApi({
            url: '/items',
            method: 'POST',
            dataReq: newItem,
            token: true,
            successMessage: 'Item created successfully!',
            errorMessage: 'Failed to create item!',
        });
        if (response) {
            setItems([...items, response]);
            setName('');
            setDescription('');
        }
    };

    const handleUpdate = async (id) => {
        const updatedItem = { name: 'Updated Name', description: 'Updated Description' };
        const response = await callApi({
            url: `/items/${id}`,
            method: 'PUT',
            dataReq: updatedItem,
            token: true,
            successMessage: 'Item updated successfully!',
            errorMessage: 'Failed to update item!',
        });
        if (response) {
            const updatedItems = items.map(item =>
                item.id === id ? { ...item, ...response } : item
            );
            setItems(updatedItems);
        }
    };

    const handleDelete = async (id) => {
        // تنفيذ التحديث التنبئي
        const updatedItems = items.filter(item => item.id !== id);
        setItems(updatedItems);

        const response = await callApi({
            url: `/items/${id}`,
            method: 'DELETE',
            token: true,
            successMessage: 'Item deleted successfully!',
            errorMessage: 'Failed to delete item!',
        });

        if (!response) {
            // التراجع عن التحديث التنبئي في حالة فشل الحذف
            const refetchResponse = await callApi({
                url: '/items',
                method: 'GET',
                token: true,
                successMessage: 'Items fetched successfully!',
                errorMessage: 'Failed to fetch items!',
            });
            if (refetchResponse) {
                setItems(refetchResponse);
            }
        }
    };

    return (
        <div>
            <h2>Generic API Handler Example</h2>
            {isLoading && <p>Loading...</p>}
            {isError && <p style={{ color: 'red' }}>Error: {error?.data?.message || error.message}</p>}
            <ul>
                {items && items.map(item => (
                    <li key={item.id}>
                        {item.name}: {item.description}
                        <button onClick={() => handleUpdate(item.id)} disabled={isLoading}>
                            Update
                        </button>
                        <button onClick={() => handleDelete(item.id)} disabled={isLoading}>
                            Delete
                        </button>
                    </li>
                ))}
            </ul>

            <div>
                <h3>Add New Item</h3>
                <input
                    type="text"
                    placeholder="Name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                />
                <input
                    type="text"
                    placeholder="Description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                />
                <button onClick={handleCreate} disabled={isLoading}>
                    {isLoading ? 'Creating...' : 'Create New Item'}
                </button>
            </div>
        </div>
    );
};

export default GenericApiExample;