import './LoadingOverlay.css';

const LoadingOverlay = ({ isLoading }) => {
    if (!isLoading) return null;
    return (
        <div className="loading-overlay">
            <div className="spinner-container">
                <div className="spinner"></div>
            </div>
        </div>
    );
};

export default LoadingOverlay;