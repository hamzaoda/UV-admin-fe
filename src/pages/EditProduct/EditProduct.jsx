// src/pages/EditProduct/EditProduct.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import './EditProduct.css';
import CustomCheckbox from '../../components/CustomComponents/CustomCheckbox/CustomCheckbox';
import useApi from '../../hooks/useApi';
import { FaSpinner } from 'react-icons/fa';
import { useDispatch, useSelector } from 'react-redux';
import {
    updateProductStart,
    updateProductSuccess,
    updateProductFailure,
    clearProduct,
} from '../../redux/editProductSlice';

const initialErrors = {
    productName: '',
    description: '',
    price: '',
    sale: '',
    properties: '',
    tags: '',
    combination: '',
    images: '',
    videos: '',
};

function EditProduct() {
    const { productId } = useParams();
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { product: initialProduct, loading, error: reduxError } = useSelector((state) => state.editProduct);

    // --- State Variables ---
    const [productName, setProductName] = useState('');
    const [description, setDescription] = useState('');
    const [price, setPrice] = useState('');
    const [sale, setSale] = useState('');
    const [images, setImages] = useState([]);
    const [videos, setVideos] = useState([]);
    const [mainImage, setMainImage] = useState(null);
    const [properties, setProperties] = useState({ sizes: [], colors: [], tags: [] });
    const [isPropertiesLoading, setIsPropertiesLoading] = useState(true);
    const [propertiesError, setPropertiesError] = useState(null);
    const [combinations, setCombinations] = useState([]);
    const [currentColor, setCurrentColor] = useState('');
    const [currentSize, setCurrentSize] = useState('');
    const [currentQuantity, setCurrentQuantity] = useState('');
    const [errors, setErrors] = useState(initialErrors);
    const [selectedTags, setSelectedTags] = useState([]);

    const { callApi, isLoading: isSubmitting, isError: isSubmissionError, error: submissionError } = useApi();

    // --- Fetch Properties ---
    useEffect(() => {
        const fetchProperties = async () => {
            setIsPropertiesLoading(true);
            try {
                const response = await callApi({
                    url: '/properties/list',
                    method: 'GET',
                });

                if (response.isSuccess && response.data) {
                    setProperties(response.data);
                } else {
                    console.error('API Error fetching properties:', response.message);
                    setPropertiesError(response.message || 'Failed to fetch properties.');
                }
            } catch (error) {
                console.error('Error fetching properties:', error);
                setPropertiesError('An unexpected error occurred while fetching properties.');
            } finally {
                setIsPropertiesLoading(false);
            }
        };

        fetchProperties();
    }, [callApi]);

    // --- Populate Form with Product Data from Redux ---
    useEffect(() => {
        if (initialProduct) {
            setProductName(initialProduct.name || '');
            setDescription(initialProduct.description || '');
            setPrice(initialProduct.price?.toString() || '');
            setSale(initialProduct.sale?.toString() || '');
            setImages(initialProduct.images?.list?.map(img => ({ ...img, url: img.url, file: { name: img.key, type: img.contentType, size: img.sizeInMegaByte * 1024 * 1024 } })) || []);
            setVideos(initialProduct.videos?.list?.map(vid => ({ ...vid, url: vid.url, file: { name: vid.key, type: vid.contentType, size: vid.sizeInMegaByte * 1024 * 1024 } })) || []);
            setMainImage(initialProduct.images?.mainImage !== undefined ? initialProduct.images.mainImage : (initialProduct.images?.list?.length > 0 ? 0 : null));
            setSelectedTags(initialProduct.tags || []);

            const initialCombinations = [];
            initialProduct.properties?.forEach(prop => {
                prop.sizes.forEach(size => {
                    initialCombinations.push({ color: prop.color, size: size.size, quantity: size.quantity });
                });
            });
            setCombinations(initialCombinations);
        }
        return () => dispatch(clearProduct()); // Cleanup on unmount
    }, [initialProduct, dispatch]);

    // --- Helper Functions ---
    const clearForm = () => {
        setProductName('');
        setDescription('');
        setPrice('');
        setSale('');
        setImages([]);
        setVideos([]);
        setCombinations([]);
        setCurrentColor('');
        setCurrentSize('');
        setCurrentQuantity('');
        setSelectedTags([]);
        setMainImage(null);
        setErrors(initialErrors);
    };

    const scrollToFirstError = () => {
        const firstErrorKey = Object.keys(errors).find(key => errors[key]);
        if (firstErrorKey) {
            const errorElement = document.getElementById(firstErrorKey);
            errorElement?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    };

    // --- Validate Form ---
    const validateForm = useCallback(() => {
        const newErrors = { ...initialErrors };
        let isValid = true;

        if (!productName.trim()) {
            newErrors.productName = 'Product name is required.';
            isValid = false;
        }

        if (!description.trim()) {
            newErrors.description = 'Description is required.';
            isValid = false;
        }

        if (!price || parseFloat(price) <= 0) {
            newErrors.price = 'Valid price is required.';
            isValid = false;
        }

        const saleValue = parseFloat(sale);
        if (sale && (isNaN(saleValue) || saleValue < 0 || saleValue > 100)) {
            newErrors.sale = 'Sale must be between 0% and 100%.';
            isValid = false;
        }

        if (combinations.length === 0) {
            newErrors.combination = 'At least one color-size-quantity combination is required.';
            isValid = false;
        } else {
            combinations.forEach((combination, index) => {
                if (!combination.color) {
                    newErrors.combination = `Color is required for combination ${index + 1}.`;
                    isValid = false;
                }
                if (!combination.size) {
                    newErrors.combination = `Size is required for combination ${index + 1}.`;
                    isValid = false;
                }
                if (combination.quantity === '' || isNaN(combination.quantity) || combination.quantity < 0) {
                    newErrors.combination = `Valid quantity is required for combination ${index + 1}.`;
                    isValid = false;
                }
            });
        }

        if (images.length === 0) {
            newErrors.images = 'At least one image is required.';
            isValid = false;
        }

        if (selectedTags.length === 0) {
            newErrors.tags = 'At least one tag must be selected.';
            isValid = false;
        }

        setErrors(newErrors);
        return isValid;
    }, [productName, description, price, sale, combinations, images, selectedTags]);

    // --- Handle Form Submission ---
    const handleSubmit = async (e) => {
        e.preventDefault();
        const isFormValid = validateForm();
        if (!isFormValid) {
            scrollToFirstError();
            return;
        }

        const transformedProperties = combinations.reduce((acc, comb) => {
            acc[comb.color] = acc[comb.color] || { color: comb.color, sizes: [] };
            acc[comb.color].sizes.push({ size: comb.size, quantity: parseInt(comb.quantity, 10) });
            return acc;
        }, {});

        const transformedImages = {
            list: images.map(img => ({
                contentType: img.file.type,
                key: img.file.name,
                url: img.url,
                sizeInMegaByte: parseFloat((img.file.size / (1024 * 1024)).toFixed(2)),
            })),
            mainImage: mainImage !== null ? mainImage : 0,
        };

        const transformedVideos = {
            list: videos.map(video => ({
                contentType: video.file.type,
                key: video.file.name,
                url: video.url,
                sizeInMegaByte: parseFloat((video.file.size / (1024 * 1024)).toFixed(2)),
            })),
            mainVideo: videos.length > 0 ? 0 : null,
        };

        const payload = {
            id: initialProduct._id,
            name: productName.trim(),
            description: description.trim(),
            price: parseFloat(price),
            sale: sale ? parseFloat(sale) : 0,
            properties: Object.values(transformedProperties),
            tags: selectedTags,
            images: transformedImages,
            videos: transformedVideos,
        };

        console.log('Payload to send for update:', payload);
        dispatch(updateProductStart());

        try {
            const response = await callApi({
                url: '/products/update',
                method: 'PUT',
                dataReq: payload,
            });

            if (response.isSuccess) {
                dispatch(updateProductSuccess(response.data));
                alert('Product updated successfully!');
                navigate('/product-managements');
            } else {
                console.error('API Error updating product:', response.message);
                dispatch(updateProductFailure(response.message || 'Unknown error'));
                alert(`Failed to update product: ${response.message || 'Unknown error'}`);
            }
        } catch (error) {
            console.error('Error updating product:', error);
            dispatch(updateProductFailure('An unexpected error occurred during product update.'));
            alert('An unexpected error occurred during product update.');
        }
    };

    // --- Handle Image Upload ---
    const handleImageUpload = (e) => {
        const files = Array.from(e.target.files);
        const maxImages = 10;
        const availableSlots = maxImages - images.length;

        if (files.length > availableSlots) {
            setErrors(prevErrors => ({ ...prevErrors, images: `You can only upload a maximum of ${maxImages} images.` }));
            return;
        }

        const newFiles = [];
        const seenFileSignatures = new Set(images.map(img => `${img.file.name}-${img.file.size}-${img.file.type}`));

        files.forEach(file => {
            const fileSignature = `${file.name}-${file.size}-${file.type}`;
            if (seenFileSignatures.has(fileSignature)) {
                setErrors(prevErrors => ({ ...prevErrors, images: 'Duplicate images detected.' }));
            } else {
                newFiles.push(file);
                seenFileSignatures.add(fileSignature);
            }
        });

        if (newFiles.length > 0) {
            const newImagePreviews = newFiles.map(file => ({ file, url: URL.createObjectURL(file) }));
            setImages(prevImages => {
                const updatedImages = [...prevImages, ...newImagePreviews];
                if (updatedImages.length > 0 && mainImage === null) {
                    setMainImage(0);
                }
                return updatedImages;
            });
            setErrors(prevErrors => ({ ...prevErrors, images: '' })); // Clear error if new unique files are added
        }

        e.target.value = null; // Allow re-uploading the same file
    };

    // --- Handle Video Upload ---
    const handleVideoUpload = (e) => {
        const files = Array.from(e.target.files);
        const maxVideos = 3;

        if (videos.length + files.length > maxVideos) {
            setErrors(prevErrors => ({ ...prevErrors, videos: `You can only upload a maximum of ${maxVideos} videos.` }));
            return;
        }

        const newFiles = [];
        const seenFileSignatures = new Set(videos.map(vid => `${vid.file.name}-${vid.file.size}-${vid.file.type}`));

        files.forEach(file => {
            const fileSignature = `${file.name}-${file.size}-${file.type}`;
            if (seenFileSignatures.has(fileSignature)) {
                setErrors(prevErrors => ({ ...prevErrors, videos: 'Duplicate videos detected.' }));
            } else {
                newFiles.push(file);
                seenFileSignatures.add(fileSignature);
            }
        });

        if (newFiles.length > 0) {
            const newVideoPreviews = newFiles.map(file => ({ file, url: URL.createObjectURL(file) }));
            setVideos(prevVideos => [...prevVideos, ...newVideoPreviews]);
            setErrors(prevErrors => ({ ...prevErrors, videos: '' })); // Clear error if new unique files are added
        } else if (files.length > 0 && newFiles.length === 0) {
            // If no new files were added due to duplicates, keep the duplicate error message.
        }

        e.target.value = null; // Allow re-uploading the same file
    };

    // --- Handle Remove Image ---
    const handleRemoveImage = (index) => {
        const imageToRemove = images[index];
        if (imageToRemove && imageToRemove.url) {
            URL.revokeObjectURL(imageToRemove.url); // Clean up object URL
        }

        const newImages = images.filter((_, i) => i !== index);
        setImages(newImages);

        if (mainImage === index) {
            setMainImage(newImages.length > 0 ? 0 : null);
        } else if (mainImage > index) {
            setMainImage(mainImage - 1);
        }
        if (newImages.length === 0) {
            setErrors(prevErrors => ({ ...prevErrors, images: 'At least one image is required.' }));
        }
    };

    // --- Handle Remove Video ---
    const handleRemoveVideo = (index) => {
        const videoToRemove = videos[index];
        if (videoToRemove && videoToRemove.url) {
            URL.revokeObjectURL(videoToRemove.url);
        }
        const newVideos = videos.filter((_, i) => i !== index);
        setVideos(newVideos);
        if (newVideos.length === 0) {
            setErrors(prevErrors => ({ ...prevErrors, videos: '' }));
        }
    };

    // --- Handle Add Combination ---
    const handleAddCombination = () => {
        let hasErrors = false;

        if (!currentColor) {
            hasErrors = true;
        }
        if (!currentSize) {
            hasErrors = true;
        }
        if (!currentQuantity) {
            hasErrors = true;
        }

        if (hasErrors) {
            setErrors(prevErrors => ({ ...prevErrors, combination: 'Please fill in all combination details.' }));
            return;
        }

        const isDuplicate = combinations.some(comb => comb.color === currentColor && comb.size === currentSize);
        if (isDuplicate) {
            setErrors(prevErrors => ({ ...prevErrors, combination: 'This color-size combination already exists.' }));
            return;
        }

        setCombinations(prevCombinations => [
            ...prevCombinations,
            { color: currentColor, size: currentSize, quantity: parseInt(currentQuantity, 10) },
        ]);
        setCurrentColor('');
        setCurrentSize('');
        setCurrentQuantity('');
        setErrors(prevErrors => ({ ...prevErrors, combination: '' }));
    };

    // --- Handle Remove Combination ---
    const handleRemoveCombination = (index) => {
        setCombinations(combinations.filter((_, i) => i !== index));
        if (combinations.length === 0) {
            setErrors(prevErrors => ({ ...prevErrors, combination: 'At least one color-size-quantity combination is required.' }));
        }
    };

    // --- Handle Select Main Image ---
    const handleSelectMainImage = (index) => {
        setMainImage(index);
    };

    // --- Render ---
    if (isPropertiesLoading || loading || !initialProduct) {
        return (
            <div className='add-product-main-container slide-in'>
                <div className='add-product-h1-container'>
                    <div></div>
                    <h1 className="fade-in">Edit Product</h1>
                    <Link to="/product-managements" className="return-link">
                        Back to Product Managements
                    </Link>
                </div>
                <div className="loading-container fade-in">
                    <FaSpinner className="spinner" /> Loading...
                </div>
            </div>
        );
    }

    if (propertiesError || reduxError) {
        return (
            <div className='add-product-main-container slide-in'>
                <div className='add-product-h1-container'>
                    <div></div>
                    <h1 className="fade-in">Edit Product</h1>
                    <Link to="/product-managements" className="return-link">
                        Back to Product Managements
                    </Link>
                </div>
                <div className="error-container fade-in">
                    <p>Error: {propertiesError || reduxError}</p>
                </div>
            </div>
        );
    }

    return (
        <div className='add-product-main-container slide-in'>
            <div className='add-product-h1-container'>
                <div></div>
                <h1 className="fade-in">Edit Product</h1>
                <Link to="/product-managements" className="return-link">
                    Back to Product Managements
                </Link>
            </div>
            <form className='add-product-form' onSubmit={handleSubmit}>
                {/* Product Details Section */}
                <section className='form-section fade-in'>
                    <h2 className="fade-in">Product Details</h2>
                    <div className='form-group'>
                        <label htmlFor="productName">
                            Name<span className="required">*</span>
                        </label>
                        <input
                            type="text"
                            id="productName"
                            value={productName}
                            onChange={(e) => setProductName(e.target.value)}
                            className={`w-100 ${errors.productName ? 'input-error' : ''}`}
                            aria-describedby="productNameError"
                        />
                        {errors.productName && <span className="error-message fade-in" id="productNameError">{errors.productName}</span>}
                    </div>

                    <div className='form-group'>
                        <label htmlFor="description">
                            Description<span className="required">*</span>
                        </label>
                        <textarea
                            id="description"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            className={`w-100 ${errors.description ? 'input-error' : ''}`}
                            aria-describedby="descriptionError"
                        />
                        {errors.description && <span className="error-message fade-in" id="descriptionError">{errors.description}</span>}
                    </div>
                    <div className='price-form fade-in'>
                        <div className='d-flex'>
                            <div className='form-group flex-half'>
                                <label htmlFor="price">
                                    Price ($)<span className="required">*</span>
                                </label>
                                <input
                                    type="number"
                                    id="price"
                                    value={price}
                                    onChange={(e) => setPrice(e.target.value)}
                                    min="0"
                                    step="0.01"
                                    className={`${errors.price ? 'input-error' : ''}`}
                                    aria-describedby="priceError"
                                />
                            </div>
                            <div className='form-group flex-half'>
                                <label htmlFor="sale">Sale (%)</label>
                                <input
                                    type="number"
                                    id="sale"
                                    value={sale}
                                    onChange={(e) => setSale(e.target.value)}
                                    min="0"
                                    max="100"
                                    step="0.01"
                                    className={`${errors.sale ? 'input-error' : ''}`}
                                    aria-describedby="saleError"
                                />
                            </div>
                        </div>
                        {errors.price && <span className="error-message fade-in" id="priceError">{errors.price}</span>}
                        {errors.sale && <span className="error-message fade-in" id="saleError">{errors.sale}</span>}
                    </div>
                </section>

                {/* Media Uploads Section */}
                <section className='form-section fade-in'>
                    <h2 className="fade-in">Media Uploads</h2>
                    <div className="media-items-container">
                        {/* Image Upload */}
                        <div className="media-item slide-in">
                            <div className='form-group'>
                                <label htmlFor="images">
                                    Main Image(s) <span className="required">*</span>
                                </label>
                                <input
                                    type="file"
                                    id="images"
                                    accept="image/*"
                                    multiple
                                    onChange={handleImageUpload}
                                    disabled={images.length >= 10}
                                    className={`${errors.images ? 'input-error' : ''}`}
                                    aria-describedby="imagesError"
                                />
                                {images.length > 0 && <small className="fade-in">{`${images.length}/10 images uploaded`}</small>}
                                {errors.images && <span className="error-message fade-in" id="imagesError">{errors.images}</span>}
                            </div>
                            <div className="uploaded-files fade-in">
                                {images.map((image, idx) => (
                                    <div
                                        key={idx}
                                        className="uploaded-file slide-in"
                                        onClick={() => handleSelectMainImage(idx)}
                                        style={{ cursor: 'pointer', border: mainImage === idx ? '2px solid #007bff' : '1px solid #ddd' }}
                                        aria-label={`Select image ${idx + 1} as main image`}
                                        tabIndex={0}
                                        onKeyPress={(e) => { if (e.key === 'Enter') handleSelectMainImage(idx); }}
                                    >
                                        <img src={image.url} alt={`Upload Preview ${idx + 1}`} className="preview-image" />
                                        {mainImage === idx && <div className="main-image-label fade-in">Main Image Selected</div>}
                                        <button
                                            className='img-x-btn'
                                            type="button"
                                            onClick={(e) => { e.stopPropagation(); handleRemoveImage(idx); }}
                                            aria-label={`Remove image ${idx + 1}`}
                                        >
                                            ×
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Video Upload */}
                        <div className="media-item slide-in">
                            <div className='form-group'>
                                <label htmlFor="videos">Video(s)</label>
                                <input
                                    type="file"
                                    id="videos"
                                    accept="video/*"
                                    multiple
                                    onChange={handleVideoUpload}
                                    disabled={videos.length >= 3}
                                    className={`${errors.videos ? 'input-error' : ''}`}
                                    aria-describedby="videosError"
                                />
                                {videos.length > 0 && <small className="fade-in">{`${videos.length}/3 videos uploaded`}</small>}
                                {errors.videos && <span className="error-message fade-in" id="videosError">{errors.videos}</span>}
                            </div>
                            <div className="uploaded-files fade-in">
                                {videos.map((video, idx) => (
                                    <div key={idx} className="uploaded-file slide-in">
                                        <video width="100" height="100" controls>
                                            <source src={video.url} type={video.file.type} />
                                            Your browser does not support the video tag.
                                        </video>
                                        <button
                                            type="button"
                                            onClick={() => handleRemoveVideo(idx)}
                                            className="img-x-btn fade-in"
                                            aria-label={`Remove video ${idx + 1}`}
                                        >
                                            ×
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </section>

                {/* Product Properties Section */}
                <section className='form-section fade-in'>
                    <h2 className="fade-in">Product Properties</h2>
                    <div className="property-form">
                        <div className='form-group'>
                            <label htmlFor="currentSize">
                                Size<span className="required">*</span>
                            </label>
                            <select
                                id="currentSize"
                                value={currentSize}
                                onChange={(e) => setCurrentSize(e.target.value)}
                                className={`property-input ${errors.combination ? 'input-error' : ''}`}
                                aria-describedby="currentSizeError"
                            >
                                <option value="">Select Size</option>
                                {properties.sizes.map((size, idx) => (
                                    <option
                                        key={idx}
                                        value={size}
                                    >
                                        {size}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className='form-group'>
                            <label htmlFor="currentQuantity">
                                Quantity<span className="required">*</span>
                            </label>
                            <input
                                type="number"
                                id="currentQuantity"
                                placeholder="Quantity"
                                value={currentQuantity}
                                onChange={(e) => setCurrentQuantity(e.target.value)}
                                min="0"
                                className={`property-input ${errors.combination ? 'input-error' : ''}`}
                                aria-describedby="currentQuantityError"
                            />
                        </div>

                        <button className='add-property-btn fade-in' type="button" onClick={handleAddCombination}>
                            + Add
                        </button>
                        {errors.combination && <span className="error-message fade-in">{errors.combination}</span>}
                    </div>

                    {/* Display combinations */}
                    {combinations.length > 0 && (
                        <div className="properties-submitted fade-in">
                            <table className="combinations-table slide-in">
                                <thead>
                                    <tr>
                                        <th>Size</th>
                                        <th>Quantity</th>
                                        <th>Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {combinations.map((combination, idx) => (
                                        <tr key={idx} className="fade-in">
                                            <td>{combination.size}</td>
                                            <td>{combination.quantity}</td>
                                            <td>
                                                <button
                                                    type="button"
                                                    onClick={() => handleRemoveCombination(idx)}
                                                    className='x-btn fade-in'
                                                    aria-label={`Remove combination  - ${combination.size}`}
                                                >
                                                    ×
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </section>

                {/* Tags Section */}
                <section className='form-section fade-in'>
                    <h2 className="fade-in">Tags</h2>
                    <div className="flex-form-group">
                        {properties.tags.map((tag, idx) => (
                            <CustomCheckbox
                                key={idx}
                                id={`tag-${idx}`}
                                name="tags"
                                value={tag}
                                checked={selectedTags.includes(tag)}
                                onChange={(e) => {
                                    setSelectedTags(prevTags =>
                                        e.target.checked ? [...prevTags, tag] : prevTags.filter(t => t !== tag)
                                    );
                                }}
                                label={tag}
                            />
                        ))}
                    </div>
                    {errors.tags && <span className="error-message fade-in">{errors.tags}</span>}
                </section>

                {/* Submit Button */}
                <div className="submit-section fade-in">
                    <button type="submit" className="submit-button slide-in"
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? <FaSpinner className="spinner" /> : 'Update Product'}
                    </button>
                </div>

                {/* Display API Error if any */}
                {isSubmissionError && (
                    <div className="api-error-message fade-in">
                        Error updating product: {submissionError || 'An unknown error occurred.'}
                    </div>
                )}
            </form>
        </div>
    );
}

export default EditProduct;