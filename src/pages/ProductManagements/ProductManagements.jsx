// ProductManagements.jsx
import React, { useState, useMemo, useEffect } from 'react';
import ReactPaginate from 'react-paginate';
import { FaTrash, FaEdit, FaPlus, FaFilter, FaSearch } from 'react-icons/fa';
import CustomCheckbox from '../../components/CustomComponents/CustomCheckbox/CustomCheckbox';
import CustomRadio from '../../components/CustomComponents/CustomRadio/CustomRadio';
import Modal from '../../components/Modal/Modal'; // Import your Modal component
import '../ManagementsStyles.css'; // Import the consolidated CSS
import { useNavigate } from 'react-router-dom';
import useApi from '../../hooks/useApi'; // Import the useApi hook (assuming it exists)
import { useDispatch } from 'react-redux'; // Import useDispatch
import { setProductForEdit } from '../../redux/editProductSlice'; // Import the action

function ProductManagements() {
    const navigate = useNavigate();
    const dispatch = useDispatch(); // Initialize useDispatch

    const { callApi, isLoading: apiLoading } = useApi(); // Use the useApi hook

    // State variables
    const [products, setProducts] = useState([]);
    const [selected, setSelected] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [totalProducts, setTotalProducts] = useState(0);

    // Loading states
    const [isInitialLoading, setIsInitialLoading] = useState(true);
    const [operationLoading, setOperationLoading] = useState(false);
    const [isError, setIsError] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');

    // Main Filter states
    const [filterSale, setFilterSale] = useState('all'); // 'all', 'yes', 'no'
    const [filterDate, setFilterDate] = useState({
        from: '',
        to: '',
    });
    const [filterQuantity, setFilterQuantity] = useState('all'); // Updated to include 'all'
    const [filterTags, setFilterTags] = useState([]); // Array of selected tags
    const [filterPrice, setFilterPrice] = useState({
        from: '',
        to: '',
    });

    // Temporary Filter states for modal
    const [tempFilterSale, setTempFilterSale] = useState(filterSale);
    const [tempFilterDate, setTempFilterDate] = useState({ ...filterDate });
    const [tempFilterQuantity, setTempFilterQuantity] = useState(filterQuantity); // Updated to include 'all'
    const [tempFilterTags, setTempFilterTags] = useState([...filterTags]);
    const [tempFilterPrice, setTempFilterPrice] = useState({ ...filterPrice });

    const [itemsPerPage, setItemsPerPage] = useState(2);
    const [currentPage, setCurrentPage] = useState(0);

    // Modal state
    const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);

    const handleEditProduct = (product) => {
        dispatch(setProductForEdit(product)); // Dispatch the action with product data
        navigate(`/edit-product/${product._id}`); // You can still use the ID in the URL if needed for routing
    };


    // Fetch products from API
    useEffect(() => {
        const fetchProducts = async () => {
            setIsInitialLoading(true);
            setIsError(false);
            try {
                const response = await callApi({
                    url: `/products/list?search=${searchTerm}&skip=${currentPage * itemsPerPage}&limit=${itemsPerPage}&sort=asc`,
                    method: 'GET',
                    successMessage: 'Products fetched successfully!',
                    errorMessage: 'Error fetching products.',
                });

                if (response.isSuccess && response.data && response.data.products) {
                    setProducts(response.data.products);
                    setTotalProducts(response.data.pagination.total);
                } else {
                    console.error('API Error:', response.message);
                    setIsError(true);
                    setErrorMessage(response.message || 'Failed to fetch products');
                }
            } catch (error) {
                console.error('Fetch Products Error:', error);
                setIsError(true);
                setErrorMessage('Error fetching products.');
            } finally {
                setIsInitialLoading(false);
            }
        };

        fetchProducts();
    }, [callApi, currentPage, itemsPerPage, searchTerm]);

    // Filtering (client-side, consider server-side for large datasets)
    const filteredProducts = useMemo(() => {
        let filtered = [...products]; // Start with all fetched products

        // Filter Sale
        if (filterSale === 'yes') {
            filtered = filtered.filter((product) => product.sale > 0); // Assuming sale is a percentage or discount
        } else if (filterSale === 'no') {
            filtered = filtered.filter((product) => !product.sale || product.sale === 0);
        }

        // Filter Date Added (assuming createdAt field exists in your product data)
        if (filterDate.from && filterDate.to) {
            const from = new Date(filterDate.from);
            const to = new Date(filterDate.to);
            filtered = filtered.filter(
                (product) =>
                    new Date(product.createdAt) >= from &&
                    new Date(product.createdAt) <= to
            );
        }

        // Filter Quantity (based on the first property's sizes)
        if (filterQuantity === 'inStock') {
            filtered = filtered.filter((product) =>
                product.properties && product.properties.some(prop =>
                    prop.sizes.some(size => size.quantity > 0)
                )
            );
        } else if (filterQuantity === 'lowStock') {
            filtered = filtered.filter((product) =>
                product.properties && product.properties.some(prop =>
                    prop.sizes.some(size => size.quantity > 0 && size.quantity <= 20)
                )
            );
        } else if (filterQuantity === 'outOfStock') {
            filtered = filtered.filter((product) =>
                product.properties && product.properties.every(prop =>
                    prop.sizes.every(size => size.quantity === 0)
                )
            );
        }

        // Filter Tags
        if (filterTags.length > 0) {
            filtered = filtered.filter((product) =>
                product.tags.some(tag => filterTags.includes(tag))
            );
        }

        // Filter Price
        if (filterPrice.from && filterPrice.to) {
            const from = Number(filterPrice.from);
            const to = Number(filterPrice.to);
            filtered = filtered.filter(
                (product) => product.price >= from && product.price <= to
            );
        }

        return filtered;
    }, [
        products,
        filterSale,
        filterDate,
        filterQuantity,
        filterTags,
        filterPrice,
    ]);

    // Pagination
    const pageCount = Math.ceil(totalProducts / itemsPerPage);

    // Handlers
    const handleSelectAll = (e) => {
        if (e.target.checked) {
            setSelected(products.map((product) => product._id));
        } else {
            setSelected([]);
        }
    };

    const handleSelect = (id) => {
        setSelected((prev) =>
            prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
        );
    };

    const handleDeleteSelected = async () => {
        if (selected.length) {
            if (
                window.confirm(
                    `Are you sure you want to delete ${selected.length} selected product(s)?`
                )
            ) {
                setOperationLoading(true);
                const updatedProducts = products.filter(product => !selected.includes(product._id));
                setProducts(updatedProducts); // Optimistic update

                try {
                    const response = await callApi({
                        url: '/products/bulk-delete', // Or your bulk delete endpoint
                        method: 'POST',
                        dataReq: { productIds: selected },
                        successMessage: `${selected.length} products deleted successfully!`,
                        errorMessage: 'Error deleting selected products.',
                    });

                    if (!response.isSuccess) {
                        console.error('API Error:', response.message);
                        // Revert on failure
                        const revertedProducts = [...updatedProducts]; // Create a copy to avoid mutation issues
                        const productsToAddBack = products.filter(product => selected.includes(product._id));
                        revertedProducts.push(...productsToAddBack);
                        setProducts(revertedProducts.sort((a, b) => a.createdAt < b.createdAt ? -1 : 1)); // Re-sort if needed
                        alert(response.message);
                    } else {
                        setSelected([]);
                    }
                } catch (error) {
                    console.error('Error deleting products:', error);
                    // Revert on failure
                    const revertedProducts = [...updatedProducts];
                    const productsToAddBack = products.filter(product => selected.includes(product._id));
                    revertedProducts.push(...productsToAddBack);
                    setProducts(revertedProducts.sort((a, b) => a.createdAt < b.createdAt ? -1 : 1));
                    alert('An unexpected error occurred while deleting products.');
                } finally {
                    setOperationLoading(false);
                }
            }
        }
    };

    const handleAddNew = () => {
        navigate('/add-product'); // Navigate to the desired route
    };

    const handlePageChange = ({ selected }) => setCurrentPage(selected);

    // Clear all filters
    const clearFilters = () => {
        setFilterSale('all');
        setFilterDate({ from: '', to: '' });
        setFilterQuantity('all'); // Updated to reset to 'all'
        setFilterTags([]);
        setFilterPrice({ from: '', to: '' });

        // Also reset temporary filters
        setTempFilterSale('all');
        setTempFilterDate({ from: '', to: '' });
        setTempFilterQuantity('all'); // Updated to reset to 'all'
        setTempFilterTags([]);
        setTempFilterPrice({ from: '', to: '' });
    };

    // Handle filter form submission
    const applyFilters = (e) => {
        e.preventDefault();
        setFilterSale(tempFilterSale);
        setFilterDate(tempFilterDate);
        setFilterQuantity(tempFilterQuantity);
        setFilterTags(tempFilterTags);
        setFilterPrice(tempFilterPrice);
        setIsFilterModalOpen(false);
        setCurrentPage(0); // Reset to first page on filter
    };

    // Handle tag selection
    const handleTagChange = (e) => {
        const { value, checked } = e.target;
        if (checked) {
            setTempFilterTags((prev) => [...prev, value]);
        } else {
            setTempFilterTags((prev) => prev.filter((tag) => tag !== value));
        }
    };

    const handleSearchChange = (e) => {
        setSearchTerm(e.target.value);
        setCurrentPage(0); // Reset page on search
    };

    const handleDeleteSingleProduct = async (productId) => {
        if (window.confirm('Are you sure you want to delete this product?')) {
            setOperationLoading(true);
            const originalProducts = [...products]; // Keep a copy for potential rollback
            const updatedProducts = products.filter(p => p._id !== productId);
            setProducts(updatedProducts); // Optimistic update

            try {
                const response = await callApi({
                    url: `/products/delete/${productId}`, // Or your delete endpoint
                    method: 'DELETE',
                    successMessage: 'Product deleted successfully!',
                    errorMessage: 'Error deleting product.',
                });

                if (!response.isSuccess) {
                    console.error('API Error:', response.message);
                    setProducts(originalProducts); // Revert on failure
                    alert(response.message);
                }
            } catch (error) {
                console.error('Error deleting product:', error);
                setProducts(originalProducts); // Revert on failure
                alert('An unexpected error occurred while deleting the product.');
            } finally {
                setOperationLoading(false);
            }
        }
    };

    if (isInitialLoading) {
        return <div>Loading products...</div>;
    }

    if (isError) {
        return <div>Error fetching products: {errorMessage}</div>;
    }

    return (
        <div className="managements-container slide-in">
            <h1>Product Management</h1>

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
                            disabled={operationLoading}
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
                            placeholder="Search by product name..."
                            value={searchTerm}
                            onChange={handleSearchChange}
                            disabled={operationLoading}
                        />
                    </div>
                </div>

                {/* Right Controls: Filter Button, Delete Selected, Add New */}
                <div className="managements-right-controls">
                    {/* Filter Button */}
                    <button
                        className="managements-filter-btn"
                        onClick={() => setIsFilterModalOpen(true)}
                        title="Filter Products"
                        disabled={operationLoading}
                    >
                        <FaFilter />
                        <span className="managements-filter-btn-text">Filter</span>
                    </button>

                    {/* Delete Selected */}
                    <button
                        className={`managements-delete-selected-btn ${selected.length ? 'active' : ''}`}
                        disabled={!selected.length || operationLoading}
                        onClick={handleDeleteSelected}
                        title="Delete Selected"
                    >
                        <FaTrash />
                    </button>

                    {/* Add New */}
                    <button className="managements-add-new-btn" onClick={handleAddNew} disabled={operationLoading}>
                        <FaPlus style={{ marginRight: '0.5rem' }} />
                        Add
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
                        {/* Sale Filter */}
                        <div className="managements-filter-group">
                            <label htmlFor="filter-sale">Sale</label>
                            <div className='managements-between-inputs'>
                                <CustomRadio
                                    id="filter-sale-all"
                                    name="filter-sale"
                                    value="all"
                                    checked={tempFilterSale === 'all'}
                                    onChange={(e) => {
                                        setTempFilterSale(e.target.value);
                                    }}
                                    label="All"
                                    disabled={operationLoading}
                                />
                                <CustomRadio
                                    id="filter-sale-yes"
                                    name="filter-sale"
                                    value="yes"
                                    checked={tempFilterSale === 'yes'}
                                    onChange={(e) => {
                                        setTempFilterSale(e.target.value);
                                    }}
                                    label="On Sale"
                                    disabled={operationLoading}
                                />
                                <CustomRadio
                                    id="filter-sale-no"
                                    name="filter-sale"
                                    value="no"
                                    checked={tempFilterSale === 'no'}
                                    onChange={(e) => {
                                        setTempFilterSale(e.target.value);
                                    }}
                                    label="Not on Sale"
                                    disabled={operationLoading}
                                />
                            </div>
                        </div>

                        {/* Date Added Filter */}
                        <div className="managements-filter-group">
                            <label>Date Added</label>
                            <div className="managements-between-inputs">
                                <input
                                    className='managements-filter-date'
                                    type="date"
                                    value={tempFilterDate.from}
                                    onChange={(e) =>
                                        setTempFilterDate({ ...tempFilterDate, from: e.target.value })
                                    }
                                    disabled={operationLoading}
                                />
                                <span>and</span>
                                <input
                                    className='managements-filter-date'
                                    type="date"
                                    value={tempFilterDate.to}
                                    onChange={(e) =>
                                        setTempFilterDate({ ...tempFilterDate, to: e.target.value })
                                    }
                                    disabled={operationLoading}
                                />
                            </div>
                        </div>

                        {/* Quantity Filter */}
                        <div className="managements-filter-group">
                            <label>Quantity</label>
                            <div className="managements-between-inputs">
                                {/* Added "All" option here */}
                                <CustomRadio
                                    id="quantity-all"
                                    name="filter-quantity"
                                    value="all"
                                    checked={tempFilterQuantity === 'all'}
                                    onChange={(e) => setTempFilterQuantity(e.target.value)}
                                    label="All"
                                    disabled={operationLoading}
                                />
                                <CustomRadio
                                    id="quantity-inStock"
                                    name="filter-quantity"
                                    value="inStock"
                                    checked={tempFilterQuantity === 'inStock'}
                                    onChange={(e) => setTempFilterQuantity(e.target.value)}
                                    label="In Stock"
                                    disabled={operationLoading}
                                />
                                <CustomRadio
                                    id="quantity-lowStock"
                                    name="filter-quantity"
                                    value="lowStock"
                                    checked={tempFilterQuantity === 'lowStock'}
                                    onChange={(e) => setTempFilterQuantity(e.target.value)}
                                    label="Low Stock"
                                    disabled={operationLoading}
                                />
                                <CustomRadio
                                    id="quantity-outOfStock"
                                    name="filter-quantity"
                                    value="outOfStock"
                                    checked={tempFilterQuantity === 'outOfStock'}
                                    onChange={(e) => setTempFilterQuantity(e.target.value)}
                                    label="Out of Stock"
                                    disabled={operationLoading}
                                />
                            </div>
                        </div>

                        {/* Tag Filter */}
                        <div className="managements-filter-group">
                            <label>Tag</label>
                            <div className="managements-between-inputs">
                                { /* Assuming your product.tags is an array of strings */
                                    [...new Set(products.flatMap(product => product.tags))].map(tag => (
                                        <CustomCheckbox
                                            key={tag}
                                            id={`tag-${tag}`}
                                            name="filter-tag"
                                            value={tag}
                                            checked={tempFilterTags.includes(tag)}
                                            onChange={handleTagChange}
                                            label={tag}
                                            disabled={operationLoading}
                                        />
                                    ))
                                }
                            </div>
                        </div>

                        {/* Price Filter */}
                        <div className="managements-filter-group">
                            <label>Price</label>
                            <div className="managements-between-inputs">
                                <input
                                    className='management-filter-price-input'
                                    type="number"
                                    min="0"
                                    placeholder="From"
                                    value={tempFilterPrice.from}
                                    onChange={(e) =>
                                        setTempFilterPrice({ ...tempFilterPrice, from: e.target.value })
                                    }
                                    disabled={operationLoading}
                                />
                                <span>and</span>
                                <input
                                    className='management-filter-price-input'
                                    type="number"
                                    min="0"
                                    placeholder="To"
                                    value={tempFilterPrice.to}
                                    onChange={(e) =>
                                        setTempFilterPrice({ ...tempFilterPrice, to: e.target.value })
                                    }
                                    disabled={operationLoading}
                                />
                            </div>
                        </div>

                        {/* Filter Actions */}
                        <div className="managements-filter-actions">
                            <button type="submit" className="managements-apply-filters-btn" disabled={operationLoading}>
                                Apply Filters
                            </button>
                            <button
                                type="button"
                                className="managements-clear-filters-btn"
                                onClick={clearFilters}
                                disabled={operationLoading}
                            >
                                Clear Filters
                            </button>
                        </div>
                    </form>
                </Modal>
            )}

            {/* Product Table */}
            <div className="managements-table-container">
                <table>
                    <thead>
                        <tr>
                            <th>
                                <CustomCheckbox
                                    id="select-all"
                                    name="select-all"
                                    value="select-all"
                                    checked={
                                        products.length > 0 &&
                                        selected.length === products.length
                                    }
                                    onChange={handleSelectAll}
                                    disabled={operationLoading}
                                />
                            </th>
                            <th>ID</th>
                            <th className=''>Product</th>
                            <th>Price</th>
                            <th>Sale</th>
                            <th>Quantity</th>
                            <th>Date Added</th>
                            <th>Tag</th>
                            <th>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {products.length ? (
                            products.map((product) => (
                                <tr key={product._id}>
                                    <td>
                                        <CustomCheckbox
                                            id={`select-${product._id}`}
                                            name={`select-${product._id}`}
                                            value={product._id}
                                            checked={selected.includes(product._id)}
                                            onChange={() => handleSelect(product._id)}
                                            disabled={operationLoading}
                                        />
                                    </td>
                                    <td>{product._id}</td>
                                    <td>
                                        <div className='managements-products-name-container'>
                                            {product.images?.list && product.images.list.length > 0 && (
                                                <img src={product.images.list[product.images.mainImage || 0].url} alt={product.name} />
                                            )}
                                            <span>{product.name}</span>
                                        </div>
                                    </td>
                                    <td>${product.price.toFixed(2)}</td>
                                    <td>{product.sale > 0 ? `${product.sale}%` : 'No'}</td>
                                    <td>{product.properties && product.properties[0]?.sizes.reduce((sum, size) => sum + size.quantity, 0)}</td>
                                    <td>{new Date(product.createdAt).toLocaleDateString()}</td>
                                    <td>{product.tags.join(', ')}</td>
                                    <td>
                                        <div className='managements-action-btn-container'>
                                            <button
                                                className="managements-action-btn managements-edit-btn"
                                                title="Edit"
                                                disabled={operationLoading}
                                                onClick={() => handleEditProduct(product)} // Pass the entire product object
                                            >
                                                <FaEdit />
                                            </button>
                                            <button
                                                className="managements-action-btn managements-delete-btn"
                                                title="Delete"
                                                onClick={() => handleDeleteSingleProduct(product._id)}
                                                disabled={operationLoading}
                                            >
                                                <FaTrash />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="9">No products found.</td>
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
                    disabled={operationLoading}
                />
            )}
        </div>
    );
}

export default ProductManagements;