import { useState, useEffect, useMemo, useCallback } from 'react';
import useApi from '../../hooks/useApi';
import './ViewProduct.css';
import LoadingOverlay from '../LoadingOverlay/LoadingOverlay'; // Import the LoadingOverlay

function ViewProduct({ productId }) {
    const [product, setProduct] = useState(null);
    const { callApi, isLoading, isError } = useApi();
    const [errorMessage, setErrorMessage] = useState(null);

    const fetchProductDetails = useCallback(async () => {
        if (productId) {
            const response = await callApi({
                url: `/products/details/${productId}`,
                method: 'GET',
            });

            if (response.isSuccess && response.data) {
                setProduct(response.data);
                setErrorMessage(null);
            } else {
                console.error('API Error fetching product:', response.message || 'Unknown error');
                setErrorMessage(response.message || 'Failed to load product details.');
            }
        }
    }, [productId, callApi]);

    useEffect(() => {
        fetchProductDetails();
    }, [fetchProductDetails]);

    const finalPrice = useMemo(() => {
        if (product?.price !== undefined && product?.sale !== undefined) {
            return (product.price * (1 - product.sale / 100)).toFixed(2);
        }
        return product?.price?.toFixed(2);
    }, [product?.price, product?.sale]);

    const mainImageUrl = useMemo(() => {
        return product?.images?.list?.[product.images.mainImage]?.url;
    }, [product?.images?.list, product?.images?.mainImage]);

    const otherImages = useMemo(() => {
        return product?.images?.list?.filter((_, index) => index !== product.images.mainImage);
    }, [product?.images?.list, product?.images?.mainImage]);

    // Use LoadingOverlay, wrapping the entire component
    if (isLoading) {
        return <LoadingOverlay isLoading={isLoading} message="Loading product details..." />;
    }

    if (isError || errorMessage) {
        return <div className="view-product-error">Error: {errorMessage || 'Failed to load product.'}</div>;
    }

    if (!product) {
        return <div>Product not found or loading...</div>; //  Keep this, in case of null product *after* loading.
    }

    return (
        <div className='form-section'>
            <div className='bordered-container form-section'>
                <div className="form-group">
                    <label>Name</label>
                    <input type="text" readOnly value={product.name || ''} aria-label="Product Name" />
                </div>
                <div className="d-flex-between">
                    <div className="form-group">
                        <label>Price</label>
                        <input className="w-100" type="text" readOnly value={product.price !== undefined ? product.price : ''} aria-label="Price" />
                    </div>
                    <div className="form-group">
                        <label>Sale</label>
                        <input className="w-100" type="text" readOnly value={product.sale !== undefined ? `${product.sale}%` : 'N/A'} aria-label="Sale Percentage" />
                    </div>
                    <div className="form-group">
                        <label>Final Price</label>
                        <input className="w-100" type="text" readOnly value={finalPrice !== undefined ? finalPrice : 'N/A'} aria-label="Final Price" />
                    </div>
                </div>
            </div>
            <div className='bordered-container form-section'>
                <div className="w-100 form-group">
                    <label>Description</label>
                    <div
                        className="view-product-textarea ql-editor"
                        dangerouslySetInnerHTML={{ __html: product.description }}
                    ></div>
                </div>
            </div>
            <div className="bordered-container view-product-media-grid">
                {mainImageUrl && (
                    <img src={mainImageUrl} alt={product.name} className="view-product-main-image view-product-thumbnail-image" />
                )}
                {otherImages?.length > 0 && (
                    otherImages.map((image) => (
                        <img key={image.url} src={image.url} alt={`${product.name} - Additional`} className="view-product-thumbnail-image " />
                    ))
                )}
                {product.videos?.list?.length > 0 && (
                    product.videos.list.map((video) => (
                        <video key={video.url} controls className='product-view-video'>
                            <source src={video.url} type="video/mp4" />
                            Your browser does not support the video tag.
                        </video>
                    ))
                )}
            </div>
            {product.properties?.length > 0 && (
                <div className='bordered-container'>
                    <table className='table-container'>
                        <thead>
                            <tr>
                                <th style={{ width: "50%" }}>Size</th>
                                <th style={{ width: "50%" }}>Quantity</th>
                            </tr>
                        </thead>
                        <tbody>
                            {product.properties.map((propertyGroup) => (
                                propertyGroup.sizes.map(size => (
                                    <tr key={size._id}>
                                        <td>{size.size}</td>
                                        <td>{size.quantity}</td>
                                    </tr>
                                ))
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
            {product.tags?.length > 0 && (
                <div className='bordered-container form-group'>
                    <label>Tags</label>
                    <div className="managements-tags-container">
                        {product.tags.map((tag) => (
                            <span key={tag} className="managements-tag">
                                {tag}
                            </span>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}

export default ViewProduct;