// ProductManagements.jsx
import { useState, useMemo, useEffect, useCallback } from 'react';
import ReactPaginate from 'react-paginate';
import { FaTrash, FaEdit, FaPlus, FaFilter, FaEye, FaCheck, FaTimes } from 'react-icons/fa';
import CustomCheckbox from '../../components/CustomComponents/CustomCheckbox/CustomCheckbox';
import Modal from '../../components/Modal/Modal'; // Import your Modal component
import '../ManagementsStyles.css'; // Import the consolidated CSS
import { useNavigate } from 'react-router-dom';
import useApi from '../../hooks/useApi'; // Import the useApi hook
import { debounce } from 'lodash'; // Import debounce from lodash
import { toast } from 'react-toastify'; // Import toast for notifications
import ViewProduct from '../../components/ViewProduct/ViewProduct'; // Import the new ViewProduct component
import LoadingOverlay from '../../components/LoadingOverlay/LoadingOverlay'; // ADDED: Import LoadingOverlay

function ProductManagements() {
    const navigate = useNavigate();

    const { callApi, isLoading } = useApi(); // Use the useApi hook, ADDED: isLoading

    // State variables
    const [products, setProducts] = useState([]);
    const [selected, setSelected] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [totalProducts, setTotalProducts] = useState(0);

    const [itemsPerPage, setItemsPerPage] = useState(10); // More reasonable default
    const [currentPage, setCurrentPage] = useState(0);

    // Modal state
    const [isViewProductModalOpen, setIsViewProductModalOpen] = useState(false);
    const [viewProductId, setViewProductId] = useState(null);

    const handleEditProduct = useCallback((product) => {
        navigate(`/edit-product/${product._id}`);
    }, [navigate]);

    // New handleViewProduct function
    const handleViewProduct = useCallback((productId) => {
        setViewProductId(productId);
        setIsViewProductModalOpen(true);
    }, []);

    const handleCloseViewProductModal = useCallback(() => {
        setIsViewProductModalOpen(false);
        setViewProductId(null);
    }, []);

    // Fetch products from API with filters and pagination
    const fetchProducts = useCallback(async (currentSearchTerm = '') => {

        let url = `/products/list?skip=${currentPage * itemsPerPage}&limit=${itemsPerPage}&sort=asc`;

        if (currentSearchTerm) {
            url += `&search=${currentSearchTerm}`;
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
                toast.error(response.message || 'Failed to fetch products');
            }
        } catch (error) {
            console.error('Fetch Products Error:', error);
            toast.error('Error fetching products.');
        }
    }, [
        callApi,
        currentPage,
        itemsPerPage,
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
                        // Refetch after successful deletion.  Very important!
                        fetchProducts();
                    }
                } catch (error) {
                    console.error('Error deleting products:', error);
                    setProducts(previousProducts); // Revert on failure
                    toast.error('An unexpected error occurred while deleting products.');
                }
            }
        }
    }, [callApi, selected, products, fetchProducts]);

    const handleAddNew = useCallback(() => {
        navigate('/add-product'); // Navigate to the desired route
    }, [navigate]);

    const handlePageChange = useCallback(({ selected }) => {
        setCurrentPage(selected);
    }, []);

    // Handle tag selection

    const handleSearchChange = useCallback((value) => {
        setSearchTerm(value);
        debouncedFetchProducts(value); // Call the debounced fetch
    }, [debouncedFetchProducts]);

    const handleInputChange = (e) => {
        handleSearchChange(e.target.value);
    };

    const handleDeleteSingleProduct = useCallback(async (productId) => {
        if (window.confirm('Are you sure you want to delete this product?')) {
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
                    // Refetch after successful deletion.  Very important!
                    fetchProducts();
                }
            } catch (error) {
                console.error('Error deleting product:', error);
                setProducts(previousProducts); // Revert on failure
                toast.error('An unexpected error occurred while deleting the product.');
            }
        }
    }, [callApi, products, fetchProducts]);

    const calculateTotalStock = useCallback((product) => {
        if (!product.properties) return 0;
        return product.properties.reduce((total, prop) => {
            return total + prop.sizes.reduce((sum, size) => sum + size.quantity, 0);
        }, 0);
    }, []);

    const filteredProducts = useMemo(() => products, [products]); // Now products are already filtered on the server

    const pageCount = Math.ceil(totalProducts / itemsPerPage);


    return (
        <>
            <LoadingOverlay isLoading={isLoading} /> {/* ADDED: LoadingOverlay component */}
            <h1>Product Management</h1>
            {/* Controls */}
            <div className="managements-controls">

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
                        <option value={5}>5</option>
                        <option value={10}>10</option>
                        <option value={25}>25</option>
                        <option value={50}>50</option>
                    </select>
                </div>

                {/* Search Input with Icon */}
                <input
                    type="text"
                    className="managements-search-input"
                    placeholder="Search by product name..."
                    value={searchTerm}
                    onChange={handleInputChange}
                />
                <button
                    className="edit-btn"
                    onClick={() => { }}
                    title="Filter Products"

                >
                    <FaFilter />
                </button>

                {/* Delete Selected */}
                <button
                    className={`delete-btn ${selected.length ? 'active' : ''}`}
                    disabled={!selected.length}
                    onClick={handleDeleteSelected}
                    title="Delete Selected"
                >
                    <FaTrash />
                </button>

                {/* Add New */}
                <button className="view-btn" onClick={handleAddNew} >
                    <FaPlus />
                </button>
            </div>


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
            <div className="table-container">
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
                                    <td>{(product.price - (product.price * product.sale / 100)).toFixed(2)}</td>
                                    <td>{calculateTotalStock(product)}</td>
                                    <td>{new Date(product.createdAt).toLocaleDateString()}</td>
                                    <td>
                                        <div className='managements-tags-container'>
                                            {product.tags.map(tag => (
                                                <span key={tag} className='managements-tag'>{tag}</span>
                                            ))}
                                        </div>
                                    </td>
                                    <td>{product.isActive === true ? <FaCheck className='active-check-true' /> : <FaTimes className='active-check-false' />}</td>
                                    <td>
                                        <div className='managements-action-btn-container'>
                                            <button
                                                className="edit-btn"
                                                title="Edit"

                                                onClick={() => handleEditProduct(product)} // Pass the entire product object
                                            >
                                                <FaEdit />
                                            </button>
                                            <button
                                                className="delete-btn"
                                                title="Delete"
                                                onClick={() => handleDeleteSingleProduct(product._id)}

                                            >
                                                <FaTrash />
                                            </button>
                                            <button
                                                className="view-btn"
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
                                <td colSpan="10">No products found.</td>
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

export default ProductManagements;