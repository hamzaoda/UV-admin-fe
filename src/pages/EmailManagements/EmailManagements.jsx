import  { useState, useEffect } from 'react';
import './EmailManagements.css';
import useApi from '../../hooks/useApi'; // Ensure the path is correct

function EmailManagements() {
  const [mode, setMode] = useState('view'); // Modes: 'view' or 'edit'
  const [useMockData, setUseMockData] = useState(false); // Set to false to fetch real data
  const [formData, setFormData] = useState({
    template: 'welcome',
    subject: '',
    body: '',
  });

  const { callApi, isLoading, isError, error } = useApi(); // Destructure methods from useApi

  // Fetch existing email data when component mounts
  useEffect(() => {
    const fetchEmailData = async () => {
      if (!useMockData) {
        try {
          const response = await callApi({
            url: '/cms/emails-list/',
            method: 'GET',
            successMessage: 'Email data fetched successfully!',
            errorMessage: 'Error fetching email data.',
          });

          if (response.isSuccess && response.data) {
            setFormData({
              template: response.data[0].type || 'welcome', // Ensure 'type' aligns with 'template'
              subject: response.data[0].subject || '',
              body: response.data[0].body || '',
            });
          } else {
            console.error('API Error:', response.message);
            // Initialize with default values if API response is not successful
            setFormData({
              template: 'welcome',
              subject: '',
              body: '',
            });
          }
        } catch (err) {
          console.error('Fetch Email Data Error:', err);
          // Initialize with default values in case of an error
          setFormData({
            template: 'welcome',
            subject: '',
            body: '',
          });
        }
      }
    };

    fetchEmailData();
  }, [callApi, useMockData]);

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  // Handle Edit button click
  const handleEditClick = () => {
    setMode('edit');
  };

  // Handle Save button click
  const handleSaveClick = async () => {
    // Construct data object as per requirements
    const dataObject = {
      type: 'welcome', // Fixed as per instructions
      subject: formData.subject,
      body: formData.body,
    };
    console.log('Saving Data:', dataObject);

    try {
      const response = await callApi({
        url: '/cms/modify-email', // Ensure this endpoint is correct and includes leading '/'
        method: 'POST', // Use appropriate HTTP method (POST/PUT)
        dataReq: dataObject,
        successMessage: 'Email settings updated successfully!',
        errorMessage: 'Error updating email settings.',
      });
      console.log('API Response:', response);

      if (response.isSuccess) {
        console.log('Email settings updated successfully');
        // Optionally, you can fetch the updated data again or notify the user
      } else {
        console.error('API Error:', response.message);
        // Optionally handle API errors here
      }
      setMode('view'); // Switch back to view mode after successful save

    } catch (err) {
      console.error('Save Email Data Error:', err);
      // Optionally handle save errors here
    }
  };

  // Handle Cancel button click
  const handleCancelClick = () => {
    // Initialize with default values or refetch from API
    setMode('view'); // Switch back to view mode
  };

  return (
    <div className="email-managements-container section-container">
      <h1>Email Management</h1>

      {isLoading ? (
        <p>Loading...</p>
      ) : (
        <form>
          <div className="d-flex">
            <div className="form-group">
              <label htmlFor="template">Template</label>
              <select
                name="template"
                value={formData.template}
                onChange={handleChange}
                disabled={mode === 'edit'} // Disable in view mode
              >
                <option value="welcome">Welcome</option> {/* Only 'welcome' option */}
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="subject">Subject</label>
              <input
                type="text"
                name="subject"
                value={formData.subject}
                onChange={handleChange}
                disabled={mode === 'view'} // Disable in view mode
                required // Assuming subject is required
              />
            </div>
          </div>
          <div className="form-group">
            <label htmlFor="body">Body</label>
            <textarea
              name="body"
              value={formData.body}
              onChange={handleChange}
              disabled={mode === 'view'} // Disable in view mode
              required // Assuming body is required
            />
          </div>

          <div className="button-group">
            {mode === 'view' ? (
              <button type="button" onClick={handleEditClick} className="button-edit">
                Edit
              </button>
            ) : (
              <div className="d-flex">
                <button type="button" onClick={handleSaveClick} className="">
                  Save
                </button>
                <button type="button" onClick={handleCancelClick} className="button-danger">
                  Cancel
                </button>
              </div>
            )}
          </div>
        </form>
      )}

      {/* Display error message if there is an error */}
      {isError && (
        <p className="error-message">
          Error: {error?.message || 'An unexpected error occurred. Please try again later.'}
        </p>
      )}
    </div>
  );
}

export default EmailManagements;