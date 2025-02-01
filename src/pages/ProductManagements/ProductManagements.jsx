// ProductManagements.jsx
import React, { useState, useMemo, useEffect, useCallback } from 'react';
import ReactPaginate from 'react-paginate';
import { FaTrash, FaEdit, FaPlus, FaFilter, FaSearch, FaEye } from 'react-icons/fa';
import CustomCheckbox from '../../components/CustomComponents/CustomCheckbox/CustomCheckbox';
import CustomRadio from '../../components/CustomComponents/CustomRadio/CustomRadio';
import Modal from '../../components/Modal/Modal'; // Import your Modal component
import '../ManagementsStyles.css'; // Import the consolidated CSS
import { useNavigate } from 'react-router-dom';
import useApi from '../../hooks/useApi'; // Import the useApi hook (assuming it exists)
import { debounce } from 'lodash'; // Import debounce from lodash or similar utility
import { toast } from 'react-toastify'; // Import toast for notifications
import ViewProduct from '../../components/ViewProduct/ViewProduct'; // Import the new ViewProduct component

function ProductManagements() {
    const navigate = useNavigate();

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

    const [itemsPerPage, setItemsPerPage] = useState(10); // More reasonable default
    const [currentPage, setCurrentPage] = useState(0);

    // Modal state
    const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
    const [isViewProductModalOpen, setIsViewProductModalOpen] = useState(false);
    const [viewProductId, setViewProductId] = useState(null);

    const handleEditProduct = useCallback((product) => {
        navigate(`/edit-product/${product._id}`);
    }, [navigate]);

    // New handleViewProduct function
    const handleViewProduct = useCallback((productId) => {
        setViewProductId(productId);
        setIsViewProductModalOpen(true);
    }, [navigate]);

    const handleCloseViewProductModal = useCallback(() => {
        setIsViewProductModalOpen(false);
        setViewProductId(null);
    }, []);

    // Fetch products from API with filters and pagination
    const fetchProducts = useCallback(async (currentSearchTerm = '') => {
        setIsInitialLoading(true);
        setIsError(false);
        let url = `/products/list?skip=${currentPage * itemsPerPage}&limit=${itemsPerPage}&sort=asc`;

        if (currentSearchTerm) {
            url += `&search=${currentSearchTerm}`;
        }
        if (filterSale === 'yes') {
            url += '&sale=true';
        } else if (filterSale === 'no') {
            url += '&sale=false';
        }
        if (filterDate.from) {
            url += `&dateFrom=${filterDate.from}`;
        }
        if (filterDate.to) {
            url += `&dateTo=${filterDate.to}`;
        }
        if (filterQuantity === 'inStock') {
            url += '&quantityStatus=inStock';
        } else if (filterQuantity === 'lowStock') {
            url += '&quantityStatus=lowStock';
        } else if (filterQuantity === 'outOfStock') {
            url += '&quantityStatus=outOfStock';
        }
        if (filterTags.length > 0) {
            url += `&tags=${filterTags.join(',')}`;
        }
        if (filterPrice.from) {
            url += `&priceFrom=${filterPrice.from}`;
        }
        if (filterPrice.to) {
            url += `&priceTo=${filterPrice.to}`;
        }

        try {
            const response = await callApi({
                url,
                method: 'GET',
                errorMessage: 'Error fetching products.',
            });

            if (response.isSuccess && response.data && response.data.products) {
                setProducts(response.data.products);
                setTotalProducts(response.data.pagination.total);
            } else {
                console.error('API Error:', response.message);
                setIsError(true);
                setErrorMessage(response.message || 'Failed to fetch products');
                toast.error(response.message || 'Failed to fetch products');
            }
        } catch (error) {
            console.error('Fetch Products Error:', error);
            setIsError(true);
            setErrorMessage('Error fetching products.');
            toast.error('Error fetching products.');
        } finally {
            setIsInitialLoading(false);
        }
    }, [
        callApi,
        currentPage,
        itemsPerPage,
        filterSale,
        filterDate,
        filterQuantity,
        filterTags,
        filterPrice,
    ]);

    // Debounced function to fetch products
    const debouncedFetchProducts = useCallback(
        debounce((term) => {
            // This will be called after 1 second of no typing
            setCurrentPage(0); // Reset page on new search
            fetchProducts(term); // Call fetchProducts with the search term
        }, 750),
        [fetchProducts]
    );

    useEffect(() => {
        fetchProducts();
    }, [fetchProducts]);

    // Handlers
    const handleSelectAll = useCallback((e) => {
        if (e.target.checked) {
            setSelected(products.map((product) => product._id));
        } else {
            setSelected([]);
        }
    }, [products]);

    const handleSelect = useCallback((id) => {
        setSelected((prev) =>
            prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
        );
    }, []);

    const handleDeleteSelected = useCallback(async () => {
        if (selected.length) {
            if (
                window.confirm(
                    `Are you sure you want to delete ${selected.length} selected product(s)?`
                )
            ) {
                setOperationLoading(true);
                const selectedSet = new Set(selected);
                const previousProducts = products;
                setProducts(products.filter(product => !selectedSet.has(product._id))); // Optimistic update

                try {
                    const response = await callApi({
                        url: '/products/delete', // Modified URL to "/products/delete"
                        method: 'DELETE',
                        dataReq: { deletedProducts: selected }, // Modified payload key to "deletedProducts" and value to selected array
                        errorMessage: 'Error deleting selected products.',
                    });

                    if (!response.isSuccess) {
                        console.error('API Error:', response.message);
                        setProducts(previousProducts); // Revert on failure
                        toast.error(response.message);
                    } else {
                        setSelected([]);
                        toast.success(`${selected.length} products deleted successfully!`);
                    }
                } catch (error) {
                    console.error('Error deleting products:', error);
                    setProducts(previousProducts); // Revert on failure
                    toast.error('An unexpected error occurred while deleting products.');
                } finally {
                    setOperationLoading(false);
                }
            }
        }
    }, [callApi, selected, products]);

    const handleAddNew = useCallback(() => {
        navigate('/add-product'); // Navigate to the desired route
    }, [navigate]);

    const handlePageChange = useCallback(({ selected }) => {
        setCurrentPage(selected);
    }, []);

    // Clear all filters
    const clearFilters = useCallback(() => {
        setFilterSale('all');
        setFilterDate({ from: '', to: '' });
        setFilterQuantity('all');
        setFilterTags([]);
        setFilterPrice({ from: '', to: '' });

        setTempFilterSale('all');
        setTempFilterDate({ from: '', to: '' });
        setTempFilterQuantity('all');
        setTempFilterTags([]);
        setTempFilterPrice({ from: '', to: '' });
        setCurrentPage(0); // Reset to first page on filter clear
        fetchProducts(); // Fetch products after clearing filters
    }, [fetchProducts]);

    // Handle filter form submission
    const applyFilters = useCallback((e) => {
        e.preventDefault();
        setFilterSale(tempFilterSale);
        setFilterDate(tempFilterDate);
        setFilterQuantity(tempFilterQuantity);
        setFilterTags(tempFilterTags);
        setFilterPrice(tempFilterPrice);
        setIsFilterModalOpen(false);
        setCurrentPage(0); // Reset to first page on filter apply
        fetchProducts(); // Fetch products after applying filters
    }, [tempFilterDate, tempFilterPrice, tempFilterQuantity, tempFilterSale, tempFilterTags, fetchProducts]);

    // Handle tag selection
    const handleTagChange = useCallback((e) => {
        const { value, checked } = e.target;
        setTempFilterTags((prev) =>
            checked ? [...prev, value] : prev.filter((tag) => tag !== value)
        );
    }, []);

    const handleSearchChange = useCallback((value) => {
        setSearchTerm(value);
        debouncedFetchProducts(value); // Call the debounced fetch
    }, [debouncedFetchProducts]);

    const handleInputChange = (e) => {
        handleSearchChange(e.target.value);
    };

    const handleDeleteSingleProduct = useCallback(async (productId) => {
        if (window.confirm('Are you sure you want to delete this product?')) {
            setOperationLoading(true);
            const previousProducts = products;
            setProducts(products.filter(p => p._id !== productId)); // Optimistic update

            try {
                const response = await callApi({
                    url: `/products/delete`, // Modified URL to "/products/delete"
                    method: 'DELETE',
                    dataReq: { deletedProducts: [productId] }, // Modified payload key to "deletedProducts" and value to array with single productId
                    errorMessage: 'Error deleting product.',
                });

                if (!response.isSuccess) {
                    console.error('API Error:', response.message);
                    setProducts(previousProducts); // Revert on failure
                    toast.error(response.message);
                } else {
                    toast.success('Product deleted successfully!');
                }
            } catch (error) {
                console.error('Error deleting product:', error);
                setProducts(previousProducts); // Revert on failure
                toast.error('An unexpected error occurred while deleting the product.');
            } finally {
                setOperationLoading(false);
            }
        }
    }, [callApi, products]);

    const calculateTotalStock = useCallback((product) => {
        if (!product.properties) return 0;
        return product.properties.reduce((total, prop) => {
            return total + prop.sizes.reduce((sum, size) => sum + size.quantity, 0);
        }, 0);
    }, []);

    const filteredProducts = useMemo(() => products, [products]); // Now products are already filtered on the server

    const pageCount = Math.ceil(totalProducts / itemsPerPage);

    if (isInitialLoading) {
        return <div>Loading products...</div>;
    }

    if (isError) {
        return <div>Error fetching products: {errorMessage}</div>;
    }

    return (
        <>
            <h1>Product Management</h1>
            <div className="managements-container slide-in section-container">

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
                                <option value={5}>5</option>
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
                                onChange={handleInputChange}
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
                            {/* ... filter form */}
                        </form>
                    </Modal>
                )}

                {/* View Product Modal */}
                {isViewProductModalOpen && (
                    <Modal
                        onClose={handleCloseViewProductModal}
                        contentState="view-product-modal"
                    >
                        <ViewProduct productId={viewProductId} onClose={handleCloseViewProductModal} />
                    </Modal>
                )}

                {/* Product Table */}
                <div className="managements-table-container">
                    <table>
                        <thead>
                            <tr>
                                <th style={{ width: '5%' }}>
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
                                <th style={{ width: '25%' }}>Product</th>
                                <th style={{ width: '5%' }}>SKU</th>
                                <th style={{ width: '5%' }}>Price</th>
                                <th style={{ width: '5%' }}>Sale</th>
                                <th style={{ width: '10%' }}>Final Price</th>
                                <th style={{ width: '5%' }}>Stock</th>
                                <th style={{ width: '10%' }}>Date Added</th>
                                <th style={{ width: '15%' }}>Tag</th>
                                <th style={{ width: '5%' }}>Active</th>
                                <th style={{ width: '10%' }}>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredProducts.length ? (
                                filteredProducts.map((product) => (
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
                                        <td>
                                            <div className='managements-products-name-container'>
                                                {product.images.list && product.images.list.length > 0 && (
                                                    <img src={product.images.list[product.images.mainImage || 0].url} alt={product.name} />
                                                )}
                                                <span>{product.name}</span>
                                            </div>
                                        </td>
                                        <td>{product.productId}</td>
                                        <td>{product.price.toFixed(2)}</td>
                                        <td>{product.sale > 0 ? `${product.sale}%` : 'No'}</td>
                                        <td>{product.price - (product.price * product.sale / 100)}</td>
                                        <td>{calculateTotalStock(product)}</td>
                                        <td>{new Date(product.createdAt).toLocaleDateString()}</td>
                                        <td>
                                            <div className='managements-tags-container'>
                                                {product.tags.map(tag => (
                                                    <span key={tag} className='managements-tag'>{tag}</span>
                                                ))}
                                            </div>
                                        </td>
                                        <td>{product.isActive == true ? "T" : "F"}</td>
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
                                                <button
                                                    className="managements-action-btn managements-view-btn"
                                                    title="view Product"
                                                    onClick={() => handleViewProduct(product._id)}
                                                >
                                                    <FaEye />
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
            </div>
        </>
    );
}

export default ProductManagements;