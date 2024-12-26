// TransactionsManagement.jsx
import React, { useState, useMemo } from 'react';
import ReactPaginate from 'react-paginate';
import { FaFilter, FaSearch, FaEye } from 'react-icons/fa'; // Removed FaEdit, FaPlus
import Modal from '../../components/Modal/Modal'; // Ensure you have a Modal component
import CustomRadio from '../../components/CustomComponents/CustomRadio/CustomRadio'; // Import CustomRadio
import '../ManagementsStyles.css'; // Import the consolidated CSS

// Function to generate dummy transactions
const generateDummyTransactions = (count) =>
    Array.from({ length: count }, (_, i) => {
        const randomDate = new Date(
            Date.now() - Math.floor(Math.random() * 10000000000)
        );
        const amount = parseFloat((Math.random() * 1000).toFixed(2));
        return {
            id: i + 1,
            transactionDate: randomDate.toISOString().slice(0, 10),
            transactionId: 1000 + i,
            transactionStatus: ['Pending', 'Completed', 'Failed'][i % 3],
            userId: 500 + i,
            username: `User${i + 1}`,
            userEmail: `user${i + 1}@example.com`,
            amount: amount,
            orderId: 2000 + i,
            paymentMethod: ['Credit Card', 'PayPal', 'Bank Transfer'][i % 3],
        };
    });

function TransactionsManagement() {
    // State variables
    const [transactions, setTransactions] = useState(generateDummyTransactions(100));
    const [searchTerm, setSearchTerm] = useState('');

    // Pagination
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const [currentPage, setCurrentPage] = useState(0);

    // Modal state
    const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);

    // Existing Filtering states
    const [filterStatus, setFilterStatus] = useState('all');
    const [filterPaymentMethod, setFilterPaymentMethod] = useState('all');

    // New Filtering states for Transaction Date and Amount
    const [filterDateFrom, setFilterDateFrom] = useState('');
    const [filterDateTo, setFilterDateTo] = useState('');
    const [filterAmountMin, setFilterAmountMin] = useState('');
    const [filterAmountMax, setFilterAmountMax] = useState('');

    // Temporary Filter states for modal
    const [tempFilterStatus, setTempFilterStatus] = useState(filterStatus);
    const [tempFilterPaymentMethod, setTempFilterPaymentMethod] = useState(filterPaymentMethod);
    const [tempFilterDateFrom, setTempFilterDateFrom] = useState(filterDateFrom);
    const [tempFilterDateTo, setTempFilterDateTo] = useState(filterDateTo);
    const [tempFilterAmountMin, setTempFilterAmountMin] = useState(filterAmountMin);
    const [tempFilterAmountMax, setTempFilterAmountMax] = useState(filterAmountMax);

    // Filtering and searching
    const filteredTransactions = useMemo(() => {
        let filtered = transactions;

        // Search by Transaction ID
        if (searchTerm.trim() !== '') {
            filtered = filtered.filter((transaction) =>
                transaction.transactionId.toString().includes(searchTerm.trim())
            );
        }

        // Filter Transaction Status
        if (filterStatus !== 'all') {
            filtered = filtered.filter(
                (transaction) => transaction.transactionStatus === filterStatus
            );
        }

        // Filter Payment Method
        if (filterPaymentMethod !== 'all') {
            filtered = filtered.filter(
                (transaction) => transaction.paymentMethod === filterPaymentMethod
            );
        }

        // Filter Transaction Date
        if (filterDateFrom) {
            filtered = filtered.filter(
                (transaction) => new Date(transaction.transactionDate) >= new Date(filterDateFrom)
            );
        }
        if (filterDateTo) {
            filtered = filtered.filter(
                (transaction) => new Date(transaction.transactionDate) <= new Date(filterDateTo)
            );
        }

        // Filter Amount
        if (filterAmountMin !== '') {
            filtered = filtered.filter(
                (transaction) => transaction.amount >= parseFloat(filterAmountMin)
            );
        }
        if (filterAmountMax !== '') {
            filtered = filtered.filter(
                (transaction) => transaction.amount <= parseFloat(filterAmountMax)
            );
        }

        return filtered;
    }, [
        transactions,
        searchTerm,
        filterStatus,
        filterPaymentMethod,
        filterDateFrom,
        filterDateTo,
        filterAmountMin,
        filterAmountMax,
    ]);

    // Pagination calculations
    const pageCount = Math.ceil(filteredTransactions.length / itemsPerPage);
    const currentItems = filteredTransactions.slice(
        currentPage * itemsPerPage,
        currentPage * itemsPerPage + itemsPerPage
    );

    // Handle page change
    const handlePageChange = ({ selected }) => setCurrentPage(selected);

    // Clear all filters
    const clearFilters = () => {
        setFilterStatus('all');
        setFilterPaymentMethod('all');
        setFilterDateFrom('');
        setFilterDateTo('');
        setFilterAmountMin('');
        setFilterAmountMax('');

        // Also reset temporary filters
        setTempFilterStatus('all');
        setTempFilterPaymentMethod('all');
        setTempFilterDateFrom('');
        setTempFilterDateTo('');
        setTempFilterAmountMin('');
        setTempFilterAmountMax('');
    };

    // Handle filter form submission
    const applyFilters = (e) => {
        e.preventDefault();
        setFilterStatus(tempFilterStatus);
        setFilterPaymentMethod(tempFilterPaymentMethod);
        setFilterDateFrom(tempFilterDateFrom);
        setFilterDateTo(tempFilterDateTo);
        setFilterAmountMin(tempFilterAmountMin);
        setFilterAmountMax(tempFilterAmountMax);
        setIsFilterModalOpen(false);
        setCurrentPage(0); // Reset to first page on filter
    };

    return (
        <div className="managements-container slide-in">
            <h1>Transactions Management</h1>

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

                    {/* Search Input with Icon */}
                    <div className="managements-search-input-container">
                        <FaSearch className="managements-search-icon" />
                        <input
                            type="text"
                            className="managements-search-input"
                            placeholder="Search by Transaction ID..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                {/* Right Controls: Only Filter Button */}
                <div className="managements-right-controls">
                    {/* Filter Button */}
                    <button
                        className="managements-filter-btn"
                        onClick={() => setIsFilterModalOpen(true)}
                        title="Filter Transactions"
                    >
                        <FaFilter />
                        <span className="managements-filter-btn-text">Filter</span>
                    </button>
                </div>
            </div>

            {/* Filter Modal */}
            {isFilterModalOpen && (
                <Modal
                    onClose={() => setIsFilterModalOpen(false)}
                    contentState="filter-modal"
                >
                    <h2>Advanced Filters</h2>
                    <form onSubmit={applyFilters} className="managements-filter-form">
                        {/* Transaction Status Filter */}
                        <div className="managements-filter-group">
                            <label>Transaction Status</label>
                            <div className="managements-between-inputs">
                                {/* Added CustomRadio components */}
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
                                    id="status-failed"
                                    name="filter-status"
                                    value="Failed"
                                    checked={tempFilterStatus === 'Failed'}
                                    onChange={(e) => setTempFilterStatus(e.target.value)}
                                    label="Failed"
                                />
                            </div>
                        </div>

                        {/* Payment Method Filter */}
                        <div className="managements-filter-group">
                            <label>Payment Method</label>
                            <div className="managements-between-inputs">
                                {/* Added CustomRadio components */}
                                <CustomRadio
                                    id="payment-all"
                                    name="filter-payment-method"
                                    value="all"
                                    checked={tempFilterPaymentMethod === 'all'}
                                    onChange={(e) => setTempFilterPaymentMethod(e.target.value)}
                                    label="All"
                                />
                                <CustomRadio
                                    id="payment-credit-card"
                                    name="filter-payment-method"
                                    value="Credit Card"
                                    checked={tempFilterPaymentMethod === 'Credit Card'}
                                    onChange={(e) => setTempFilterPaymentMethod(e.target.value)}
                                    label="Credit Card"
                                />
                                <CustomRadio
                                    id="payment-paypal"
                                    name="filter-payment-method"
                                    value="PayPal"
                                    checked={tempFilterPaymentMethod === 'PayPal'}
                                    onChange={(e) => setTempFilterPaymentMethod(e.target.value)}
                                    label="PayPal"
                                />
                                <CustomRadio
                                    id="payment-bank-transfer"
                                    name="filter-payment-method"
                                    value="Bank Transfer"
                                    checked={tempFilterPaymentMethod === 'Bank Transfer'}
                                    onChange={(e) => setTempFilterPaymentMethod(e.target.value)}
                                    label="Bank Transfer"
                                />
                            </div>
                        </div>

                        {/* Transaction Date Filter */}
                        <div className="managements-filter-group">
                            <label>Transaction Date</label>
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

                        {/* Amount Filter */}
                        <div className="managements-filter-group">
                            <label>Amount ($)</label>
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
                </Modal>
            )}

            {/* Transactions Table */}
            <div className="managements-table-container">
                <table>
                    <thead>
                        <tr>
                            <th>Transaction Date</th>
                            <th>Transaction ID</th>
                            <th>Status</th>
                            <th>User ID</th>
                            <th>Username</th>
                            <th>User Email</th>
                            <th>Amount</th>
                            <th>Order ID</th>
                            <th>Payment Method</th>
                            <th>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {currentItems.length ? (
                            currentItems.map((transaction) => (
                                <tr key={transaction.id}>
                                    <td>{transaction.transactionDate}</td>
                                    <td>{transaction.transactionId}</td>
                                    <td>{transaction.transactionStatus}</td>
                                    <td>{transaction.userId}</td>
                                    <td>{transaction.username}</td>
                                    <td>{transaction.userEmail}</td>
                                    <td>${transaction.amount.toFixed(2)}</td>
                                    <td>{transaction.orderId}</td>
                                    <td>{transaction.paymentMethod}</td>
                                    <td>
                                        <div className='managements-action-btn-container'>
                                            {/* View Order Button */}
                                            <button
                                                className="managements-action-btn managements-view-btn"
                                                title="View Order"
                                                onClick={() => {
                                                    // Implement the view order functionality here
                                                    alert(`Viewing order ID: ${transaction.orderId}`);
                                                }}
                                            >
                                                <FaEye />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="10">No transactions found.</td>
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
                    containerClassName={'managements-pagination'}
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

export default TransactionsManagement;