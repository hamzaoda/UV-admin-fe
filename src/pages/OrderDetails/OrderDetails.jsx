// OrderDetails.jsx
import { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './OrderDetails.css';
import useApi from '../../hooks/useApi'; // Assuming you have a useApi hook
import Modal from '../../components/Modal/Modal'; // Assuming Modal.jsx is in components folder
import ViewProduct from '../../components/ViewProduct/ViewProduct'; // Assuming ViewProduct.jsx is in components folder
import LoadingOverlay from '../../components/LoadingOverlay/LoadingOverlay'; // ADDED: Import LoadingOverlay

function OrderDetails() {
    const { orderId } = useParams();
    const navigate = useNavigate();
    const { callApi, isLoading } = useApi(); // ADDED: isLoading

    const [order, setOrder] = useState(null);
    const [error, setError] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedProductId, setSelectedProductId] = useState(null);

    useEffect(() => {
        const fetchOrderDetails = async () => {
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

    // Calculate total order price - adjusted for the new structure
    const totalOrderPrice = order?.cart?.reduce((total, cartItem) => {
        return total + cartItem.sizes.reduce((sizeTotal, size) => {
            const unitPrice = cartItem.productDetails?.price || 0;
            const priceAfterSale = calculatePriceAfterSale(unitPrice, cartItem.productDetails?.sale || 0);
            return sizeTotal + (priceAfterSale * size.quantity);
        }, 0);
    }, 0) || 0;

    const openProductModal = useCallback((productId) => {
        setSelectedProductId(productId);
        setIsModalOpen(true);
    }, []);

    const closeProductModal = useCallback(() => {
        setIsModalOpen(false);
        setSelectedProductId(null);
    }, []);

    if (error) {
        return <div>Error fetching order details: {error}</div>;
    }

    if (!order) {
        return <LoadingOverlay isLoading={true} />; // Or a message like "Loading order details..."
    }


    return (
        <>
            <LoadingOverlay isLoading={isLoading} />
            <div className='h1-container'>
                <h1>Order Details</h1>
                <span className='return-link' onClick={handleGoBack}>Return to Order Managements</span>
            </div>
            <div className='form-section'>
                <div className='section-container'>
                    <h3 className='order-details-h3'>Order ID: #{order.trackingId && order.trackingId}</h3>
                    <span>Order Created: {new Date(order.createdAt).toLocaleDateString()}</span>
                </div>

                <div className='d-flex align-items-normal'>
                    <div className='section-container w-100'>
                        <h3 className='order-details-h3'>Order Summary</h3>
                        <div className='form-section-hr'>
                            <div className='d-flex-between'>
                                <span>Transaction ID:</span>
                                <span>#{order._id}</span>
                            </div>
                            <hr />
                            <div className='d-flex-between'>
                                <span>Order Status:</span>
                                <span className={`order-status order-status-${(order.status || 'processing').toLowerCase().replace(/\s+/g, '-')}`}>
                                    {order.status || 'Processing'}
                                </span>
                            </div>
                            <hr />
                            <div className='d-flex-between'>
                                <span>Total Price:</span>
                                <span>
                                    ${totalOrderPrice.toFixed(2)} USD
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className='section-container w-100'>
                        <h3 className='order-details-h3'>Contact Information</h3>
                        <div className='form-section-hr'>
                            <div className='d-flex-between'>
                                <span>Name:</span>
                                <span>{order.contactInformation?.firstName} {order.contactInformation?.lastName}</span>
                            </div>
                            <hr />
                            <div className='d-flex-between'>
                                <span>Email:</span>
                                <span>{order.contactInformation?.email}</span>
                            </div>
                            <hr />
                            <div className='d-flex-between'>
                                <span>Phone:</span>
                                <span>{order.contactInformation?.phoneNumber}</span>
                            </div>
                            <hr />
                            <div className='d-flex-between'>
                                <span>Address:</span>
                                <span>{order.addressInformation?.streetAddress}, {order.addressInformation?.city}, {order.addressInformation?.state} {order.addressInformation?.zipCode}, {order.addressInformation?.country}</span>
                            </div>
                        </div>
                    </div>
                </div>
                <div className='table-container'>
                    <table>
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
                            {order && order.cart && order.cart.length > 0 ? (
                                order.cart.map((cartItem) => (
                                    cartItem.sizes.map((sizeItem) => {
                                        const unitPrice = cartItem.productDetails?.price || 0;
                                        const salePercentage = cartItem.productDetails?.sale || 0;
                                        const priceAfterSale = calculatePriceAfterSale(unitPrice, salePercentage);
                                        const rowTotalPrice = priceAfterSale * sizeItem.quantity;
                                        const productId = cartItem.productDetails?._id;

                                        return (
                                            <tr key={sizeItem._id} className='order-details-product-row' onClick={() => openProductModal(productId)}>
                                                <td>
                                                    <div className='d-flex'>
                                                        <img
                                                            src={cartItem.productDetails?.images?.list[0]?.url}
                                                            alt={cartItem.productDetails?.name}
                                                            className='order-details-product-image'
                                                            onError={(e) => { e.target.onerror = null; e.target.src = "/images/products/default.jpg" }}
                                                        />
                                                        <span>{cartItem.productDetails?.name || 'Product Name'}</span>
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
                                ))
                            ) : (
                                <tr><td colSpan="7">No products in order details yet.</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
            {isModalOpen && (
                <Modal onClose={closeProductModal} contentState="slide">
                    <ViewProduct productId={selectedProductId} />
                </Modal>
            )}
        </>
    );
}

export default OrderDetails;