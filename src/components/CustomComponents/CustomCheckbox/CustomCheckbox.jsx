// CustomCheckbox.jsx
import React from 'react';
import PropTypes from 'prop-types';
import './CustomCheckbox.css';

const CustomCheckbox = React.memo(function CustomCheckbox({
    id,
    name = '',
    value = '',
    checked = false,
    onChange,
    label = '',
    disabled = false,
}) {
    return (
        <div className={`checkbox-wrapper ${disabled ? 'disabled' : ''}`}>
            <input
                id={id}
                name={name}
                type="checkbox"
                className="custom-input-checkbox"
                value={value}
                checked={checked}
                onChange={onChange}
                disabled={disabled}
                aria-checked={checked}
                aria-labelledby={`${id}-label`}
            />
            <label htmlFor={id} id={`${id}-label`} className="checkbox-label">
                <span className="checkbox-custom">
                    <svg className="checkmark" viewBox="0 0 24 24" aria-hidden="true">
                        <path
                            className="checkmark-path"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M22.9 3.7l-15.2 16.6-6.6-7.1"
                        />
                    </svg>
                </span>
                {label && <span className="label-text">{label}</span>}
            </label>
        </div>
    );
});

CustomCheckbox.propTypes = {
    id: PropTypes.string.isRequired,
    name: PropTypes.string,
    value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    checked: PropTypes.bool,
    onChange: PropTypes.func.isRequired,
    label: PropTypes.string,
    disabled: PropTypes.bool,
};

export default CustomCheckbox;