// OrderDetailsModal.jsx
import React from 'react';
import Modal from '../../components/Modal/Modal';
import './OrderDetailsModal.css'; // Ensure this CSS file exists for styling

const OrderDetailsModal = ({ order, onClose }) => { // Accept onClose as a prop
    return (
        <Modal contentState="order-details-modal" onClose={onClose}> {/* Pass onClose to Modal */}
            <div className="order-details-header">
                <h2>Order Details - ID: {order.orderId}</h2>
                {/* Close button is handled by the Modal component */}
            </div>
            <div className="order-details-body">
                <p><strong>Order Date:</strong> {order.orderDate}</p>
                <p><strong>Transaction Number:</strong> {order.transactionNumber}</p>
                <p><strong>User Email:</strong> {order.userEmail}</p>
                <p><strong>Order Status:</strong> {order.orderStatus}</p>
                <p><strong>Order Price:</strong> ${order.orderPrice.toFixed(2)}</p>

                <h3>Products</h3>
                <div className="products-table-container">
                    <table>
                        <thead>
                            <tr>
                                <th>Product ID</th>
                                <th>Product Name</th>
                                <th>Main Image</th>
                                <th>Quantity</th>
                                <th>Price Unit ($)</th>
                                <th>Full Price ($)</th>
                                <th>Colour</th>
                                <th>Size</th>
                            </tr>
                        </thead>
                        <tbody>
                            {order.products.map((product, index) => (
                                <tr key={index}>
                                    <td>{product.productId}</td>
                                    <td>{product.productName}</td>
                                    <td>
                                        <img
                                            src={product.productImage}
                                            alt={product.productName}
                                            className="product-image"
                                        />
                                    </td>
                                    <td>{product.quantity}</td>
                                    <td>${product.priceUnit.toFixed(2)}</td>
                                    <td>${product.fullPrice.toFixed(2)}</td>
                                    <td>{product.colour}</td>
                                    <td>{product.size}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </Modal>
    );
};

export default OrderDetailsModal;