// CustomRadio.jsx
import React from 'react';
import PropTypes from 'prop-types';
import './CustomRadio.css';

const CustomRadio = React.memo(function CustomRadio({
    id,
    name,
    value,
    checked = false,
    onChange,
    label = '',
    disabled = false,
}) {
    return (
        <div className={`radio-wrapper-16 ${disabled ? 'disabled' : ''}`}>
            <input
                id={id}
                name={name}
                type="radio"
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

CustomRadio.propTypes = {
    id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    value: PropTypes.string.isRequired,
    checked: PropTypes.bool,
    onChange: PropTypes.func.isRequired,
    label: PropTypes.string,
    disabled: PropTypes.bool,
};

export default CustomRadio;