// src/pages/ProductForm/ProductForm.jsx
import { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import './ProductForm.css';
import CustomCheckboxText from '../../components/CustomComponents/CustomCheckboxText/CustomCheckboxText'; // Imported CustomCheckboxText
import useApi from '../../hooks/useApi';
import useApiWithFiles from '../../hooks/useApiWithFiles';
import { FaEdit, FaTimes, FaCheck, FaPlus } from 'react-icons/fa'; // Removed FaSpinner
import ReactQuill from 'react-quill';
import { motion } from "framer-motion"; // NEW: Import farmer-motion
import LoadingOverlay from '../../components/LoadingOverlay/LoadingOverlay'; // ADDED: Import LoadingOverlay

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

const sectionAnimation = {
    hidden: { opacity: 0, y: 50 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.7 } },
};

import PropTypes from 'prop-types';

function ProductForm({ isEditMode = false }) {

    ProductForm.propTypes = {
        isEditMode: PropTypes.bool
    };

    const { productId } = useParams();

    const navigate = useNavigate();

    // --- State Variables ---
    const [productName, setProductName] = useState('');
    const [description, setDescription] = useState('');
    const [price, setPrice] = useState('');
    const [sale, setSale] = useState('');
    const [finalPrice, setFinalPrice] = useState('');
    const [images, setImages] = useState([]);
    const [videos, setVideos] = useState([]);
    const [mainImage, setMainImage] = useState(null);
    const [properties, setProperties] = useState({ sizes: [], tags: [] });
    const [propertiesError, setPropertiesError] = useState(null);
    const [combinations, setCombinations] = useState([]);
    const [currentSize, setCurrentSize] = useState('');
    const [currentQuantity, setCurrentQuantity] = useState('');
    const [errors, setErrors] = useState(initialErrors);
    const [selectedTags, setSelectedTags] = useState([]); // Now multi select using checkboxes
    const [editingCombinationIndex, setEditingCombinationIndex] = useState(null);
    const [deletedImages, setDeletedImages] = useState([]); // Add deletedImages state
    const [deletedVideos, setDeletedVideos] = useState([]); // Add deletedVideos state
    const [isActive, setIsActive] = useState(true); // ADDED: State for isActive, default true


    const { callApi: callApiFiles, isLoading: isLoadingFiles } = useApiWithFiles(); // ADDED: isLoadingFiles
    const { callApi: callApiGet, isError: isSubmissionError, error: submissionError, isLoading: isLoadingGet } = useApi(); // ADDED: isLoadingGet

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
            }
        };

        fetchProperties();
    }, [callApiGet]);

    // --- Fetch Product Data for Edit Mode ---
    useEffect(() => {
        // Only fetch product data if in edit mode and productId is available
        if (isEditMode && productId) {
            const fetchProduct = async () => {
                try {
                    const response = await callApiGet({
                        url: `/products/details/${productId}`,
                        method: 'GET',
                    });
                    if (response.isSuccess && response.data) {
                        const productData = response.data;
                        setProductName(productData.name || '');
                        setDescription(
                            productData.description.replace(
                                /<p\b[^>]*>(\s*<br\s*\/?>\s*)<\/p>(?=\s*<(ul|ol))/gi,
                                ''
                            )
                        );
                        setPrice(productData.price?.toString() || '');
                        setSale(productData.sale?.toString() || '');
                        setSelectedTags(productData.tags || []); // Set initial selected tags for checkboxes
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
        setSelectedTags([]); // Clear selected tags
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
            console.log("price error");
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

        if (selectedTags.length === 0) { // Adjust validation for multi select tag if needed.
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
            tags: selectedTags, // Send multi selected tags for checkboxes
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
                    tags: selectedTags, // Send multi selected tags for checkboxes
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
            // setIsFormSubmitting(false); // REMOVED
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

    // --- Handle Tag Selection (Checkbox Logic) ---
    const handleTagChange = (tag) => {
        setSelectedTags(prevSelectedTags => {
            if (prevSelectedTags.includes(tag)) {
                return prevSelectedTags.filter(selectedTag => selectedTag !== tag); // Deselect tag
            } else {
                return [...prevSelectedTags, tag]; // Select tag
            }
        });
    };

    if (propertiesError) {
        return (
            <>
                <div>
                    <Link to="/product-managements" className="add-product-return-link">
                        Back to Product Managements
                    </Link>
                    <h1>{isEditMode ? 'Edit Product' : 'Add New Product'}</h1>
                </div>
                <div className="add-product-error-container">
                    <p>Error fetching properties: {propertiesError}</p>
                </div>
            </>
        );
    }

    return (
        <div>
            <LoadingOverlay isLoading={isLoadingFiles || isLoadingGet} /> {/* ADDED: LoadingOverlay component */}
            <div className='h1-container'>
                <h1 >{isEditMode ? 'Edit Product' : 'Add New Product'}</h1>
                <Link to="/product-managements" className="return-link">
                    Back to Product Managements
                </Link>

            </div>
            <form className='form-section' onSubmit={handleSubmit}>
                {/* Product Details Section */}
                <motion.section
                    className='section-container form-section'
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, amount: 0.3 }}
                    variants={sectionAnimation}
                >
                    <h2 >Product Details</h2>
                    <div className='form-group'>

                        <div className="d-flex align-items-end"> {/* ADDED DIV */}
                            <div className="form-group">
                                <label htmlFor="productName">
                                    Name<span className="add-product-required">*</span>
                                </label>
                                <input
                                    type="text"
                                    id="productName"
                                    value={productName}
                                    onChange={(e) => setProductName(e.target.value)}
                                    className={`w-100 ${errors.productName ? 'input-error' : ''}`}
                                    aria-describedby="productNameError"
                                />
                            </div>

                            <div className='d-flex'>
                                <CustomCheckboxText
                                    id="isActive-true"
                                    name="isActive"
                                    value={true}
                                    checked={isActive === true} // Assuming you still want to control this with radio-like behavior, keep checked as is
                                    onChange={() => setIsActive(true)} // Keep onChange as is if radio-like behavior is intended
                                    label="Active"
                                />
                                <CustomCheckboxText
                                    id="isActive-false"
                                    name="isActive"
                                    value={false}
                                    checked={isActive === false} // Assuming you still want to control this with radio-like behavior, keep checked as is
                                    onChange={() => setIsActive(false)} // Keep onChange as is if radio-like behavior is intended
                                    label="inActive"
                                />
                            </div>
                        </div>
                        {errors.productName && <span className="error-message" id="productNameError">{errors.productName}</span>}

                    </div>


                    <div className='form-group'>
                        <label htmlFor="description">
                            Description<span className="add-product-required">*</span>
                        </label>
                        <ReactQuill
                            id="description"
                            value={description}
                            onChange={setDescription}
                            className={`quill-editor ${errors.description ? 'input-error' : ''}`}
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
                        {errors.description && <span className="error-message" id="descriptionError">{errors.description}</span>}
                    </div>
                    <div className='form-group'>
                        <div className='d-flex-between'>
                            <div className='form-group'>
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
                                    className={`${errors.price ? 'input-error' : ''}`}
                                    aria-describedby="priceError"
                                />
                            </div>
                            <div className='form-group'>
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
                            <div className='form-group'>
                                <label htmlFor="finalPrice">Final Price</label>
                                <input
                                    type="number"
                                    id="finalPrice"
                                    value={finalPrice}
                                    min="0"
                                    max="100"
                                    step="0.01"
                                    className={`${errors.sale ? 'input-error' : ''}`}
                                    aria-describedby="finalPriceError"
                                    readOnly
                                />
                            </div>
                        </div>
                        {errors.price && <span className="error-message" id="priceError">{errors.price}</span>}
                        {errors.sale && <span className="error-message" id="saleError">{errors.sale}</span>}

                    </div>
                </motion.section>

                {/* Media Uploads Section */}
                <motion.section
                    className='section-container form-section'
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, amount: 0.3 }}
                    variants={sectionAnimation}
                >
                    <h2 >Media Uploads</h2>

                    <div className='form-group'>
                        <input
                            type="file"
                            id="images"
                            accept="image/*"
                            multiple
                            onChange={handleImageUpload}
                            disabled={images.filter(img => !img.tempKey || !img.tempKey.startsWith('existing-image')).length >= 10}
                            className={`${errors.images ? 'input-error' : ''}`}
                            aria-describedby="imagesError"
                        />
                        <label className='upload-images-btn' htmlFor='images'>Upload Images</label>
                        {images.filter(img => !img.tempKey || !img.tempKey.startsWith('existing-image')).length > 0 &&
                            <div>{`${images.filter(img => !img.tempKey || !img.tempKey.startsWith('existing-image')).length}/10 images uploaded`}</div>}
                        {errors.images && <span className="error-message" id="imagesError">{errors.images}</span>}
                    </div>

                    {images && images.length > 0 && (
                        <div className="uploaded-files">
                            {images.map((image, idx) => (
                                <div
                                    key={idx}
                                    className="uploaded-file"
                                    onClick={() => handleSelectMainImage(idx)}
                                    style={{ cursor: 'pointer', border: mainImage === idx ? '0.15rem solid var(--secondary-color)' : '0.15rem solid var(--secondary-light-color)' }}
                                    aria-label={`Select image ${idx + 1} as main image`}
                                    tabIndex={0}
                                >
                                    <img src={image.url} alt={`Upload Preview ${idx + 1}`} className="preview-image" />
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
                    )}
                    <div className='form-group'>
                        <label className='upload-images-btn' htmlFor="videos">Upload Videos</label>
                        <input
                            type="file"
                            id="videos"
                            accept="video/*"
                            multiple
                            onChange={handleVideoUpload}
                            disabled={videos.filter(vid => !vid.tempKey || !vid.tempKey.startsWith('existing-video')).length >= 3}
                            className={`${errors.videos ? 'input-error' : ''}`}
                            aria-describedby="videosError"
                        />
                        {videos.filter(vid => !vid.tempKey || !vid.tempKey.startsWith('existing-video')).length > 0 &&
                            <small >{`${videos.filter(vid => !vid.tempKey || !vid.tempKey.startsWith('existing-video')).length}/3 videos uploaded`}</small>}
                        {errors.videos && <span className="error-message" id="videosError">{errors.videos}</span>}
                    </div>
                    {videos && videos.length > 0 && (
                        <div className="uploaded-files ">
                            {videos.map((video, idx) => (
                                <div key={idx} className="uploaded-file">
                                    <video controls className="preview-image">
                                        <source src={video ? video.url : ''} type={video?.contentType} />
                                        Your browser does not support the video tag.
                                    </video>
                                    <button
                                        type="button"
                                        onClick={() => handleRemoveVideo(idx)}
                                        className="img-x-btn "
                                        aria-label={`Remove video ${idx + 1}`}
                                    >
                                        ×
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </motion.section>

                {/* Product Properties Section */}
                <motion.section
                    className='section-container form-section'
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, amount: 0.3 }}
                    variants={sectionAnimation}
                >
                    <h2 >Product Properties</h2>
                    <div className='form-group'>
                        <div className="d-flex-between align-items-end">
                            <div className='form-group'>
                                <label htmlFor="currentSize">
                                    Size<span className="add-product-required">*</span>
                                </label>
                                <select
                                    id="currentSize"
                                    value={currentSize}
                                    onChange={(e) => setCurrentSize(e.target.value)}
                                    className={`add-product-property-input ${errors.combination ? 'input-error' : ''}`}
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

                            <div className='form-group'>
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
                                    className={`add-product-property-input ${errors.combination ? 'input-error' : ''}`}
                                    aria-describedby="currentQuantityError"
                                />
                            </div>

                            <button type="button" onClick={handleAddCombination}>
                                <FaPlus />
                            </button>
                        </div>
                        {errors.combination && <span className="error-message">{errors.combination}</span>}
                    </div>

                    {/* Display combinations */}
                    {combinations.length > 0 && (
                        <div className="table-container">
                            <table className="combinations-table">
                                <thead>
                                    <tr>
                                        <th style={{ width: '33%' }}>Size</th>
                                        <th style={{ width: '33%' }}>Quantity</th>
                                        <th style={{ width: '33%' }}>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {combinations.map((combination, idx) => (
                                        <tr key={idx} >
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
                                                    <div className="d-flex-center">
                                                        <button
                                                            type="button"
                                                            onClick={() => handleSaveCombination(idx, combinations[idx].quantity)}
                                                            className='success-btn '
                                                            aria-label={`Save combination - ${combination.size}`}
                                                        >
                                                            <FaCheck />
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <div className="d-flex-center">
                                                        <button
                                                            type="button"
                                                            onClick={() => handleEditCombination(idx)}
                                                            className='edit-btn'
                                                            aria-label={`Edit combination - ${combination.size}`}
                                                        >
                                                            <FaEdit />
                                                        </button>
                                                        <button
                                                            type="button"
                                                            onClick={() => handleRemoveCombination(idx)}
                                                            className='delete-btn '
                                                            aria-label={`Remove combination  - ${combination.size}`}
                                                        >
                                                            <FaTimes />
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
                </motion.section>

                {/* Tags Section */}
                <motion.section
                    className='section-container form-section'
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, amount: 0.3 }}
                    variants={sectionAnimation}
                >
                    <h2 >Tags</h2>
                    <div className='form-group'>
                        <div className="uploaded-files">
                            {properties.tags.map((tag, idx) => (
                                <CustomCheckboxText
                                    key={idx}
                                    id={`tag-${idx}`}
                                    name="tags"
                                    value={tag}
                                    checked={selectedTags.includes(tag)} // Check if tag is in selectedTags array
                                    onChange={() => handleTagChange(tag)} // Pass tag value to handleTagChange
                                    label={tag}
                                />
                            ))}
                        </div>
                        {errors.tags && <span className="error-message">{errors.tags}</span>}
                    </div>
                </motion.section>

                {/* Submit Button */}
                <div className="add-product-submit-section ">
                    <button type="submit" className="add-product-submit-button" > {/* Removed disabled={isFormSubmitting} */}
                        {isEditMode ? 'Submit Edit Product' : 'Submit Add Product'} {/* Removed spinner logic */}
                    </button>
                </div>

                {isSubmissionError && (
                    <div className="add-product-api-error-message ">
                        Error {isEditMode ? 'updating' : 'adding'} product: {submissionError?.message || 'An unknown error occurred.'}
                    </div>
                )}
            </form>
        </div >
    );
}
export default ProductForm;