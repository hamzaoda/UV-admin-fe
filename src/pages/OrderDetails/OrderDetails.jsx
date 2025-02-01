// OrderDetails.jsx
import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './OrderDetails.css';
import useApi from '../../hooks/useApi'; // Assuming you have a useApi hook
import Modal from '../../components/Modal/Modal'; // Assuming Modal.jsx is in components folder
import ViewProduct from '../../components/ViewProduct/ViewProduct'; // Assuming ViewProduct.jsx is in components folder

function OrderDetails() {
    const { orderId } = useParams();
    const navigate = useNavigate();
    const { callApi } = useApi();

    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedProductId, setSelectedProductId] = useState(null);

    useEffect(() => {
        const fetchOrderDetails = async () => {
            setLoading(true);
            setError(null);
            try {
                const response = await callApi({
                    url: `orders/details/${orderId}`,
                    method: 'GET',
                    successMessage: 'Order details fetched successfully!',
                    errorMessage: 'Failed to fetch order details.',
                });

                if (response.isSuccess && response.data) {
                    setOrder(response.data);
                } else {
                    setError(response.message || 'Failed to fetch order details');
                }
            } catch (err) {
                setError('Error fetching order details.');
                console.error("Error fetching order details:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchOrderDetails();
    }, [orderId, callApi]);

    const handleGoBack = () => {
        navigate('/order-managements'); // Assuming '/orders' is the path to your OrderManagement component
    };

    const calculatePriceAfterSale = (price, sale) => {
        if (sale > 0) {
            return price * (1 - sale / 100); // Assuming sale is a percentage
        }
        return price;
    };

    // Calculate total order price (if still needed outside the table, you can keep it or remove it)
    const totalOrderPrice = order?.cart?.sizes?.reduce((total, size) => {
        const unitPrice = order.productDetails?.price || 0;
        const priceAfterSale = calculatePriceAfterSale(unitPrice, order.productDetails?.sale || 0);
        return total + (priceAfterSale * size.quantity);
    }, 0) || 0;

    const openProductModal = useCallback((productId) => {
        setSelectedProductId(productId);
        setIsModalOpen(true);
    }, []);

    const closeProductModal = useCallback(() => {
        setIsModalOpen(false);
        setSelectedProductId(null);
    }, []);

    if (loading) {
        return <div>Loading order details...</div>;
    }

    if (error) {
        return <div>Error fetching order details: {error}</div>;
    }

    if (!order) {
        return <div>No order details found.</div>;
    }

    return (
        <div className='order-details-section'>
            <h1 className='order-details-h1'>Order Details</h1>
            <span className='order-details-x' onClick={handleGoBack}>Return to Order Managements</span>
            <div className='order-details-id-date-container section-container'>
                <h3 className='order-details-id-container'>Order ID: #{order.trackingId}</h3>
                <span className='order-details-date'>Order Created: {new Date(order.createdAt).toLocaleDateString()}</span>
            </div>

            <div className='order-details-summary-customer-container'>
                <div className='order-details-summary-container section-container'>
                    <h3 className='order-details-h3'>Order Summary</h3>
                    <div className='order-details-text'>
                        <span>Transaction ID:</span>
                        <span>#{order._id}</span>
                    </div>
                    <hr className='order-details-hr' />
                    <div className='order-details-text'>
                        <span>order status:</span>
                        <span>{order.orderStatus || 'Processing'}</span>
                    </div>
                    <hr className='order-details-hr' />
                    <div className='order-details-text'>
                        <span>Total Price:</span>
                        <span>
                            ${totalOrderPrice.toFixed(2)} USD
                        </span>
                    </div>
                </div>

                <div className='order-details-customer-details-container section-container'>
                    <h3 className='order-details-h3'>Contact Information</h3>
                    <div className='order-details-text'>
                        <span>Name:</span>
                        <span>{order.contactInformation?.firstName} {order.contactInformation?.lastName}</span>
                    </div>
                    <hr className='order-details-hr' />
                    <div className='order-details-text'>
                        <span>Email:</span>
                        <span>{order.contactInformation?.email}</span>
                    </div>
                    <hr className='order-details-hr' />
                    <div className='order-details-text'>
                        <span>Phone:</span>
                        <span>{order.contactInformation?.phoneNumber}</span>
                    </div>
                    <hr className='order-details-hr' />
                    <div className='order-details-text'>
                        <span>Address:</span>
                        <span>{order.addressInformation?.streetAddress}, {order.addressInformation?.city}, {order.addressInformation?.state} {order.addressInformation?.zipCode}, {order.addressInformation?.country}</span>
                    </div>
                </div>
            </div>

            <table className='order-details-products-table'>
                <thead>
                    <tr>
                        <th>Product</th>
                        <th>Size</th>
                        <th>Price Unit</th>
                        <th>Sale (%)</th>
                        <th>Price After Sale</th>
                        <th>Quantity</th>
                        <th>Total Price</th>
                    </tr>
                </thead>
                <tbody>
                    {order && order.cart && order.cart.sizes && order.productDetails ? (
                        order.cart.sizes.map((sizeItem) => {
                            const unitPrice = order.productDetails?.price || 0;
                            const salePercentage = order.productDetails?.sale || 0;
                            const priceAfterSale = calculatePriceAfterSale(unitPrice, salePercentage);
                            const rowTotalPrice = priceAfterSale * sizeItem.quantity;
                            const productId = order.productDetails?._id;

                            return (
                                <tr key={sizeItem._id} className='order-details-product-row' onClick={() => openProductModal(productId)}>
                                    <td>
                                        <div className='order-details-product-image-container'>
                                            <img
                                                src={order.productDetails?.images?.list[0]?.url}
                                                alt={order.productDetails?.name}
                                                className='order-details-product-image'
                                                onError={(e) => { e.target.onerror = null; e.target.src = "/images/products/default.jpg" }}
                                            />
                                            <span>{order.productDetails?.name || 'Product Name'}</span>
                                        </div>
                                    </td>
                                    <td>{sizeItem.size}</td>
                                    <td>${unitPrice.toFixed(2)}</td>
                                    <td>{salePercentage}%</td>
                                    <td>${priceAfterSale.toFixed(2)}</td>
                                    <td>{sizeItem.quantity}</td>
                                    <td>${rowTotalPrice.toFixed(2)}</td>
                                </tr>
                            );
                        })
                    ) : (
                        <tr><td colSpan="8">No products in order details yet.</td></tr>
                    )}
                </tbody>
            </table>

            {isModalOpen && (
                <Modal onClose={closeProductModal} contentState="slide">
                    <ViewProduct productId={selectedProductId} />
                </Modal>
            )}
        </div>
    );
}

export default OrderDetails;