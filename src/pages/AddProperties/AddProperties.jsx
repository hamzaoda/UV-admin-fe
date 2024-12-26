// src/pages/AddProperties/AddProperties.jsx
import React, { useState, useEffect } from 'react';
import './AddProperties.css';
import { FaEdit, FaTrash, FaPlus } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import useApi from '../../hooks/useApi'; // Import the useApi hook

function AddProperties() {
    const propertyCategories = ['sizes', 'tags', 'colors']; // Lowercase keys
    const [activeTab, setActiveTab] = useState('sizes');
    const [newProperty, setNewProperty] = useState('');
    const [isEditing, setIsEditing] = useState(false);
    const [currentEdit, setCurrentEdit] = useState({ category: '', oldValue: '', newValue: '' });

    // Integrate the useApi hook
    const { callApi, isLoading, isError, error } = useApi();

    // State for properties, initialize as empty with lowercase keys
    const [properties, setProperties] = useState({
        sizes: [],
        tags: [],
        colors: [],
    });

    // Separate loading state for initial fetch
    const [isInitialLoading, setIsInitialLoading] = useState(true); // New state

    // Separate loading state for operations
    const [operationLoading, setOperationLoading] = useState(false); // New state

    // Fetch properties from the API on mount
    useEffect(() => {
        const fetchProperties = async () => {
            try {
                const response = await callApi({
                    url: '/properties/list',
                    method: 'GET',
                    successMessage: 'Properties fetched successfully!',
                    errorMessage: 'Error fetching properties.',
                });

                if (response.isSuccess && response.data) {
                    const fetchedProperties = {
                        sizes: response.data.sizes || [],
                        tags: response.data.tags || [],
                        colors: response.data.colors || [],
                    };
                    setProperties(fetchedProperties);
                    console.log('Properties State after fetch:', fetchedProperties);
                } else {
                    console.error('API Error:', response.message);
                }
            } catch (error) {
                console.error('Fetch Properties Error:', error);
            } finally {
                setIsInitialLoading(false); // Set to false after fetch
            }
        };

        fetchProperties();
    }, [callApi]);

    // Handler to add a new property
    const handleAddProperty = async (category) => {
        const trimmedProperty = newProperty.trim();
        if (trimmedProperty === '') {
            alert('Property name cannot be empty.');
            return;
        }
        if (properties[category].some((item) => item.toLowerCase() === trimmedProperty.toLowerCase())) {
            alert(`"${trimmedProperty}" already exists in ${category}.`);
            return;
        }

        // Optimistically update the local state
        const updatedProperties = {
            ...properties,
            [category]: [...properties[category], trimmedProperty],
        };
        setProperties(updatedProperties);
        setNewProperty('');
        setOperationLoading(true); // Start operation loading

        // Make API call to update properties
        try {
            const response = await callApi({
                url: '/properties/update',
                method: 'POST', // Adjust based on your API design
                dataReq: updatedProperties, // Keys are lowercase
                successMessage: `${category.slice(0, -1)} "${trimmedProperty}" added successfully!`,
                errorMessage: `Error adding ${category.slice(0, -1)} "${trimmedProperty}".`,
            });

            if (!response.isSuccess) {
                console.error('API Error:', response.message);
                // Revert local state on failure
                setProperties((prevProperties) => ({
                    ...prevProperties,
                    [category]: prevProperties[category].filter((item) => item !== trimmedProperty),
                }));
                alert(response.message); // Inform the user
            } else {
                console.log('Properties updated on server:', updatedProperties);
            }
        } catch (error) {
            console.error('Error updating properties:', error);
            // Revert local state on failure
            setProperties((prevProperties) => ({
                ...prevProperties,
                [category]: prevProperties[category].filter((item) => item !== trimmedProperty),
            }));
            alert('An unexpected error occurred.');
        } finally {
            setOperationLoading(false); // End operation loading
        }
    };

    // Handler to delete a property
    const handleDeleteProperty = async (category, value) => {
        if (window.confirm(`Are you sure you want to delete "${value}" from ${category}?`)) {
            // Optimistically update the local state
            const updatedProperties = {
                ...properties,
                [category]: properties[category].filter((item) => item !== value),
            };
            setProperties(updatedProperties);
            setOperationLoading(true); // Start operation loading

            // Make API call to update properties
            try {
                const response = await callApi({
                    url: '/properties/update',
                    method: 'POST', // Adjust based on your API design
                    dataReq: updatedProperties, // Keys are lowercase
                    successMessage: `${category.slice(0, -1)} "${value}" deleted successfully!`,
                    errorMessage: `Error deleting ${category.slice(0, -1)} "${value}".`,
                });

                if (!response.isSuccess) {
                    console.error('API Error:', response.message);
                    // Revert local state on failure
                    setProperties((prevProperties) => ({
                        ...prevProperties,
                        [category]: [...prevProperties[category], value],
                    }));
                    alert(response.message);
                } else {
                    console.log('Properties updated on server:', updatedProperties);
                }
            } catch (error) {
                console.error('Error updating properties:', error);
                // Revert local state on failure
                setProperties((prevProperties) => ({
                    ...prevProperties,
                    [category]: [...prevProperties[category], value],
                }));
                alert('An unexpected error occurred.');
            } finally {
                setOperationLoading(false); // End operation loading
            }
        }
    };

    // Handler to initiate editing a property
    const handleEditInitiate = (category, value) => {
        setIsEditing(true);
        setCurrentEdit({ category, oldValue: value, newValue: value });
    };

    // Handler to save the edited property
    const handleSaveEdit = async () => {
        const trimmedValue = currentEdit.newValue.trim();
        if (trimmedValue === '') {
            alert('Property name cannot be empty.');
            return;
        }
        if (
            trimmedValue.toLowerCase() !== currentEdit.oldValue.toLowerCase() &&
            properties[currentEdit.category].some((item) => item.toLowerCase() === trimmedValue.toLowerCase())
        ) {
            alert(`"${trimmedValue}" already exists in ${currentEdit.category}.`);
            return;
        }

        // Optimistically update the local state
        const updatedProperties = {
            ...properties,
            [currentEdit.category]: properties[currentEdit.category].map((item) =>
                item === currentEdit.oldValue ? trimmedValue : item
            ),
        };
        setProperties(updatedProperties);
        setIsEditing(false);
        setCurrentEdit({ category: '', oldValue: '', newValue: '' });
        setOperationLoading(true); // Start operation loading

        // Make API call to update properties
        try {
            const response = await callApi({
                url: '/properties/update',
                method: 'POST', // Adjust based on your API design
                dataReq: updatedProperties, // Keys are lowercase
                successMessage: `${currentEdit.category.slice(0, -1)} updated successfully!`,
                errorMessage: `Error updating ${currentEdit.category.slice(0, -1)}.`,
            });

            if (!response.isSuccess) {
                console.error('API Error:', response.message);
                // Revert local state on failure
                setProperties((prevProperties) => ({
                    ...prevProperties,
                    [currentEdit.category]: prevProperties[currentEdit.category].map((item) =>
                        item === trimmedValue ? currentEdit.oldValue : item
                    ),
                }));
                alert(response.message);
            } else {
                console.log('Properties updated on server:', updatedProperties);
            }
        } catch (error) {
            console.error('Error updating properties:', error);
            // Revert local state on failure
            setProperties((prevProperties) => ({
                ...prevProperties,
                [currentEdit.category]: prevProperties[currentEdit.category].map((item) =>
                    item === trimmedValue ? currentEdit.oldValue : item
                ),
            }));
            alert('An unexpected error occurred.');
        } finally {
            setOperationLoading(false); // End operation loading
        }
    };

    // Handler to cancel editing
    const handleCancelEdit = () => {
        setIsEditing(false);
        setCurrentEdit({ category: '', oldValue: '', newValue: '' });
    };

    // Render logic
    if (isInitialLoading) {
        return <div>Loading properties...</div>; // Initial loading indicator
    }

    if (isError) {
        return <div>Error fetching properties: {error.message}</div>; // Error display
    }

    return (
        <div className="add-properties-container slide-in">
            <div className='add-product-h1-container'>
                <div></div>
                <h1 className="fade-in">Manage Product Properties</h1>
                <Link to="/add-product" className="return-link">
                    Back to Add Product
                </Link>
            </div>

            {/* Tab Navigation */}
            <div className="tabs">
                {propertyCategories.map((category) => (
                    <button
                        type="button" // Explicitly define type
                        key={category}
                        className={`tab-button ${activeTab === category ? 'active' : ''}`}
                        onClick={() => setActiveTab(category)}
                        disabled={operationLoading} // Disable tabs during operations
                    >
                        {category.charAt(0).toUpperCase() + category.slice(1)}
                    </button>
                ))}
            </div>

            {/* Active Tab Content */}
            <div className="tab-content">
                <h2>{activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}</h2>
                {/* Add New Property */}
                <div className="add-new-property">
                    <input
                        type="text"
                        placeholder={`Add new ${activeTab.slice(0, -1)}`}
                        value={newProperty}
                        onChange={(e) => setNewProperty(e.target.value)}
                        className="new-property-input"
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                                e.preventDefault(); // Prevent default behavior
                                handleAddProperty(activeTab);
                            }
                        }}
                        disabled={operationLoading} // Disable input during operations
                    />
                    <button
                        type="button"
                        className="add-btn"
                        onClick={() => handleAddProperty(activeTab)}
                        disabled={operationLoading} // Disable button during operations
                    >
                        <FaPlus /> {operationLoading ? 'Adding...' : 'Add'}
                    </button>
                </div>

                {/* List of Properties */}
                <ul className="property-list">
                    {properties[activeTab] && properties[activeTab].map((property, index) => (
                        <li key={index} className="property-item">
                            {isEditing && currentEdit.category === activeTab && currentEdit.oldValue === property ? (
                                <div className='add-properties-edit-container'>
                                    <input
                                        type="text"
                                        value={currentEdit.newValue}
                                        onChange={(e) => setCurrentEdit({ ...currentEdit, newValue: e.target.value })}
                                        className="edit-input"
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter') {
                                                e.preventDefault(); // Prevent form submission
                                                handleSaveEdit();
                                            }
                                        }}
                                        disabled={operationLoading} // Disable input during operations
                                    />
                                    <div className='add-properties-save-cancel-btn-container'>
                                        <button
                                            type="button"
                                            className="save-btn"
                                            onClick={handleSaveEdit}
                                            disabled={operationLoading} // Disable button during operations
                                        >
                                            Save
                                        </button>
                                        <button
                                            type="button"
                                            className="cancel-btn"
                                            onClick={handleCancelEdit}
                                            disabled={operationLoading} // Disable button during operations
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <>
                                    <span>{property}</span>
                                    <div className="action-buttons">
                                        <button
                                            type="button"
                                            className="edit-btn"
                                            onClick={() => handleEditInitiate(activeTab, property)}
                                            disabled={operationLoading} // Disable button during operations
                                        >
                                            <FaEdit />
                                        </button>
                                        <button
                                            type="button"
                                            className="delete-btn"
                                            onClick={() => handleDeleteProperty(activeTab, property)}
                                            disabled={operationLoading} // Disable button during operations
                                        >
                                            <FaTrash />
                                        </button>
                                    </div>
                                </>
                            )}
                        </li>
                    ))}
                    {properties[activeTab] && properties[activeTab].length === 0 && (
                        <li>No {activeTab} added yet.</li>
                    )}
                </ul>
            </div>
        </div>
    );
}

export default AddProperties;