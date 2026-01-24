import React, { useState, useEffect } from 'react';
import { Tag, Plus, Trash2, Edit2, X, Check, AlertTriangle, Percent, DollarSign } from 'lucide-react';
import { fetchDiscounts, createDiscount, updateDiscount, deleteDiscount } from '../../services/adminApi';
import AdminLayout from '../../components/admin/AdminLayout';

const DiscountsPage = () => {
    const [discounts, setDiscounts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [showForm, setShowForm] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [saving, setSaving] = useState(false);
    
    const [formData, setFormData] = useState({
        code: '',
        type: 'percentage',
        value: '',
        min_order_amount: '',
        max_discount: '',
        usage_limit: '',
        per_user_limit: '',
        expiry_date: '',
        description: '',
        is_active: true
    });

    useEffect(() => {
        loadDiscounts();
    }, []);

    const loadDiscounts = async () => {
        try {
            setLoading(true);
            const data = await fetchDiscounts();
            setDiscounts(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const resetForm = () => {
        setFormData({
            code: '',
            type: 'percentage',
            value: '',
            min_order_amount: '',
            max_discount: '',
            usage_limit: '',
            per_user_limit: '',
            expiry_date: '',
            description: '',
            is_active: true
        });
        setEditingId(null);
        setShowForm(false);
    };

    const handleEdit = (discount) => {
        setFormData({
            code: discount.code,
            type: discount.type,
            value: discount.value,
            min_order_amount: discount.min_order_amount || '',
            max_discount: discount.max_discount || '',
            usage_limit: discount.usage_limit || '',
            per_user_limit: discount.per_user_limit || '',
            expiry_date: discount.expiry_date ? discount.expiry_date.split('T')[0] : '',
            description: discount.description || '',
            is_active: discount.is_active
        });
        setEditingId(discount.id);
        setShowForm(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSaving(true);

        try {
            const data = {
                code: formData.code,
                type: formData.type,
                value: parseFloat(formData.value),
                min_order_amount: formData.min_order_amount ? parseFloat(formData.min_order_amount) : 0,
                max_discount: formData.max_discount ? parseFloat(formData.max_discount) : null,
                usage_limit: formData.usage_limit ? parseInt(formData.usage_limit) : null,
                per_user_limit: formData.per_user_limit ? parseInt(formData.per_user_limit) : null,
                expiry_date: formData.expiry_date || null,
                description: formData.description || null,
                is_active: formData.is_active
            };

            if (editingId) {
                await updateDiscount(editingId, data);
            } else {
                await createDiscount(data);
            }
            
            await loadDiscounts();
            resetForm();
        } catch (err) {
            setError(err.message);
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id) => {
        if (!confirm('Are you sure you want to delete this discount?')) return;
        
        try {
            await deleteDiscount(id);
            setDiscounts(prev => prev.filter(d => d.id !== id));
        } catch (err) {
            setError(err.message);
        }
    };

    const toggleActive = async (discount) => {
        try {
            await updateDiscount(discount.id, { is_active: !discount.is_active });
            setDiscounts(prev => prev.map(d => 
                d.id === discount.id ? { ...d, is_active: !d.is_active } : d
            ));
        } catch (err) {
            setError(err.message);
        }
    };

    const formatDate = (dateStr) => {
        if (!dateStr) return '-';
        return new Date(dateStr).toLocaleDateString();
    };

    const isExpired = (dateStr) => {
        if (!dateStr) return false;
        return new Date(dateStr) < new Date();
    };

    if (loading) {
        return (
            <AdminLayout>
                <div className="flex items-center justify-center h-64">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black"></div>
                </div>
            </AdminLayout>
        );
    }

    return (
        <AdminLayout>
            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Discounts</h1>
                        <p className="text-gray-500 mt-1">Manage discount codes and coupons</p>
                    </div>
                    <button
                        onClick={() => setShowForm(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors"
                    >
                        <Plus className="w-5 h-5" />
                        Add Discount
                    </button>
                </div>

                {/* Error State */}
                {error && (
                    <div className="p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3 text-red-600">
                        <AlertTriangle className="w-5 h-5" />
                        <span>{error}</span>
                        <button onClick={() => setError('')} className="ml-auto">
                            <X className="w-4 h-4" />
                        </button>
                    </div>
                )}

                {/* Add/Edit Form */}
                {showForm && (
                    <div className="bg-white rounded-2xl border border-gray-200 p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-lg font-semibold">
                                {editingId ? 'Edit Discount' : 'Create New Discount'}
                            </h2>
                            <button onClick={resetForm} className="text-gray-500 hover:text-gray-700">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Discount Code *
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.code}
                                        onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                                        className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                                        placeholder="e.g., SAVE20"
                                        required
                                    />
                                </div>
                                
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Discount Type *
                                    </label>
                                    <select
                                        value={formData.type}
                                        onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                                    >
                                        <option value="percentage">Percentage (%)</option>
                                        <option value="fixed">Fixed Amount (₹)</option>
                                    </select>
                                </div>
                                
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Value * {formData.type === 'percentage' ? '(%)' : '(₹)'}
                                    </label>
                                    <input
                                        type="number"
                                        value={formData.value}
                                        onChange={(e) => setFormData({ ...formData, value: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                                        placeholder={formData.type === 'percentage' ? 'e.g., 20' : 'e.g., 100'}
                                        min="0"
                                        max={formData.type === 'percentage' ? '100' : undefined}
                                        step="0.01"
                                        required
                                    />
                                </div>
                                
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Min Order Amount (₹)
                                    </label>
                                    <input
                                        type="number"
                                        value={formData.min_order_amount}
                                        onChange={(e) => setFormData({ ...formData, min_order_amount: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                                        placeholder="0"
                                        min="0"
                                        step="0.01"
                                    />
                                </div>
                                
                                {formData.type === 'percentage' && (
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Max Discount (₹)
                                        </label>
                                        <input
                                            type="number"
                                            value={formData.max_discount}
                                            onChange={(e) => setFormData({ ...formData, max_discount: e.target.value })}
                                            className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                                            placeholder="No limit"
                                            min="0"
                                            step="0.01"
                                        />
                                    </div>
                                )}
                                
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Total Usage Limit
                                    </label>
                                    <input
                                        type="number"
                                        value={formData.usage_limit}
                                        onChange={(e) => setFormData({ ...formData, usage_limit: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                                        placeholder="Unlimited"
                                        min="1"
                                    />
                                </div>
                                
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Per User Limit
                                    </label>
                                    <input
                                        type="number"
                                        value={formData.per_user_limit}
                                        onChange={(e) => setFormData({ ...formData, per_user_limit: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                                        placeholder="Unlimited"
                                        min="1"
                                    />
                                </div>
                                
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Expiry Date
                                    </label>
                                    <input
                                        type="date"
                                        value={formData.expiry_date}
                                        onChange={(e) => setFormData({ ...formData, expiry_date: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                                    />
                                </div>
                                
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Description
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.description}
                                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                                        placeholder="e.g., New Year Sale - 20% off"
                                    />
                                </div>
                            </div>
                            
                            <div className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    id="is_active"
                                    checked={formData.is_active}
                                    onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                                    className="w-4 h-4"
                                />
                                <label htmlFor="is_active" className="text-sm text-gray-700">
                                    Active (can be used by customers)
                                </label>
                            </div>
                            
                            <div className="flex gap-3">
                                <button
                                    type="submit"
                                    disabled={saving}
                                    className="px-6 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50"
                                >
                                    {saving ? 'Saving...' : editingId ? 'Update Discount' : 'Create Discount'}
                                </button>
                                <button
                                    type="button"
                                    onClick={resetForm}
                                    className="px-6 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                                >
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                )}

                {/* Discounts List */}
                <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                        <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                            <Tag className="w-5 h-5" />
                            All Discounts ({discounts.length})
                        </h2>
                    </div>
                    
                    {discounts.length === 0 ? (
                        <div className="px-6 py-12 text-center text-gray-500">
                            <Tag className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                            <p>No discounts created yet.</p>
                            <p className="text-sm">Click "Add Discount" to create your first coupon code.</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-50 border-b border-gray-200">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Code</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Discount</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Min Order</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Usage</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Per User</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Expiry</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {discounts.map((discount) => (
                                        <tr key={discount.id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2">
                                                    <span className="font-mono font-bold text-gray-900 bg-gray-100 px-2 py-1 rounded">
                                                        {discount.code}
                                                    </span>
                                                </div>
                                                {discount.description && (
                                                    <p className="text-xs text-gray-500 mt-1">{discount.description}</p>
                                                )}
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-1">
                                                    {discount.type === 'percentage' ? (
                                                        <span className="font-medium">{discount.value}%</span>
                                                    ) : (
                                                        <span className="font-medium">₹{discount.value}</span>
                                                    )}
                                                </div>
                                                {discount.type === 'percentage' && discount.max_discount && (
                                                    <p className="text-xs text-gray-500">Max: ₹{discount.max_discount}</p>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-600">
                                                {discount.min_order_amount > 0 ? `₹${discount.min_order_amount}` : '-'}
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-600">
                                                {discount.used_count || 0}
                                                {discount.usage_limit && ` / ${discount.usage_limit}`}
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-600">
                                                {discount.per_user_limit || '∞'}
                                            </td>
                                            <td className="px-6 py-4 text-sm">
                                                <span className={isExpired(discount.expiry_date) ? 'text-red-600' : 'text-gray-600'}>
                                                    {formatDate(discount.expiry_date)}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <button
                                                    onClick={() => toggleActive(discount)}
                                                    className={`px-2 py-1 text-xs font-medium rounded-full ${
                                                        discount.is_active
                                                            ? 'bg-green-100 text-green-700'
                                                            : 'bg-gray-100 text-gray-600'
                                                    }`}
                                                >
                                                    {discount.is_active ? 'Active' : 'Inactive'}
                                                </button>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    <button
                                                        onClick={() => handleEdit(discount)}
                                                        className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg"
                                                    >
                                                        <Edit2 className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(discount.id)}
                                                        className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg"
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
        </AdminLayout>
    );
};

export default DiscountsPage;
