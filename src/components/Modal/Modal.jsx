// Modal.jsx

import { useState } from "react";
import "./Modal.css";
import "../../animations/fade.css"

const Modal = ({ children, onClose, contentState }) => {
    const [isClosing, setIsClosing] = useState(false);

    const handleClose = () => {
        setIsClosing(true);
        setTimeout(() => {
            onClose(); // Trigger the actual close after the animation
        }, 400); // Match the duration of the animation
    };

    return (
        <div className={`modal-overlay ${isClosing ? "fade-out" : "fade-in"}`}>
            <div
                className={`modal-container`}
            >
                <button className="modal-close-button" onClick={handleClose}>
                    &times;
                </button>
                <div className="modal-content">{children}</div>
            </div>
        </div>
    );
};

export default Modal;