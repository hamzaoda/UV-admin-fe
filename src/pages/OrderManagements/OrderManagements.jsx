// OrderManagement.jsx
import React, { useState, useMemo, useEffect } from 'react';
import ReactPaginate from 'react-paginate';
import { FaFilter, FaSearch, FaEye } from 'react-icons/fa'; // Removed FaEdit, FaPlus
import { useNavigate } from 'react-router-dom'; // Import useNavigate
import Modal from '../../components/Modal/Modal'; // Ensure you have a Modal component
import CustomRadio from '../../components/CustomComponents/CustomRadio/CustomRadio'; // Import CustomRadio
import '../ManagementsStyles.css'; // Import the consolidated CSS
import useApi from '../../hooks/useApi'; // Assuming you have a useApi hook

function OrderManagement() {
    // State variables
    const [orders, setOrders] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [totalOrders, setTotalOrders] = useState(0);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Pagination
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const [currentPage, setCurrentPage] = useState(0);

    // Modal state (only for filter now)
    const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);

    // Filter states
    const [filterStatus, setFilterStatus] = useState(''); // Changed default to ''
    const [filterDateFrom, setFilterDateFrom] = useState('');
    const [filterDateTo, setFilterDateTo] = useState('');
    const [filterAmountMin, setFilterAmountMin] = useState('');
    const [filterAmountMax, setFilterAmountMax] = useState('');

    // Temporary filter states for modal
    const [tempFilterStatus, setTempFilterStatus] = useState(filterStatus);
    const [tempFilterDateFrom, setTempFilterDateFrom] = useState(filterDateFrom);
    const [tempFilterDateTo, setTempFilterDateTo] = useState(filterDateTo);
    const [tempFilterAmountMin, setTempFilterAmountMin] = useState(filterAmountMin);
    const [tempFilterAmountMax, setTempFilterAmountMax] = useState(filterAmountMax);

    // Navigation hook
    const navigate = useNavigate();
    const { callApi } = useApi(); // Use the useApi hook

    // Function to fetch orders from the backend
    const fetchOrders = async () => {
        setLoading(true);
        setError(null);
        try {
            const params = new URLSearchParams();
            params.append('skip', currentPage * itemsPerPage);
            params.append('limit', itemsPerPage);
            if (searchTerm) params.append('search', searchTerm);
            if (filterStatus) params.append('status', filterStatus);
            if (filterDateFrom) params.append('dateFrom', filterDateFrom);
            if (filterDateTo) params.append('dateTo', filterDateTo);
            if (filterAmountMin) params.append('amountMin', filterAmountMin);
            if (filterAmountMax) params.append('amountMax', filterAmountMax);

            const response = await callApi({
                url: `orders/list/?${params.toString()}`, // Construct URL with params
                method: 'GET',
                successMessage: 'Orders fetched successfully!',
                errorMessage: 'Failed to fetch orders.',
            });

            if (response.isSuccess && response.data) {
                setOrders(response.data.orders);
                setTotalOrders(response.data.pagination?.total || 0); // Access total from pagination
            } else {
                setError(response.message || 'Failed to fetch orders');
            }
        } catch (err) {
            setError('Error fetching orders.');
            console.error("Error fetching orders:", err);
        } finally {
            setLoading(false);
        }
    };

    // Fetch orders on component mount and when dependencies change
    useEffect(() => {
        fetchOrders();
    }, [currentPage, itemsPerPage, searchTerm, filterStatus, filterDateFrom, filterDateTo, filterAmountMin, filterAmountMax]);

    // Pagination calculations
    const pageCount = Math.ceil(totalOrders / itemsPerPage);
    const currentItems = orders; // Data is already filtered on the backend

    // Handle page change
    const handlePageChange = ({ selected }) => setCurrentPage(selected);

    // Clear all filters
    const clearFilters = () => {
        setFilterStatus('');
        setFilterDateFrom('');
        setFilterDateTo('');
        setFilterAmountMin('');
        setFilterAmountMax('');

        // Reset temporary filters
        setTempFilterStatus('');
        setTempFilterDateFrom('');
        setTempFilterDateTo('');
        setTempFilterAmountMin('');
        setTempFilterAmountMax('');
        setCurrentPage(0); // Reset page after clearing filters
    };

    // Apply filters
    const applyFilters = (e) => {
        e.preventDefault();
        setFilterStatus(tempFilterStatus);
        setFilterDateFrom(tempFilterDateFrom);
        setFilterDateTo(tempFilterDateTo);
        setFilterAmountMin(tempFilterAmountMin);
        setFilterAmountMax(tempFilterAmountMax);
        setIsFilterModalOpen(false);
        setCurrentPage(0); // Reset to first page on filter
    };

    // Handle navigating to order details page
    const handleViewOrder = (order) => {
        navigate(`/order/${order._id}`, { state: { order } }); // Pass the order object in state, use _id
    };

    if (loading) {
        return <div>Loading orders...</div>;
    }

    if (error) {
        return <div>Error fetching orders: {error}</div>;
    }

    return (
        <div className="managements-container slide-in">
            <h1>Order Management</h1>

            {/* Controls */}
            <div className="managements-controls">
                {/* Left Controls: Items Per Page and Search */}
                <div className="managements-left-controls">
                    {/* Items Per Page */}
                    <div className="managements-items-per-page">
                        <label htmlFor="items-per-page">Show</label>
                        <select
                            id="items-per-page"
                            value={itemsPerPage}
                            onChange={(e) => {
                                setItemsPerPage(Number(e.target.value));
                                setCurrentPage(0); // Reset to first page
                            }}
                        >
                            <option value={10}>10</option>
                            <option value={25}>25</option>
                            <option value={50}>50</option>
                        </select>
                    </div>

                    {/* Search Input */}
                    <div className="managements-search-input-container">
                        <FaSearch className="managements-search-icon" />
                        <input
                            type="text"
                            className="managements-search-input"
                            placeholder="Search by anything..."
                            value={searchTerm}
                            onChange={(e) => {
                                setSearchTerm(e.target.value);
                                setCurrentPage(0); // Reset page on search
                            }}
                        />
                    </div>
                </div>

                {/* Right Controls: Only Filter Button */}
                <div className="managements-right-controls">
                    <button
                        className="managements-filter-btn"
                        onClick={() => setIsFilterModalOpen(true)}
                        title="Filter Orders"
                    >
                        <FaFilter />
                        <span className="managements-filter-btn-text">Filter</span>
                    </button>
                </div>
            </div>

            {/* Filter Modal */}
            {isFilterModalOpen && (
                <Modal onClose={() => setIsFilterModalOpen(false)} contentState="filter-modal">
                    <div className="">
                        <h2>Advanced Filters</h2>
                        <form onSubmit={applyFilters} className="managements-filter-form">
                            {/* Order Status Filter */}
                            <div className="managements-filter-group">
                                <label>Order Status</label>
                                <div className="managements-between-inputs">
                                    <CustomRadio
                                        id="status-all"
                                        name="filter-status"
                                        value=""
                                        checked={tempFilterStatus === ''}
                                        onChange={(e) => setTempFilterStatus(e.target.value)}
                                        label="All"
                                    />
                                    <CustomRadio
                                        id="status-pending"
                                        name="filter-status"
                                        value="Pending"
                                        checked={tempFilterStatus === 'Pending'}
                                        onChange={(e) => setTempFilterStatus(e.target.value)}
                                        label="Pending"
                                    />
                                    <CustomRadio
                                        id="status-completed"
                                        name="filter-status"
                                        value="Completed"
                                        checked={tempFilterStatus === 'Completed'}
                                        onChange={(e) => setTempFilterStatus(e.target.value)}
                                        label="Completed"
                                    />
                                    <CustomRadio
                                        id="status-cancelled"
                                        name="filter-status"
                                        value="Cancelled"
                                        checked={tempFilterStatus === 'Cancelled'}
                                        onChange={(e) => setTempFilterStatus(e.target.value)}
                                        label="Cancelled"
                                    />
                                    <CustomRadio
                                        id="status-shipped"
                                        name="filter-status"
                                        value="Shipped"
                                        checked={tempFilterStatus === 'Shipped'}
                                        onChange={(e) => setTempFilterStatus(e.target.value)}
                                        label="Shipped"
                                    />
                                </div>
                            </div>

                            {/* Order Date Filter */}
                            <div className="managements-filter-group">
                                <label>Order Date</label>
                                <div className="managements-date-range">
                                    <input
                                        type="date"
                                        value={tempFilterDateFrom}
                                        onChange={(e) => setTempFilterDateFrom(e.target.value)}
                                        placeholder="From"
                                    />
                                    <span>to</span>
                                    <input
                                        type="date"
                                        value={tempFilterDateTo}
                                        onChange={(e) => setTempFilterDateTo(e.target.value)}
                                        placeholder="To"
                                    />
                                </div>
                            </div>

                            {/* Order Amount Filter */}
                            <div className="managements-filter-group">
                                <label>Order Amount ($)</label>
                                <div className="managements-amount-range">
                                    <input
                                        type="number"
                                        min="0"
                                        step="0.01"
                                        value={tempFilterAmountMin}
                                        onChange={(e) => setTempFilterAmountMin(e.target.value)}
                                        placeholder="Min"
                                    />
                                    <span>to</span>
                                    <input
                                        type="number"
                                        min="0"
                                        step="0.01"
                                        value={tempFilterAmountMax}
                                        onChange={(e) => setTempFilterAmountMax(e.target.value)}
                                        placeholder="Max"
                                    />
                                </div>
                            </div>

                            {/* Filter Actions */}
                            <div className="managements-filter-actions">
                                <button type="submit" className="managements-apply-filters-btn">
                                    Apply Filters
                                </button>
                                <button
                                    type="button"
                                    className="managements-clear-filters-btn"
                                    onClick={clearFilters}
                                >
                                    Clear Filters
                                </button>
                            </div>
                        </form>
                    </div>
                </Modal>
            )}

            {/* Orders Table */}
            <div className="managements-table-container fade-in">
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
                                    {/* Assuming you might add a status field to your order model */}
                                    <td>{order.orderStatus || 'Processing'}</td>
                                    <td>
                                        <div className="managements-action-btn-container">
                                            <button
                                                className="managements-action-btn managements-view-btn"
                                                title="view Order"
                                                onClick={() => handleViewOrder(order)}
                                            >
                                                <FaEye />
                                            </button>
                                        </div>
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
            {pageCount > 1 && (
                <ReactPaginate
                    previousLabel={'<'}
                    nextLabel={'>'}
                    breakLabel={'...'}
                    pageCount={pageCount}
                    marginPagesDisplayed={2}
                    pageRangeDisplayed={3}
                    onPageChange={handlePageChange}
                    containerClassName={'managements-pagination fade-in'}
                    activeClassName={'active'}
                    disabledClassName={'disabled'}
                    previousClassName={'managements-pagination-btn'}
                    nextClassName={'managements-pagination-btn'}
                    pageClassName={'managements-pagination-btn'}
                    breakClassName={'managements-pagination-btn'}
                    previousLinkClassName={'managements-pagination-btn'}
                    nextLinkClassName={'managements-pagination-btn'}
                    pageLinkClassName={'managements-pagination-btn'}
                    breakLinkClassName={'managements-pagination-btn'}
                    forcePage={currentPage}
                />
            )}
        </div>
    );
}

export default OrderManagement;