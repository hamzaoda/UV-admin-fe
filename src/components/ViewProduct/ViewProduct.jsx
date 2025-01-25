import React, { useState, useEffect, useMemo, useCallback } from 'react';
import useApi from '../../hooks/useApi';
import './ViewProduct.css';

function ViewProduct({ productId }) {
    const [product, setProduct] = useState(null);
    const { callApi, isLoading, isError, error } = useApi();
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

    if (isLoading) {
        return <div className="view-product-loading">Loading product details...</div>;
    }

    if (isError || errorMessage) {
        return <div className="view-product-error">Error: {errorMessage || 'Failed to load product.'}</div>;
    }

    if (!product) {
        return <div>Product not found or loading...</div>;
    }

    return (
        <div className='view-product-main-container'>
            <div className="view-product-grid-container">
                <div className='view-product-info-section'>
                    <div className="view-product-form-group">
                        <label>Name</label>
                        <input className="view-product-input" type="text" readOnly value={product.name || ''} aria-label="Product Name" />
                    </div>
                    <div className="view-product-form-group-flex">
                        <div className="view-product-form-group">
                            <label>Price</label>
                            <input className="view-product-input" type="text" readOnly value={product.price !== undefined ? product.price : ''} aria-label="Price" />
                        </div>
                        <div className="view-product-form-group">
                            <label>Sale</label>
                            <input className="view-product-input" type="text" readOnly value={product.sale !== undefined ? `${product.sale}%` : 'N/A'} aria-label="Sale Percentage" />
                        </div>
                        <div className="view-product-form-group">
                            <label>Final Price</label>
                            <input className="view-product-input" type="text" readOnly value={finalPrice !== undefined ? finalPrice : 'N/A'} aria-label="Final Price" />
                        </div>

                    </div>
                </div>
                <div className='view-product-description-section'>
                    <div className="view-product-textarea-container">
                        <label>Description</label>
                        <div
                            className="view-product-textarea ql-editor"
                            dangerouslySetInnerHTML={{ __html: product.description }}
                        ></div>

                        {/* <textarea className='view-product-textarea' readOnly value={product.description || ''} aria-label="Product Description" /> */}
                    </div>
                </div>
            </div>
            <div className="view-product-media-section">
                <div className="view-product-media-grid">
                    {mainImageUrl && (
                        <img src={mainImageUrl} alt={product.name} className="view-product-main-image" />
                    )}
                    {otherImages?.length > 0 && (
                        otherImages.map((image) => (
                            <img key={image.url} src={image.url} alt={`${product.name} - Additional`} className="view-product-thumbnail-image" />
                        ))
                    )}
                    {product.videos?.list?.length > 0 && (
                        product.videos.list.map((video) => (
                            <video controls className='product-view-video'>
                                <source src={video.url} type="video/mp4" />
                                Your browser does not support the video tag.
                            </video>
                        ))
                    )}
                </div>
            </div>
            {product.properties?.length > 0 && (
                <div className='view-product-properties'>
                    <label>Properties</label>
                    <table className='view-product-properties-table'>
                        <thead>
                            <tr>
                                <th>Size</th>
                                <th>Quantity</th>
                            </tr>
                        </thead>
                        <tbody>
                            {product.properties.map((propertyGroup, index) => (
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
                <div className='view-product-tags'>
                    <label>Tags</label>
                    <div className="view-product-tags-list">
                        {product.tags.map((tag) => (
                            <span key={tag} className="view-product-tag">
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