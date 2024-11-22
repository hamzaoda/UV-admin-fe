import React from 'react';
import './CustomCheckbox.css';

function CustomCheckbox({ id, name, value, checked, onChange }) {
    return (
        <div className="checkbox-wrapper-28">
            <input
                id={id}
                name={name}
                type="checkbox"
                className="promoted-input-checkbox"
                value={value}
                checked={checked}
                onChange={onChange}
            />
            <svg><use xlinkHref="#checkmark-28" /></svg>
            <label htmlFor={id}></label>
            <svg xmlns="http://www.w3.org/2000/svg" style={{ display: 'none' }}>
                <symbol id="checkmark-28" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeMiterlimit="10" fill="none" d="M22.9 3.7l-15.2 16.6-6.6-7.1">
                    </path>
                </symbol>
            </svg>
        </div>
    );
}

export default CustomCheckbox;