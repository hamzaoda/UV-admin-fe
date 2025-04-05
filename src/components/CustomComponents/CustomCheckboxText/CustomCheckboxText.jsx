// CustomCheckboxText.jsx
import React from 'react';
import PropTypes from 'prop-types';
import './CustomCheckboxText.css'; // You'll need to create this CSS file

const CustomCheckboxText = React.memo(function CustomCheckboxText({
    id,
    name,
    value,
    checked = false,
    onChange,
    label = '',
    disabled = false,
}) {
    return (
        <div className={`checkbox-wrapper-16 ${disabled ? 'disabled' : ''}`}>
            <input
                id={id}
                name={name}
                type="checkbox" // Changed type to checkbox
                value={value}
                checked={checked}
                onChange={onChange}
                disabled={disabled}
                aria-checked={checked}
                aria-labelledby={`${id}-label`}
            />
            <label htmlFor={id} id={`${id}-label`}>
                {label}
            </label>
        </div>
    );
});

CustomCheckboxText.propTypes = {
    id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    value: PropTypes.string.isRequired,
    checked: PropTypes.bool,
    onChange: PropTypes.func.isRequired,
    label: PropTypes.string,
    disabled: PropTypes.bool,
};

export default CustomCheckboxText;