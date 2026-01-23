import React, { useState, useEffect } from 'react';
import {
    Plus,
    Search,
    Edit2,
    Trash2,
    X,
    Package,
    AlertTriangle
} from 'lucide-react';
import {
    fetchAdminProducts,
    createProduct,
    updateProduct,
    deleteProduct,
    fetchCategories
} from '../../services/adminApi';
import AdminLayout from '../../components/admin/AdminLayout';

const Products = () => {
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [search, setSearch] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [editingProduct, setEditingProduct] = useState(null);
    const [deleteConfirm, setDeleteConfirm] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        price: '',
        compare_at_price: '',
        image_url: '',
        images: [],
        category: '',
        stock: ''
    });
    const [newImageUrl, setNewImageUrl] = useState('');
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        loadProducts();
        loadCategories();
    }, [search, selectedCategory]);

    const loadProducts = async () => {
        try {
            setLoading(true);
            const data = await fetchAdminProducts(0, 100, search, selectedCategory);
            setProducts(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const loadCategories = async () => {
        try {
            const data = await fetchCategories();
            setCategories(data);
        } catch (err) {
            console.error('Failed to load categories:', err);
        }
    };

    const handleOpenModal = (product = null) => {
        if (product) {
            setEditingProduct(product);
            setFormData({
                name: product.name,
                description: product.description || '',
                price: product.price.toString(),
                compare_at_price: product.compare_at_price ? product.compare_at_price.toString() : '',
                image_url: product.image_url || '',
                images: product.images || [],
                category: product.category || '',
                stock: product.stock.toString()
            });
        } else {
            setEditingProduct(null);
            setFormData({
                name: '',
                description: '',
                price: '',
                compare_at_price: '',
                image_url: '',
                images: [],
                category: '',
                stock: ''
            });
        }
        setNewImageUrl('');
        setShowModal(true);
    };

    const handleCloseModal = () => {
        setShowModal(false);
        setEditingProduct(null);
        setNewImageUrl('');
        setFormData({
            name: '',
            description: '',
            price: '',
            compare_at_price: '',
            image_url: '',
            images: [],
            category: '',
            stock: ''
        });
    };

    const handleAddImage = () => {
        if (newImageUrl.trim() && !formData.images.includes(newImageUrl.trim())) {
            setFormData({
                ...formData,
                images: [...formData.images, newImageUrl.trim()]
            });
            setNewImageUrl('');
        }
    };

    const handleRemoveImage = (index) => {
        setFormData({
            ...formData,
            images: formData.images.filter((_, i) => i !== index)
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);

        try {
            const productData = {
                name: formData.name,
                description: formData.description || null,
                price: parseFloat(formData.price),
                compare_at_price: formData.compare_at_price ? parseFloat(formData.compare_at_price) : null,
                image_url: formData.image_url || null,
                images: formData.images.length > 0 ? formData.images : null,
                category: formData.category || null,
                stock: parseInt(formData.stock) || 0
            };

            if (editingProduct) {
                await updateProduct(editingProduct.id, productData);
            } else {
                await createProduct(productData);
            }

            handleCloseModal();
            loadProducts();
            loadCategories();
        } catch (err) {
            setError(err.message);
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (productId) => {
        try {
            await deleteProduct(productId);
            setDeleteConfirm(null);
            loadProducts();
        } catch (err) {
            setError(err.message);
        }
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            maximumFractionDigits: 0
        }).format(amount);
    };

    return (
        <AdminLayout>
            <div className="space-y-6">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Products</h1>
                        <p className="text-gray-500 mt-1">Manage your product inventory</p>
                    </div>
                    <button
                        onClick={() => handleOpenModal()}
                        className="flex items-center gap-2 px-4 py-2 bg-black text-white rounded-xl hover:bg-gray-800 transition-all"
                    >
                        <Plus className="w-5 h-5" />
                        Add Product
                    </button>
                </div>

                {/* Filters */}
                <div className="flex flex-col sm:flex-row gap-4">
                    <div className="relative flex-1">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Search products..."
                            className="w-full pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                        />
                    </div>
                    <select
                        value={selectedCategory}
                        onChange={(e) => setSelectedCategory(e.target.value)}
                        className="px-4 py-3 bg-white border border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-black"
                    >
                        <option value="">All Categories</option>
                        {categories.map((cat) => (
                            <option key={cat} value={cat}>{cat}</option>
                        ))}
                    </select>
                </div>

                {/* Error State */}
                {error && (
                    <div className="p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3 text-red-600">
                        <AlertTriangle className="w-5 h-5" />
                        <span>{error}</span>
                        <button onClick={() => setError('')} className="ml-auto">
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                )}

                {/* Products Table */}
                <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
                    {loading ? (
                        <div className="flex items-center justify-center h-64">
                            <div className="w-10 h-10 border-4 border-black border-t-transparent rounded-full animate-spin" />
                        </div>
                    ) : products.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-64 text-gray-500">
                            <Package className="w-12 h-12 mb-4" />
                            <p>No products found</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="text-gray-500 text-sm border-b border-gray-200">
                                        <th className="text-left p-4 font-medium">Product</th>
                                        <th className="text-left p-4 font-medium">Category</th>
                                        <th className="text-left p-4 font-medium">Price</th>
                                        <th className="text-left p-4 font-medium">Stock</th>
                                        <th className="text-right p-4 font-medium">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {products.map((product) => (
                                        <tr key={product.id} className="hover:bg-gray-50 transition-colors">
                                            <td className="p-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-12 h-12 rounded-lg bg-gray-100 overflow-hidden flex-shrink-0">
                                                        {product.image_url ? (
                                                            <img
                                                                src={product.image_url}
                                                                alt={product.name}
                                                                className="w-full h-full object-cover"
                                                            />
                                                        ) : (
                                                            <div className="w-full h-full flex items-center justify-center">
                                                                <Package className="w-6 h-6 text-gray-400" />
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div>
                                                        <p className="text-gray-900 font-medium">{product.name}</p>
                                                        <p className="text-gray-500 text-sm truncate max-w-xs">
                                                            {product.description || 'No description'}
                                                        </p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="p-4">
                                                <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm">
                                                    {product.category || 'Uncategorized'}
                                                </span>
                                            </td>
                                            <td className="p-4 text-gray-900 font-medium">
                                                {formatCurrency(product.price)}
                                            </td>
                                            <td className="p-4">
                                                <span className={`px-2 py-1 rounded-lg text-sm font-medium ${product.stock === 0
                                                    ? 'bg-red-100 text-red-700'
                                                    : product.stock < 10
                                                        ? 'bg-amber-100 text-amber-700'
                                                        : 'bg-green-100 text-green-700'
                                                    }`}>
                                                    {product.stock}
                                                </span>
                                            </td>
                                            <td className="p-4">
                                                <div className="flex items-center justify-end gap-2">
                                                    <button
                                                        onClick={() => handleOpenModal(product)}
                                                        className="p-2 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                                                    >
                                                        <Edit2 className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => setDeleteConfirm(product)}
                                                        className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>

            {/* Add/Edit Modal */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/20" onClick={handleCloseModal} />
                    <div className="relative bg-white rounded-2xl border border-gray-200 w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-xl">
                        <div className="sticky top-0 bg-white p-6 border-b border-gray-200 flex items-center justify-between">
                            <h2 className="text-xl font-bold text-gray-900">
                                {editingProduct ? 'Edit Product' : 'Add New Product'}
                            </h2>
                            <button
                                onClick={handleCloseModal}
                                className="p-2 text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded-lg"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Name *</label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-black"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                                <textarea
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    rows={3}
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-black resize-none"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Sale Price (₹) *</label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        value={formData.price}
                                        onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-black"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Original Price (₹)</label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        value={formData.compare_at_price}
                                        onChange={(e) => setFormData({ ...formData, compare_at_price: e.target.value })}
                                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-black"
                                        placeholder="Optional"
                                    />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Stock *</label>
                                    <input
                                        type="number"
                                        value={formData.stock}
                                        onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-black"
                                        required
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Category *</label>
                                <select
                                    value={formData.category}
                                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-black"
                                    required
                                >
                                    <option value="">Select Category</option>
                                    <option value="Men">Men</option>
                                    <option value="Women">Women</option>
                                    <option value="Kids">Kids</option>
                                    <option value="Unisex">Unisex</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Primary Image URL</label>
                                <input
                                    type="url"
                                    value={formData.image_url}
                                    onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-black"
                                    placeholder="https://..."
                                />
                            </div>

                            {/* Additional Images */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Additional Images</label>
                                <div className="flex gap-2 mb-3">
                                    <input
                                        type="url"
                                        value={newImageUrl}
                                        onChange={(e) => setNewImageUrl(e.target.value)}
                                        onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddImage())}
                                        className="flex-1 px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-black text-sm"
                                        placeholder="Add another image URL..."
                                    />
                                    <button
                                        type="button"
                                        onClick={handleAddImage}
                                        className="px-4 py-2 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors text-sm font-medium"
                                    >
                                        Add
                                    </button>
                                </div>
                                {formData.images.length > 0 && (
                                    <div className="grid grid-cols-3 gap-2">
                                        {formData.images.map((img, index) => (
                                            <div key={index} className="relative group aspect-square bg-gray-100 rounded-lg overflow-hidden">
                                                <img src={img} alt={`Image ${index + 1}`} className="w-full h-full object-cover" />
                                                <button
                                                    type="button"
                                                    onClick={() => handleRemoveImage(index)}
                                                    className="absolute top-1 right-1 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                                                >
                                                    <X className="w-4 h-4" />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                            <div className="flex gap-3 pt-4">
                                <button
                                    type="button"
                                    onClick={handleCloseModal}
                                    className="flex-1 px-4 py-3 bg-gray-100 text-gray-900 rounded-xl hover:bg-gray-200 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={saving}
                                    className="flex-1 px-4 py-3 bg-black text-white rounded-xl hover:bg-gray-800 transition-all disabled:opacity-50"
                                >
                                    {saving ? 'Saving...' : editingProduct ? 'Update' : 'Create'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            {deleteConfirm && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/20" onClick={() => setDeleteConfirm(null)} />
                    <div className="relative bg-white rounded-2xl border border-gray-200 p-6 w-full max-w-md shadow-xl">
                        <h2 className="text-xl font-bold text-gray-900 mb-2">Delete Product</h2>
                        <p className="text-gray-500 mb-6">
                            Are you sure you want to delete "{deleteConfirm.name}"? This action cannot be undone.
                        </p>
                        <div className="flex gap-3">
                            <button
                                onClick={() => setDeleteConfirm(null)}
                                className="flex-1 px-4 py-3 bg-gray-100 text-gray-900 rounded-xl hover:bg-gray-200 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() => handleDelete(deleteConfirm.id)}
                                className="flex-1 px-4 py-3 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors"
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </AdminLayout>
    );
};

export default Products;
