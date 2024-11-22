// Validation functions

// Validates the username according to specified rules
export function validateUsername(username) {
    // Check if the input is a string
    if (typeof username !== 'string') return 'Username should be a type of text';
    
    // Trim whitespace and check if the username is empty
    if (username.trim() === '') return 'Username cannot be empty';
    
    // Check the length of the username
    if (username.length < 3) return 'Username should have a minimum length of 3';
    if (username.length > 30) return 'Username should have a maximum length of 30';
    
    // Check if the username is alphanumeric
    const alphanumericRegex = /^[a-zA-Z0-9]+$/;
    if (!alphanumericRegex.test(username)) return 'Username must be alphanumeric';
    
    return null;
}

// Validates the email according to specified rules
export function validateEmail(email) {
    // Check if the input is a string
    if (typeof email !== 'string') return 'Email should be a type of text';
    
    // Trim whitespace and check if the email is empty
    if (email.trim() === '') return 'Email cannot be empty';
    
    // Validate the email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) return 'Email must be a valid email';
    
    return null;
}

// Validates the password according to specified rules
export function validatePassword(password) {
    // Check if the input is a string
    if (typeof password !== 'string') return 'Password should be a type of text';
    
    // Check the length of the password
    if (password.length < 8) return 'Password should have a minimum length of 8';
    if (password.length > 40) return 'Password should have a maximum length of 40';
    
    // Validate the password complexity
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&.])[A-Za-z\d@$!%*?&.]{8,}$/;
    if (!passwordRegex.test(password)) {
        return 'Password must include at least one uppercase letter, one lowercase letter, one number, and one special character';
    }
    
    return null;
}