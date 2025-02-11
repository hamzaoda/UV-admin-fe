// Configuration.js (React Component)
import { useState, useEffect } from 'react';
import useApi from '../../hooks/useApi'; // Import the hook

function Configuration() {
    const [lockWebsite, setLockWebsite] = useState(false);
    const [password, setPassword] = useState('');
    const [formError, setFormError] = useState('');
    const [formSubmitted, setFormSubmitted] = useState(false);
    const [successMessage, setSuccessMessage] = useState(''); // Added for success message
    const { callApi, isLoading, isError, error, data } = useApi();


    // Fetch initial configuration on component mount
    useEffect(() => {
        const fetchConfig = async () => {
            try {
                const response = await callApi({
                    url: '/config',
                    method: 'GET',
                });
                if (response && response.config) {
                    setPassword(response.config.password);
                    setLockWebsite(response.config.lockValue);
                }
            } catch (fetchError) {
                //  Handle fetch errors (e.g., display a message to the user)
                console.error("Error fetching initial configuration:", fetchError);
                setFormError('Failed to load initial configuration.');
            }
        };
        fetchConfig();
    }, [callApi]); // Depend on callApi to ensure it's up-to-date


    const handleSubmit = async (event) => {
        event.preventDefault();
        setFormError('');
        setSuccessMessage(''); // Clear previous success messages
        setFormSubmitted(true);

        if (lockWebsite && password.trim() === '') {
            setFormError('Password is required when locking the website.');
            setFormSubmitted(false); // Allow resubmission
            return;
        }

        try {
            const response = await callApi({
                url: '/config',
                method: 'POST',
                dataReq: { password, lockValue: lockWebsite }, // Send lockValue
                successMessage: 'Configuration saved successfully!', // Pass success message
                errorMessage: 'Failed to save configuration.',      // Pass error message
            });

            if (response) {
                setSuccessMessage(response.message || 'Configuration saved successfully!'); // Use the server's message if available
            }
            // Reset form *after* successful save
            setTimeout(() => {
                setFormSubmitted(false);
            }, 3000);
        } catch (apiError) {
            // Handle API errors (e.g., display a message to the user).  The 'error'
            //  state variable from useApi will also have this error.
            console.error('Error saving configuration:', apiError);
            setFormError(apiError.data?.message || 'Failed to save configuration. Please try again.');  // Show server error message
            setFormSubmitted(false); // Allow resubmission on error
        }
    };

    return (
        <div className='configuration-container section-container'>
            <form onSubmit={handleSubmit}>
                <div>
                    <label>
                        <input
                            type="checkbox"
                            checked={lockWebsite}
                            onChange={(e) => setLockWebsite(e.target.checked)}
                        />
                        Lock Website?
                    </label>
                </div>

                <div>
                    <label>
                        Password:
                        <input
                            type="text"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            disabled={!lockWebsite}
                        />
                    </label>
                </div>
                {formError && <div style={{ color: 'red' }}>{formError}</div>}
                {successMessage && <div style={{ color: 'green' }}>{successMessage}</div>} {/* Display success message */}
                <button type="submit" disabled={isLoading || formSubmitted}>
                    {isLoading || formSubmitted ? "Saving..." : "Save Configuration"}
                </button>
            </form>
        </div>
    );
}

export default Configuration;