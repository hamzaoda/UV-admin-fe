// OrderManagement.jsx
import React, { useState, useMemo } from 'react';
import ReactPaginate from 'react-paginate';
import { FaSearch, FaFilter, FaEye } from 'react-icons/fa';
import Modal from '../../components/Modal/Modal'; // Ensure you have a Modal component
import OrderDetailsModal from '../OrderDetails/OrderDetailsModal'; // New component to display order details
import CustomRadio from '../../components/CustomComponents/CustomRadio/CustomRadio'; // Import CustomRadio
import '../ManagementsStyles.css'; // Import the consolidated CSS

// Function to generate dummy orders with order items
const generateDummyOrders = (count) =>
    Array.from({ length: count }, (_, i) => {
        const randomDate = new Date(
            Date.now() - Math.floor(Math.random() * 10000000000)
        );
        const price = parseFloat((Math.random() * 1000).toFixed(2));
        const numberOfProducts = Math.floor(Math.random() * 5) + 1; // 1 to 5 products per order
        const products = Array.from({ length: numberOfProducts }, (_, j) => ({
            productId: 3000 + j + 1,
            productName: `Product ${j + 1}`,
            productImage: `https://via.placeholder.com/100?text=Product+${j + 1}`,
            quantity: Math.floor(Math.random() * 10) + 1, // 1 to 10
            priceUnit: parseFloat((Math.random() * 100).toFixed(2)),
            fullPrice: parseFloat(
                (Math.floor(Math.random() * 10 + 1) * (Math.random() * 100)).toFixed(2)
            ),
            colour: ['Red', 'Blue', 'Green', 'Black', 'White'][j % 5],
            size: ['S', 'M', 'L', 'XL'][j % 4],
        }));

        return {
            id: i + 1,
            orderId: 2000 + i,
            orderDate: randomDate.toISOString().slice(0, 10),
            transactionNumber: 1000 + i,
            orderStatus: ['Pending', 'Completed', 'Cancelled'][i % 3],
            userEmail: `user${i + 1}@example.com`,
            orderPrice: price,
            products,
        };
    });

function OrderManagement() {
    // State variables
    const [orders, setOrders] = useState(generateDummyOrders(100));
    const [searchTerm, setSearchTerm] = useState('');

    // Pagination
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const [currentPage, setCurrentPage] = useState(0);

    // Modal state
    const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
    const [isOrderDetailsModalOpen, setIsOrderDetailsModalOpen] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState(null);

    // Filter states
    const [filterStatus, setFilterStatus] = useState('all');
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

    // Filtering and searching
    const filteredOrders = useMemo(() => {
        let filtered = orders;

        // Search by Order ID
        if (searchTerm.trim() !== '') {
            filtered = filtered.filter((order) =>
                order.orderId.toString().includes(searchTerm.trim())
            );
        }

        // Filter by Order Status
        if (filterStatus !== 'all') {
            filtered = filtered.filter((order) => order.orderStatus === filterStatus);
        }

        // Filter by Order Date
        if (filterDateFrom && filterDateTo) {
            filtered = filtered.filter(
                (order) =>
                    new Date(order.orderDate) >= new Date(filterDateFrom) &&
                    new Date(order.orderDate) <= new Date(filterDateTo)
            );
        }

        // Filter by Order Amount
        if (filterAmountMin !== '') {
            filtered = filtered.filter(
                (order) => order.orderPrice >= parseFloat(filterAmountMin)
            );
        }
        if (filterAmountMax !== '') {
            filtered = filtered.filter(
                (order) => order.orderPrice <= parseFloat(filterAmountMax)
            );
        }

        return filtered;
    }, [
        orders,
        searchTerm,
        filterStatus,
        filterDateFrom,
        filterDateTo,
        filterAmountMin,
        filterAmountMax,
    ]);

    // Pagination calculations
    const pageCount = Math.ceil(filteredOrders.length / itemsPerPage);
    const currentItems = filteredOrders.slice(
        currentPage * itemsPerPage,
        currentPage * itemsPerPage + itemsPerPage
    );

    // Handle page change
    const handlePageChange = ({ selected }) => setCurrentPage(selected);

    // Clear all filters
    const clearFilters = () => {
        setFilterStatus('all');
        setFilterDateFrom('');
        setFilterDateTo('');
        setFilterAmountMin('');
        setFilterAmountMax('');

        // Reset temporary filters
        setTempFilterStatus('all');
        setTempFilterDateFrom('');
        setTempFilterDateTo('');
        setTempFilterAmountMin('');
        setTempFilterAmountMax('');
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

    // Handle opening order details modal
    const handleViewOrder = (order) => {
        setSelectedOrder(order);
        setIsOrderDetailsModalOpen(true);
    };

    // Handle closing order details modal
    const handleCloseOrderDetailsModal = () => {
        setIsOrderDetailsModalOpen(false);
        setSelectedOrder(null); // Optional: Clear the selected order
    };

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
                            placeholder="Search by Order ID..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
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
                                        value="all"
                                        checked={tempFilterStatus === 'all'}
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
                                        required
                                    />
                                    <span>to</span>
                                    <input
                                        type="date"
                                        value={tempFilterDateTo}
                                        onChange={(e) => setTempFilterDateTo(e.target.value)}
                                        placeholder="To"
                                        required
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

            {/* Order Details Modal */}
            {isOrderDetailsModalOpen && selectedOrder && (
                <OrderDetailsModal
                    order={selectedOrder}
                    onClose={handleCloseOrderDetailsModal} // Pass onClose handler
                />
            )}

            {/* Orders Table */}
            <div className="managements-table-container fade-in">
                <table>
                    <thead>
                        <tr>
                            <th>Order ID</th>
                            <th>Order Date</th>
                            <th>Transaction Number</th>
                            <th>User Email</th>
                            <th>Order Price</th>
                            <th>Order Status</th>
                            <th>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {currentItems.length ? (
                            currentItems.map((order) => (
                                <tr key={order.id}>
                                    <td>{order.orderId}</td>
                                    <td>{order.orderDate}</td>
                                    <td>{order.transactionNumber}</td>
                                    <td>{order.userEmail}</td>
                                    <td>${order.orderPrice.toFixed(2)}</td>
                                    <td>{order.orderStatus}</td>
                                    <td>
                                        <div className="managements-action-btn-container">
                                            <button
                                                className="managements-action-btn managements-view-btn"
                                                title="Show Order"
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