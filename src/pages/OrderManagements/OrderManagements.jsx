// OrderManagement.jsx
import { useState, useEffect } from 'react';
import ReactPaginate from 'react-paginate';
import { FaFilter, FaEye, FaCheck, FaTimes, FaClock, FaTruck } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import '../ManagementsStyles.css';
import './OrderManagements.css';
import useApi from '../../hooks/useApi';
import LoadingOverlay from '../../components/LoadingOverlay/LoadingOverlay'; // ADDED: Import LoadingOverlay

function OrderManagement() {
    // Assuming statusOptions are predefined as per your requirement and backend allows these statuses
    const statusOptions = [
        { value: 'processing', label: 'Processing', icon: <FaClock /> },
        { value: 'on delivery', label: 'On Delivery', icon: <FaTruck /> },
        { value: 'completed', label: 'Completed', icon: <FaCheck /> },
        { value: 'canceled', label: 'Canceled', icon: <FaTimes /> },
    ];

    const [orders, setOrders] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [totalOrders, setTotalOrders] = useState(0);
    const [error, setError] = useState(null);

    const [itemsPerPage, setItemsPerPage] = useState(10);
    const [currentPage, setCurrentPage] = useState(0);

    const navigate = useNavigate();
    const { callApi, isLoading } = useApi(); // ADDED: isLoading

    const fetchOrders = async () => {
        setError(null);
        try {
            const params = new URLSearchParams();
            params.append('skip', currentPage * itemsPerPage);
            params.append('limit', itemsPerPage);
            if (searchTerm) params.append('search', searchTerm);

            const apiUrl = `orders/list/?${params.toString()}`;
            console.log("API Request URL:", apiUrl); // DEBUG: Log the API request URL

            const response = await callApi({
                url: apiUrl,
                method: 'GET',
                successMessage: 'Orders fetched successfully!',
                errorMessage: 'Failed to fetch orders.',
            });

            console.log("API Response:", response); // DEBUG: Log the entire API response

            if (response.isSuccess && response.data) {
                setOrders(response.data.orders);
                setTotalOrders(response.data.pagination?.total || 0);
                console.log("Fetched Orders:", response.data.orders); // DEBUG: Log fetched orders
                console.log("Total Orders from API:", response.data.pagination?.total); // DEBUG: Log total orders from API
            } else {
                setError(response.message || 'Failed to fetch orders');
                console.error("API Error:", response.message); // DEBUG: Log API error message
            }
        } catch (err) {
            setError('Error fetching orders.');
            console.error("Error fetching orders:", err); // DEBUG: Log fetch orders error
        }
    };

    const updateOrderStatus = async (orderId, newStatus) => {
        try {
            const response = await callApi({
                url: `orders/${orderId}/status`,
                method: 'PUT',
                dataReq: { status: newStatus },
                successMessage: 'Order status updated successfully!',
                errorMessage: 'Failed to update order status.',
            });

            if (response.isSuccess) {
                setOrders(prevOrders => {
                    return prevOrders.map(order => {
                        if (order._id === orderId) {
                            return { ...order, status: newStatus };
                        }
                        return order;
                    });
                });
            } else {
                setError(response.message || 'Failed to update order status');
                console.error(`API Error for orderId: ${orderId}:`, response.message);
            }
        } catch (err) {
            setError('Error updating order status.');
            console.error("Error updating order status:", err);
        }
    };

    useEffect(() => {
        fetchOrders();
    }, [currentPage, itemsPerPage, searchTerm]);

    const pageCount = Math.ceil(totalOrders / itemsPerPage);
    const currentItems = orders;

    const handlePageChange = ({ selected }) => setCurrentPage(selected);

    const handleViewOrder = (order) => {
        navigate(`/order/${order._id}`, { state: { order } });
    };



    if (error) {
        return <div>Error fetching orders: {error}</div>;
    }

    return (
        <>
            <LoadingOverlay isLoading={isLoading} /> {/* ADDED: LoadingOverlay component */}
            <h1>Order Management</h1>

            <div className="managements-controls">
                <div className="managements-items-per-page">
                    <label htmlFor="items-per-page">Show</label>
                    <select
                        id="items-per-page"
                        value={itemsPerPage}
                        onChange={(e) => {
                            setItemsPerPage(Number(e.target.value));
                            setCurrentPage(0);
                        }}
                    >
                        <option value={10}>10</option>
                        <option value={25}>25</option>
                        <option value={50}>50</option>
                    </select>
                </div>

                <input
                    type="text"
                    className="managements-search-input"
                    placeholder="Search by anything..."
                    value={searchTerm}
                    onChange={(e) => {
                        setSearchTerm(e.target.value);
                        setCurrentPage(0);
                    }}
                />

                <button
                    className="managements-filter-btn"
                    title="Filter Orders"
                >
                    <FaFilter />
                </button>
            </div>

            <div className="table-container">
                <table>
                    <thead>
                        <tr>
                            <th>Order ID</th>
                            <th>Order Date</th>
                            <th>Customer Name</th>
                            <th>Customer Email</th>
                            <th>Total Items</th>
                            <th>Order Status</th>
                            <th>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {currentItems.length ? (
                            currentItems.map((order) => (
                                <tr key={order._id}>
                                    <td>{order.trackingId}</td>
                                    <td>{new Date(order.createdAt).toLocaleDateString()}</td>
                                    <td>{`${order.contactInformation?.firstName} ${order.contactInformation?.lastName}`}</td>
                                    <td>{order.contactInformation?.email}</td>
                                    <td>{order.cart?.reduce((sum, item) => sum + item.sizes.reduce((sizeSum, size) => sizeSum + size.quantity, 0), 0)}</td>
                                    <td>
                                        <div className="d-flex">
                                            {statusOptions.map((option, index) => {
                                                const isCurrentStatus = order.status === option.value;
                                                const isNextStatus = statusOptions.findIndex(s => s.value === order.status) < index;

                                                if (isCurrentStatus) {
                                                    return (
                                                        <span key={option.value} className={`btn status-label-${option.label.toLowerCase().replace(/\s+/g, '-')}`}>
                                                            {option.icon} {/* Display Icon */}
                                                        </span>
                                                    );
                                                } else if (isNextStatus && !['completed', 'canceled'].includes(order.status)) { // Only show next status buttons if not completed or canceled
                                                    return (
                                                        <button
                                                            key={option.value}
                                                            className="edit-btn"
                                                            onClick={() => updateOrderStatus(order._id, option.value)}
                                                            disabled={['completed', 'canceled'].includes(order.status)}
                                                        >
                                                            {option.icon} {/* Display Icon in Button */}
                                                        </button>
                                                    );
                                                } else {
                                                    return (
                                                        <button
                                                            key={option.value}
                                                            className="status-button-disabled" // Add a class for disabled button styling if needed
                                                            disabled
                                                        >
                                                            {option.icon} {/* Display Icon in Disabled Button */}
                                                        </button>
                                                    );
                                                }
                                            })}
                                        </div>
                                    </td>
                                    <td>
                                        <button
                                            className="view-btn"
                                            title="view Order"
                                            onClick={() => handleViewOrder(order)}
                                        >
                                            <FaEye />
                                        </button>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="7">No orders found.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Pagination */}
            <ReactPaginate
                previousLabel={'<'}
                nextLabel={'>'}
                breakLabel={'...'}
                pageCount={pageCount}
                marginPagesDisplayed={2}
                pageRangeDisplayed={3}
                onPageChange={handlePageChange}
                containerClassName={'managements-pagination'}
                activeClassName={'active'}
                disabledClassName={'disabled'}
                previousClassName={'managements-pagination-btn'}
                nextClassName={'managements-pagination-btn'}
                pageClassName={'managements-pagination-btn'}
                breakClassName={'managements-pagination-btn'}
                previousLinkClassName={'managements-pagination-a'}
                nextLinkClassName={'managements-pagination-a'}
                pageLinkClassName={'managements-pagination-a'}
                breakLinkClassName={'managements-pagination-a'}
                forcePage={currentPage}
            />
        </>
    );
}

export default OrderManagement;