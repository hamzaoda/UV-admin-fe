// src/pages/ProductForm/ProductForm.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import './ProductForm.css';
import CustomCheckbox from '../../components/CustomComponents/CustomCheckbox/CustomCheckbox';
import useApi from '../../hooks/useApi';
import useApiWithFiles from '../../hooks/useApiWithFiles';
import { FaSpinner, FaEdit } from 'react-icons/fa';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css'; // Import the styles

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

// Define your limits here
const MAX_IMAGE_SIZE_MB = 5;
const MAX_VIDEO_SIZE_MB = 50;

function ProductForm({ isEditMode = false }) {

    const { productId } = useParams();

    const navigate = useNavigate();

    // --- State Variables ---
    const [productSku, setProductSku] = useState('');
    const [productName, setProductName] = useState('');
    const [description, setDescription] = useState('');
    const [price, setPrice] = useState('');
    const [sale, setSale] = useState('');
    const [finalPrice, setFinalPrice] = useState('');
    const [images, setImages] = useState([]);
    const [videos, setVideos] = useState([]);
    const [mainImage, setMainImage] = useState(null);
    const [properties, setProperties] = useState({ sizes: [], tags: [] });
    const [isPropertiesLoading, setIsPropertiesLoading] = useState(true);
    const [propertiesError, setPropertiesError] = useState(null);
    const [combinations, setCombinations] = useState([]);
    const [currentSize, setCurrentSize] = useState('');
    const [currentQuantity, setCurrentQuantity] = useState('');
    const [errors, setErrors] = useState(initialErrors);
    const [selectedTags, setSelectedTags] = useState([]);
    const [loading, setLoading] = useState(isEditMode); // Initialize loading based on edit mode
    const [editingCombinationIndex, setEditingCombinationIndex] = useState(null);
    const [isFormSubmitting, setIsFormSubmitting] = useState(false); // Add this line
    const [deletedImages, setDeletedImages] = useState([]); // Add deletedImages state
    const [deletedVideos, setDeletedVideos] = useState([]); // Add deletedVideos state
    const [isActive, setIsActive] = useState(true); // ADDED: State for isActive, default true


    const { callApi: callApiFiles } = useApiWithFiles();
    const { callApi: callApiGet, isLoading: isSubmitting, isError: isSubmissionError, error: submissionError } = useApi();

    // --- Calculate Final Price ---
    const calculateFinalPrice = useCallback(() => {
        const basePrice = parseFloat(price);
        const salePercentage = parseFloat(sale);

        if (isNaN(basePrice)) {
            setFinalPrice('');
            return;
        }

        if (isNaN(salePercentage)) {
            setFinalPrice(basePrice.toFixed(2));
            return;
        }

        const discountAmount = (salePercentage / 100) * basePrice;
        const calculatedFinalPrice = basePrice - discountAmount;
        setFinalPrice(calculatedFinalPrice.toFixed(2));
    }, [price, sale]);

    // --- Update Final Price when price changes ---
    useEffect(() => {
        calculateFinalPrice();
    }, [price, sale, calculateFinalPrice]);

    // --- Fetch Properties ---
    useEffect(() => {
        const fetchProperties = async () => {
            setIsPropertiesLoading(true);
            try {
                const response = await callApiGet({
                    url: '/properties/list',
                    method: 'GET',
                });

                if (response.isSuccess && response.data) {
                    const { sizes, tags } = response.data;
                    setProperties({ sizes, tags });
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
    }, [callApiGet]);

    // --- Fetch Product Data for Edit Mode ---
    useEffect(() => {
        // Only fetch product data if in edit mode and productId is available
        if (isEditMode && productId) {
            const fetchProduct = async () => {
                setLoading(true); // Set loading to true when fetching starts
                try {
                    const response = await callApiGet({
                        url: `/products/details/${productId}`,
                        method: 'GET',
                    });
                    if (response.isSuccess && response.data) {
                        const productData = response.data;
                        setProductSku(productData.productId || '');
                        setProductName(productData.name || '');
                        setDescription(
                            productData.description.replace(
                                /<p\b[^>]*>(\s*<br\s*\/?>\s*)<\/p>(?=\s*<(ul|ol))/gi,
                                ''
                            )
                        );
                        setPrice(productData.price?.toString() || '');
                        setSale(productData.sale?.toString() || '');
                        setSelectedTags(productData.tags || []);
                        setMainImage(productData.images?.mainImage !== undefined ? productData.images.mainImage : (productData.images?.list?.length > 0 ? 0 : null));
                        setIsActive(productData.isActive !== undefined ? productData.isActive : true); // ADDED: Set isActive from product data, default true if not present

                        const initialCombinations = [];
                        productData.properties?.forEach(prop => {
                            prop.sizes.forEach(size => {
                                initialCombinations.push({ size: size.size, quantity: size.quantity, color: prop.color }); // Assuming only one color for now
                            });
                        });
                        setCombinations(initialCombinations);

                        if (productData.images?.list) {
                            setImages(productData.images.list.map((img, index) => ({ ...img, url: img.url, key: img.key, tempKey: `existing-image-${index}` }))); // Added key here
                        }
                        if (productData.videos?.list) {
                            setVideos(productData.videos.list.map((vid, index) => ({ ...vid, url: vid.url, key: vid.key, tempKey: `existing-video-${index}` }))); // Added key here
                        }
                    } else {
                        console.error('API Error fetching product:', response.message);
                        alert(`Error fetching product: ${response.message}`);
                    }
                } catch (error) {
                    console.error('Error fetching product:', error);
                    alert('Failed to fetch product details.');
                } finally {
                    setLoading(false); // Set loading to false after fetching is complete (success or error)
                }
            };
            fetchProduct();

        }
    }, [isEditMode, productId, callApiGet]);

    // --- Helper Functions ---
    const clearForm = () => {
        setProductName('');
        setDescription('');
        setPrice('');
        setSale('');
        setImages([]);
        setVideos([]);
        setCombinations([]);
        setCurrentSize('');
        setCurrentQuantity('');
        setSelectedTags([]);
        setMainImage(null);
        setErrors(initialErrors);
        setDeletedImages([]); // Clear deleted images on form clear
        setDeletedVideos([]); // Clear deleted videos on form clear
        setIsActive(true); // ADDED: Reset isActive to default true
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

        if (!description.trim() || description === '<p><br></p>') {
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
            newErrors.combination = 'At least one size-quantity combination is required.';
            isValid = false;
        } else {
            combinations.forEach((combination, index) => {
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
        setIsFormSubmitting(true); // Set to true before making the API call

        const transformedProperties = Object.values(combinations.reduce((acc, comb) => {
            const color = "const"; // Assuming a constant color as per the provided payload
            acc[color] = acc[color] || { color: color, sizes: [] };
            acc[color].sizes.push({ size: comb.size, quantity: parseInt(comb.quantity, 10) });
            return acc;
        }, {}));

        const addPayload = {
            name: productName.trim(),
            description: description, // Send the HTML description
            price: parseFloat(price),
            sale: sale ? parseFloat(sale) : 0,
            properties: transformedProperties,
            tags: selectedTags,
            mainImage: mainImage,
            mainVideo: videos.length > 0 ? 0 : undefined,
            isActive: isActive, // ADDED: Include isActive in payload
        };

        const files = {
            images: images.filter(img => !img.tempKey || !img.tempKey.startsWith('existing-image')).map(img => img.file), // Only new images, send the File object
            video: videos.filter(vid => !vid.tempKey || !vid.tempKey.startsWith('existing-video')).map(vid => vid.file), // Only new videos, send the File object
        };

        try {
            let response;
            if (isEditMode) {
                const editPayload = {
                    id: productId,
                    name: productName.trim(),
                    description: description, // Send the HTML description
                    price: parseFloat(price),
                    sale: sale ? parseFloat(sale) : 0,
                    properties: transformedProperties,
                    tags: selectedTags,
                    mainImage: mainImage,
                    mainVideo: videos.length > 0 ? 0 : undefined,
                    deletedImages: deletedImages.length > 0 ? deletedImages : [],
                    deletedVideo: deletedVideos.length > 0 ? deletedVideos : [],   // Add deletedVideos
                    isActive: isActive, // ADDED: Include isActive in payload
                };
                response = await callApiFiles({
                    method: 'PUT',
                    url: `/products/update`,
                    dataReq: editPayload,
                    files: files
                });
            } else {
                response = await callApiFiles({
                    method: 'POST',
                    url: '/products/create',
                    dataReq: addPayload,
                    files: files,
                });
            }

            if (response.isSuccess) {
                clearForm();
                navigate('/product-managements');
            } else {
                console.error(`API Error ${isEditMode ? 'updating' : 'adding'} product:`, response.message);
                alert(`Failed to ${isEditMode ? 'update' : 'add'} product: ${response.message || 'Unknown error'}`);
            }
        } catch (error) {
            console.error(`Error ${isEditMode ? 'updating' : 'adding'} product:`, error);
            alert(`An unexpected error occurred during product ${isEditMode ? 'update' : 'submission'}.`);
        } finally {
            setIsFormSubmitting(false); // Set back to false after the API call completes (success or fail)
        }
    };

    // --- Handle Image Upload ---
    const handleImageUpload = (e) => {
        const files = Array.from(e.target.files);
        const maxImages = 10;
        const availableSlots = maxImages - images.filter(img => !img.tempKey || !img.tempKey.startsWith('existing-image')).length;

        if (files.length > availableSlots) {
            setErrors(prevErrors => ({ ...prevErrors, images: `You can only upload a maximum of ${maxImages} images.` }));
            return;
        }

        const seenFileSignatures = new Set(images.map(img => `${img.key || img.url}`));

        Promise.all(files.map(file => {
            return new Promise((resolve) => {
                const fileSizeMB = file.size / (1024 * 1024);
                if (fileSizeMB > MAX_IMAGE_SIZE_MB) {
                    setErrors(prevErrors => ({ ...prevErrors, images: `Image "${file.name}" exceeds the maximum size of ${MAX_IMAGE_SIZE_MB} MB.` }));
                    return resolve(null);
                }

                const fileSignature = `${file.name}`;
                if (seenFileSignatures.has(fileSignature)) {
                    setErrors(prevErrors => ({ ...prevErrors, images: 'Duplicate images detected.' }));
                    return resolve(null);
                }

                const img = new Image();
                img.onload = () => {
                    resolve({ file, url: URL.createObjectURL(file), key: file.name, contentType: file.type, sizeInMegaByte: fileSizeMB, tempKey: `new-image-${Date.now()}` });
                };
                img.onerror = () => {
                    setErrors(prevErrors => ({ ...prevErrors, images: `Error loading image "${file.name}".` }));
                    resolve(null);
                };
                img.src = URL.createObjectURL(file);
            });
        })).then(results => {
            const validNewImages = results.filter(Boolean);
            if (validNewImages.length > 0) {
                setImages(prevImages => {
                    const updatedImages = [...prevImages, ...validNewImages];
                    if (updatedImages.length > 0 && mainImage === null) {
                        // Set main image to the first newly added image index considering existing images
                        setMainImage(prevImages.filter(img => !img.tempKey || !img.tempKey.startsWith('existing-image')).length);
                    }
                    return updatedImages;
                });
                setErrors(prevErrors => ({ ...prevErrors, images: '' }));
            }
        });

        e.target.value = null;
    };

    // --- Handle Video Upload ---
    const handleVideoUpload = (e) => {
        const files = Array.from(e.target.files);
        const maxVideos = 3;
        const availableSlots = maxVideos - videos.filter(vid => !vid.tempKey || !vid.tempKey.startsWith('existing-video')).length;

        if (videos.length + files.length > maxVideos) {
            setErrors(prevErrors => ({ ...prevErrors, videos: `You can only upload a maximum of ${maxVideos} videos.` }));
            return;
        }

        const seenFileSignatures = new Set(videos.map(vid => `${vid.key || vid.url}`));

        Promise.all(files.map(file => {
            return new Promise((resolve) => {
                const fileSizeMB = file.size / (1024 * 1024);
                if (fileSizeMB > MAX_VIDEO_SIZE_MB) {
                    setErrors(prevErrors => ({ ...prevErrors, videos: `Video "${file.name}" exceeds the maximum size of ${MAX_VIDEO_SIZE_MB} MB.` }));
                    return resolve(null);
                }

                const fileSignature = `${file.name}`;
                if (seenFileSignatures.has(fileSignature)) {
                    setErrors(prevErrors => ({ ...prevErrors, videos: 'Duplicate videos detected.' }));
                    return resolve(null);
                }

                const video = document.createElement('video');
                video.onloadedmetadata = () => {
                    resolve({ file, url: URL.createObjectURL(file), key: file.name, contentType: file.type, sizeInMegaByte: fileSizeMB, tempKey: `new-video-${Date.now()}` });
                };
                video.onerror = () => {
                    setErrors(prevErrors => ({ ...prevErrors, videos: `Error loading video "${file.name}".` }));
                    resolve(null);
                };
                video.src = URL.createObjectURL(file);
            });
        })).then(results => {
            const validNewVideos = results.filter(Boolean);
            if (validNewVideos.length > 0) {
                setVideos(prevVideos => [...prevVideos, ...validNewVideos]);
                setErrors(prevErrors => ({ ...prevErrors, videos: '' }));
            }
        });

        e.target.value = null;
    };

    // --- Handle Remove Image ---
    const handleRemoveImage = (index) => {
        const imageToRemove = images[index];

        if (isEditMode && imageToRemove && imageToRemove.key && imageToRemove.tempKey && imageToRemove.tempKey.startsWith('existing-image')) {
            // Add to deletedImages if in edit mode and it's an existing image
            setDeletedImages(prevDeletedImages => [...prevDeletedImages, { key: imageToRemove.key }]);
        } else if (imageToRemove && imageToRemove.url && (!imageToRemove.tempKey || !imageToRemove.tempKey.startsWith('existing-image'))) {
            // Revoke URL for newly uploaded images
            URL.revokeObjectURL(imageToRemove.url);
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

        if (isEditMode && videoToRemove && videoToRemove.key && videoToRemove.tempKey && videoToRemove.tempKey.startsWith('existing-video')) {
            // Add to deletedVideos if in edit mode and it's an existing video
            setDeletedVideos(prevDeletedVideos => [...prevDeletedVideos, { key: videoToRemove.key }]);
        } else if (videoToRemove && videoToRemove.url && (!videoToRemove.tempKey || !videoToRemove.tempKey.startsWith('existing-video'))) {
            // Revoke URL for newly uploaded videos
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

        const isDuplicate = combinations.some(comb => comb.size === currentSize);
        if (isDuplicate) {
            setErrors(prevErrors => ({ ...prevErrors, combination: 'This size combination already exists.' }));
            return;
        }

        setCombinations(prevCombinations => [
            ...prevCombinations,
            { size: currentSize, quantity: parseInt(currentQuantity, 10) },
        ]);
        setCurrentSize('');
        setCurrentQuantity('');
        setErrors(prevErrors => ({ ...prevErrors, combination: '' }));
    };

    // --- Handle Remove Combination ---
    const handleRemoveCombination = (index) => {
        setCombinations(combinations.filter((_, i) => i !== index));
        if (combinations.length === 0) {
            setErrors(prevErrors => ({ ...prevErrors, combination: 'At least one size-quantity combination is required.' }));
        }
    };

    // --- Handle Edit Combination ---
    const handleEditCombination = (index) => {
        setEditingCombinationIndex(index);
    };

    // --- Handle Save Combination ---
    const handleSaveCombination = (index, newQuantity) => {
        const updatedCombinations = combinations.map((comb, idx) =>
            idx === index ? { ...comb, quantity: parseInt(newQuantity, 10) } : comb
        );
        setCombinations(updatedCombinations);
        setEditingCombinationIndex(null);
    };

    // --- Handle Select Main Image ---
    const handleSelectMainImage = (index) => {
        setMainImage(index);
    };

    // --- Render ---
    if (isPropertiesLoading || loading) {
        return (
            <div className='add-product-main-container slide-in'>
                <div className='add-product-h1-container'>
                    <Link to="/product-managements" className="add-product-return-link">
                        Back to Product Managements
                    </Link>
                    <h1 className="fade-in">{isEditMode ? 'Edit Product' : 'Add New Product'}</h1>
                </div>
                <div className="add-product-loading-container fade-in">
                    <FaSpinner className="add-product-spinner" /> Loading...
                </div>
            </div>
        );
    }

    if (propertiesError) {
        return (
            <div className='add-product-main-container slide-in'>
                <div className='add-product-h1-container'>
                    <Link to="/product-managements" className="add-product-return-link">
                        Back to Product Managements
                    </Link>
                    <h1 className="fade-in">{isEditMode ? 'Edit Product' : 'Add New Product'}</h1>
                </div>
                <div className="add-product-error-container fade-in">
                    <p>Error fetching properties: {propertiesError}</p>
                </div>
            </div>
        );
    }

    return (
        <div className='add-product-main-container slide-in'>
            <div className='add-product-h1-container'>
                <Link to="/product-managements" className="add-product-return-link">
                    Back to Product Managements
                </Link>
                <h1 className="fade-in">{isEditMode ? 'Edit Product' : 'Add New Product'}</h1>
            </div>
            <form className='add-product-form' onSubmit={handleSubmit}>
                {/* Product Details Section */}
                <section className='add-product-form-section fade-in'>
                    <h2 className="fade-in">Product Details</h2>
                    <div className='d-flex'>
                        <div className="add-product-form-group add-product-flex-half">
                            <label htmlFor="productId">
                                ID
                            </label>
                            <input
                                type="text"
                                id="productId"
                                value={productSku}
                                readOnly
                                className="w-100"
                            />
                        </div>
                        <div className="add-product-form-group add-product-flex-half"> {/* ADDED DIV */}
                            <label htmlFor="productName">
                                Active?<span className="add-product-required">*</span>
                            </label>

                            <CustomCheckbox
                                id="isActive"
                                name="isActive"
                                checked={isActive}
                                onChange={(e) => setIsActive(e.target.checked)}
                            />
                        </div>

                    </div>
                    <div className="add-product-form-group add-product-flex-half">
                        <label htmlFor="productName">
                            Name<span className="add-product-required">*</span>
                        </label>
                        <input
                            type="text"
                            id="productName"
                            value={productName}
                            onChange={(e) => setProductName(e.target.value)}
                            className={`w-100 ${errors.productName ? 'add-product-input-error' : ''}`}
                            aria-describedby="productNameError"
                        />
                    </div>

                    <div>
                        {errors.productName && <span className="add-product-error-message fade-in" id="productNameError">{errors.productName}</span>}
                    </div>

                    <div className='add-product-form-group'>
                        <label htmlFor="description">
                            Description<span className="add-product-required">*</span>
                        </label>
                        <ReactQuill
                            id="description"
                            value={description}
                            onChange={setDescription}
                            className={`add-product-quill-editor ${errors.description ? 'add-product-input-error' : ''}`}
                            aria-describedby="descriptionError"
                            modules={{
                                toolbar: [
                                    ['bold', 'italic', 'underline', 'strike'],        // toggled buttons

                                    [{ 'list': 'ordered' }, { 'list': 'bullet' }],
                                    [{ 'indent': '-1' }, { 'indent': '+1' }],          // outdent/indent
                                    [{ 'direction': 'rtl' }],                         // text direction

                                    [{ 'size': ['small', false, 'large', 'huge'] }],  // custom dropdown

                                    [{ 'align': [] }],

                                    ['link'],
                                    ['clean']                                         // remove formatting button

                                ],
                            }}
                            formats={[
                                'bold', 'italic', 'underline', 'strike', 'list', 'indent', 'direction', 'size', 'align', 'link'
                            ]}
                        />
                        {errors.description && <span className="add-product-error-message fade-in" id="descriptionError">{errors.description}</span>}
                    </div>
                    <div className='add-product-price-form fade-in'>
                        <div className='d-flex'>
                            <div className='add-product-form-group add-product-flex-half'>
                                <label htmlFor="price">
                                    Price ($)<span className="add-product-required">*</span>
                                </label>
                                <input
                                    type="number"
                                    id="price"
                                    value={price}
                                    onChange={(e) => setPrice(e.target.value)}
                                    min="0"
                                    step="0.01"
                                    className={`${errors.price ? 'add-product-input-error' : ''}`}
                                    aria-describedby="priceError"
                                />
                            </div>
                            <div className='add-product-form-group add-product-flex-half'>
                                <label htmlFor="sale">Sale (%)</label>
                                <input
                                    type="number"
                                    id="sale"
                                    value={sale}
                                    onChange={(e) => setSale(e.target.value)}
                                    min="0"
                                    max="100"
                                    step="0.01"
                                    className={`${errors.sale ? 'add-product-input-error' : ''}`}
                                    aria-describedby="saleError"
                                />
                            </div>
                            <div className='add-product-form-group add-product-flex-half fade-in'>
                                <label htmlFor="finalPrice">Final Price</label>
                                <input
                                    type="number"
                                    id="finalPrice"
                                    value={finalPrice}
                                    min="0"
                                    max="100"
                                    step="0.01"
                                    className={`${errors.sale ? 'add-product-input-error' : ''}`}
                                    aria-describedby="finalPriceError"
                                    readOnly
                                />
                            </div>
                        </div>
                        {errors.price && <span className="add-product-error-message fade-in" id="priceError">{errors.price}</span>}
                        {errors.sale && <span className="add-product-error-message fade-in" id="saleError">{errors.sale}</span>}
                    </div>
                </section>

                {/* Media Uploads Section */}
                <section className='add-product-form-section fade-in'>
                    <h2 className="fade-in">Media Uploads</h2>
                    <div className="add-product-media-items-container">
                        {/* Image Upload */}
                        <div className="add-product-media-item slide-in">
                            <div className='add-product-form-group'>
                                <label htmlFor="images">
                                    Main Image(s) <span className="add-product-required">*</span>
                                </label>
                                <input
                                    type="file"
                                    id="images"
                                    accept="image/*"
                                    multiple
                                    onChange={handleImageUpload}
                                    disabled={images.filter(img => !img.tempKey || !img.tempKey.startsWith('existing-image')).length >= 10}
                                    className={`${errors.images ? 'add-product-input-error' : ''}`}
                                    aria-describedby="imagesError"
                                />
                                {images.filter(img => !img.tempKey || !img.tempKey.startsWith('existing-image')).length > 0 && <small className="fade-in">{`${images.filter(img => !img.tempKey || !img.tempKey.startsWith('existing-image')).length}/10 images uploaded`}</small>}
                                {errors.images && <span className="add-product-error-message fade-in" id="imagesError">{errors.images}</span>}
                            </div>
                            <div className="add-product-uploaded-files fade-in">
                                {images.map((image, idx) => (
                                    <div
                                        key={idx}
                                        className="add-product-uploaded-file slide-in"
                                        onClick={() => handleSelectMainImage(idx)}
                                        style={{ cursor: 'pointer', border: mainImage === idx ? '2px solid #007bff' : '1px solid #ddd' }}
                                        aria-label={`Select image ${idx + 1} as main image`}
                                        tabIndex={0}
                                        onKeyPress={(e) => { if (e.key === 'Enter') handleSelectMainImage(idx); }}
                                    >
                                        <img src={image.url} alt={`Upload Preview ${idx + 1}`} className="add-product-preview-image" />
                                        {mainImage === idx && <div className="add-product-main-image-label fade-in">Main Image Selected</div>}
                                        <button
                                            className='add-product-img-x-btn'
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
                        <div className="add-product-media-item slide-in">
                            <div className='add-product-form-group'>
                                <label htmlFor="videos">Video(s)</label>
                                <input
                                    type="file"
                                    id="videos"
                                    accept="video/*"
                                    multiple
                                    onChange={handleVideoUpload}
                                    disabled={videos.filter(vid => !vid.tempKey || !vid.tempKey.startsWith('existing-video')).length >= 3}
                                    className={`${errors.videos ? 'add-product-input-error' : ''}`}
                                    aria-describedby="videosError"
                                />
                                {videos.filter(vid => !vid.tempKey || !vid.tempKey.startsWith('existing-video')).length > 0 && <small className="fade-in">{`${videos.filter(vid => !vid.tempKey || !vid.tempKey.startsWith('existing-video')).length}/3 videos uploaded`}</small>}
                                {errors.videos && <span className="add-product-error-message fade-in" id="videosError">{errors.videos}</span>}
                            </div>
                            <div className="add-product-uploaded-files fade-in">
                                {videos.map((video, idx) => (
                                    <div key={idx} className="add-product-uploaded-file slide-in">
                                        <video width="100" height="100" controls>
                                            <source src={video ? video.url : ''} type={video?.contentType} />
                                            Your browser does not support the video tag.
                                        </video>
                                        <button
                                            type="button"
                                            onClick={() => handleRemoveVideo(idx)}
                                            className="add-product-img-x-btn fade-in"
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
                <section className='add-product-form-section fade-in'>
                    <h2 className="fade-in">Product Properties</h2>
                    <div className="add-product-property-form">
                        <div className='add-product-form-group'>
                            <label htmlFor="currentSize">
                                Size<span className="add-product-required">*</span>
                            </label>
                            <select
                                id="currentSize"
                                value={currentSize}
                                onChange={(e) => setCurrentSize(e.target.value)}
                                className={`add-product-property-input ${errors.combination ? 'add-product-input-error' : ''}`}
                                aria-describedby="currentSizeError"
                            >

                                <option value="">Select Size</option>
                                {properties.sizes.map((size, idx) => (
                                    <option
                                        key={idx}
                                        value={size}
                                        disabled={combinations.some(comb => comb.size === size)}
                                    >
                                        {size}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className='add-product-form-group'>
                            <label htmlFor="currentQuantity">
                                Quantity<span className="add-product-required">*</span>
                            </label>
                            <input
                                type="number"
                                id="currentQuantity"
                                placeholder="Quantity"
                                value={currentQuantity}
                                onChange={(e) => setCurrentQuantity(e.target.value)}
                                min="0"
                                className={`add-product-property-input ${errors.combination ? 'add-product-input-error' : ''}`}
                                aria-describedby="currentQuantityError"
                            />
                        </div>

                        <button className='add-product-add-property-btn fade-in' type="button" onClick={handleAddCombination}>
                            + Add
                        </button>
                        {errors.combination && <span className="add-product-error-message fade-in">{errors.combination}</span>}
                    </div>

                    {/* Display combinations */}
                    {combinations.length > 0 && (
                        <div className="add-product-properties-submitted fade-in">
                            <table className="add-product-combinations-table slide-in">
                                <thead>
                                    <tr>
                                        <th style={{ width: '33%' }}>Size</th>
                                        <th style={{ width: '33%' }}>Quantity</th>
                                        <th style={{ width: '33%' }}>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {combinations.map((combination, idx) => (
                                        <tr key={idx} className="fade-in">
                                            <td>{combination.size}</td>
                                            <td>
                                                {editingCombinationIndex === idx ? (
                                                    <input
                                                        type="number"
                                                        value={combination.quantity}
                                                        onChange={(e) => {
                                                            const newQuantity = e.target.value;
                                                            setCombinations(combinations.map((comb, i) =>
                                                                i === idx ? { ...comb, quantity: newQuantity } : comb
                                                            ));
                                                        }}
                                                        min="0"
                                                        className="add-product-edit-quantity-input"
                                                    />
                                                ) : (
                                                    combination.quantity
                                                )}
                                            </td>
                                            <td>
                                                {editingCombinationIndex === idx ? (
                                                    <div className="add-product-actions-container">
                                                        <button
                                                            type="button"
                                                            onClick={() => handleSaveCombination(idx, combinations[idx].quantity)}
                                                            className='add-product-save-btn fade-in'
                                                            aria-label={`Save combination - ${combination.size}`}
                                                        >
                                                            Save
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <div className="add-product-actions-container">
                                                        <button
                                                            type="button"
                                                            onClick={() => handleEditCombination(idx)}
                                                            className='add-product-edit-btn fade-in'
                                                            aria-label={`Edit combination - ${combination.size}`}
                                                        >
                                                            <FaEdit />
                                                        </button>
                                                        <button
                                                            type="button"
                                                            onClick={() => handleRemoveCombination(idx)}
                                                            className='add-product-x-btn fade-in'
                                                            aria-label={`Remove combination  - ${combination.size}`}
                                                        >
                                                            ×
                                                        </button>
                                                    </div>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </section>

                {/* Tags Section */}
                <section className='add-product-form-section fade-in'>
                    <h2 className="fade-in">Tags</h2>
                    <div className="add-product-flex-form-group">
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
                    {errors.tags && <span className="add-product-error-message fade-in">{errors.tags}</span>}
                </section>

                {/* Submit Button */}
                <div className="add-product-submit-section fade-in">
                    <button type="submit" className="add-product-submit-button slide-in" disabled={isFormSubmitting}>
                        {isFormSubmitting ? <FaSpinner className="add-product-spinner" /> : (isEditMode ? 'Edit Product' : 'Add Product')}
                    </button>
                </div>

                {isSubmissionError && (
                    <div className="add-product-api-error-message fade-in">
                        Error {isEditMode ? 'updating' : 'adding'} product: {submissionError?.message || 'An unknown error occurred.'}
                    </div>
                )}
            </form>
        </div >
    );
}
export default ProductForm;