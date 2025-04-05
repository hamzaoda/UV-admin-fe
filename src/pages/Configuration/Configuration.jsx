// Configuration.js (React Component)
import { useState, useEffect } from 'react';
import useApi from '../../hooks/useApi'; // Import the hook
import CustomCheckbox from '../../components/CustomComponents/CustomCheckboxText/CustomCheckboxText'; // Import the custom checkbox
import './Configuration.css'; // Import the CSS file
import LoadingOverlay from '../../components/LoadingOverlay/LoadingOverlay'; // ADDED: Import LoadingOverlay

function Configuration() {
    const [lockWebsite, setLockWebsite] = useState(false);
    const [password, setPassword] = useState('');
    const { callApi, isLoading } = useApi();
    const [registerEmail, setRegisterEmail] = useState(false); // NEW: State for register email
    const [enterPassword, setEnterPassword] = useState(false); // NEW: State for enter password


    // Fetch initial configuration on component mount
    useEffect(() => {
        const fetchConfig = async () => {
            const response = await callApi({
                url: '/config',
                method: 'GET',
            });
            if (response && response.config) {
                setPassword(response.config.password);
                setLockWebsite(response.config.lockValue);
                setRegisterEmail(response.config.isRegisterEmail || false); // ADDED: Initialize registerEmail
                setEnterPassword(response.config.isPassword || false);     // ADDED: Initialize enterPassword
            }
        };
        fetchConfig();
    }, [callApi]); // Depend on callApi to ensure it's up-to-date


    const handleSubmit = async (event) => {
        event.preventDefault();
        if (lockWebsite && password.trim() === '') {
            return;
        }

        try {
            await callApi({
                url: '/config',
                method: 'POST',
                dataReq: { 
                    password, 
                    lockValue: lockWebsite, 
                    isRegisterEmail: registerEmail,
                    isPassword: enterPassword
                }, 
                successMessage: 'Configuration saved successfully!', // Pass success message
                errorMessage: 'Failed to save configuration.',      // Pass error message
            });

        } catch (apiError) {
            // Handle API errors (e.g., display a message to the user).  The 'error'
            //  state variable from useApi will also have this error.
            console.error('Error saving configuration:', apiError);
        }
    };

    return (
        <div className='configuration-container section-container'>
            <LoadingOverlay isLoading={isLoading} /> {/* ADDED: LoadingOverlay component */}
            <h1>Website Configuration</h1>
            <form onSubmit={handleSubmit}>
                <div className="form-group">
                    <CustomCheckbox
                        id="lock-website-checkbox"
                        label="Lock Website"
                        checked={lockWebsite}
                        onChange={(e) => setLockWebsite(e.target.checked)}
                    />
                </div>

                {lockWebsite && (
                    <>
                        <div className="form-group">
                            <CustomCheckbox
                                id="register-email-checkbox"
                                label="Register Email"
                                checked={registerEmail}
                                onChange={(e) => setRegisterEmail(e.target.checked)}
                            />
                        </div>
                        <div className="form-group">
                            <CustomCheckbox
                                id="enter-password-checkbox"
                                label="Enter Password"
                                checked={enterPassword}
                                onChange={(e) => setEnterPassword(e.target.checked)}
                            />
                        </div>
                    </>
                )}

                {lockWebsite && enterPassword && (
                    <div className="password-input-container">
                        <label htmlFor="password-input">Password:</label>
                        <input
                            id="password-input"
                            type="text"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Enter password to lock website"
                            className='w-100'
                        />
                    </div>
                )}
                <button
                    type="submit"
                    className="config-submit-button"
                    disabled={isLoading}
                >
                    {isLoading ? "Saving..." : "Save Configuration"}
                </button>
            </form>
        </div>
    );
}

export default Configuration;