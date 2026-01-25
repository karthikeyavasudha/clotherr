import React, { useState, useEffect } from 'react';
import { MapPin, Plus, Edit2, Trash2, Check, X, Home, Building, Star } from 'lucide-react';
import { fetchUserAddresses, createUserAddress, updateUserAddress, deleteUserAddress, setDefaultAddress } from '../services/api';
import { useAuth } from '../context/AuthContext';

const AddressManager = ({ onSelectAddress, selectedAddressId, selectionMode = false }) => {
    const { token } = useAuth();
    const [addresses, setAddresses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [showForm, setShowForm] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [saving, setSaving] = useState(false);
    
    const [formData, setFormData] = useState({
        label: 'Home',
        full_name: '',
        phone: '',
        address_line1: '',
        address_line2: '',
        city: '',
        state: '',
        postal_code: '',
        country: 'India',
        is_default: false
    });

    useEffect(() => {
        loadAddresses();
    }, [token]);

    const loadAddresses = async () => {
        if (!token) return;
        try {
            setLoading(true);
            const data = await fetchUserAddresses(token);
            setAddresses(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const resetForm = () => {
        setFormData({
            label: 'Home',
            full_name: '',
            phone: '',
            address_line1: '',
            address_line2: '',
            city: '',
            state: '',
            postal_code: '',
            country: 'India',
            is_default: false
        });
        setEditingId(null);
        setShowForm(false);
    };

    const handleEdit = (address) => {
        setFormData({
            label: address.label || 'Home',
            full_name: address.full_name,
            phone: address.phone,
            address_line1: address.address_line1,
            address_line2: address.address_line2 || '',
            city: address.city,
            state: address.state,
            postal_code: address.postal_code,
            country: address.country || 'India',
            is_default: address.is_default
        });
        setEditingId(address.id);
        setShowForm(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSaving(true);

        try {
            if (editingId) {
                await updateUserAddress(editingId, formData, token);
            } else {
                await createUserAddress(formData, token);
            }
            await loadAddresses();
            resetForm();
        } catch (err) {
            setError(err.message);
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id) => {
        if (!confirm('Are you sure you want to delete this address?')) return;
        
        try {
            await deleteUserAddress(id, token);
            setAddresses(prev => prev.filter(a => a.id !== id));
        } catch (err) {
            setError(err.message);
        }
    };

    const handleSetDefault = async (id) => {
        try {
            await setDefaultAddress(id, token);
            await loadAddresses();
        } catch (err) {
            setError(err.message);
        }
    };

    const getLabelIcon = (label) => {
        switch (label?.toLowerCase()) {
            case 'home':
                return <Home className="w-4 h-4" />;
            case 'work':
            case 'office':
                return <Building className="w-4 h-4" />;
            default:
                return <MapPin className="w-4 h-4" />;
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-32">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black"></div>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                    <MapPin className="w-5 h-5" />
                    {selectionMode ? 'Select Delivery Address' : 'Saved Addresses'}
                </h3>
                {!showForm && (
                    <button
                        onClick={() => setShowForm(true)}
                        className="flex items-center gap-1 px-3 py-1.5 text-sm bg-black text-white rounded-lg hover:bg-gray-800"
                    >
                        <Plus className="w-4 h-4" />
                        Add New
                    </button>
                )}
            </div>

            {/* Error */}
            {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
                    {error}
                    <button onClick={() => setError('')} className="ml-2 text-red-400 hover:text-red-600">
                        <X className="w-4 h-4 inline" />
                    </button>
                </div>
            )}

            {/* Add/Edit Form */}
            {showForm && (
                <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                    <div className="flex items-center justify-between mb-4">
                        <h4 className="font-medium">
                            {editingId ? 'Edit Address' : 'Add New Address'}
                        </h4>
                        <button onClick={resetForm} className="text-gray-500 hover:text-gray-700">
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                    
                    <form onSubmit={handleSubmit} className="space-y-3">
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="block text-xs font-medium text-gray-600 mb-1">Label</label>
                                <select
                                    value={formData.label}
                                    onChange={(e) => setFormData({ ...formData, label: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-black"
                                >
                                    <option value="Home">Home</option>
                                    <option value="Work">Work</option>
                                    <option value="Office">Office</option>
                                    <option value="Other">Other</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-gray-600 mb-1">Full Name *</label>
                                <input
                                    type="text"
                                    value={formData.full_name}
                                    onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-black"
                                    required
                                />
                            </div>
                        </div>
                        
                        <div>
                            <label className="block text-xs font-medium text-gray-600 mb-1">Phone *</label>
                            <input
                                type="tel"
                                value={formData.phone}
                                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-black"
                                required
                            />
                        </div>
                        
                        <div>
                            <label className="block text-xs font-medium text-gray-600 mb-1">Address Line 1 *</label>
                            <input
                                type="text"
                                value={formData.address_line1}
                                onChange={(e) => setFormData({ ...formData, address_line1: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-black"
                                placeholder="House/Flat No., Building Name"
                                required
                            />
                        </div>
                        
                        <div>
                            <label className="block text-xs font-medium text-gray-600 mb-1">Address Line 2</label>
                            <input
                                type="text"
                                value={formData.address_line2}
                                onChange={(e) => setFormData({ ...formData, address_line2: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-black"
                                placeholder="Street, Landmark"
                            />
                        </div>
                        
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="block text-xs font-medium text-gray-600 mb-1">City *</label>
                                <input
                                    type="text"
                                    value={formData.city}
                                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-black"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-gray-600 mb-1">State *</label>
                                <input
                                    type="text"
                                    value={formData.state}
                                    onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-black"
                                    required
                                />
                            </div>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="block text-xs font-medium text-gray-600 mb-1">Postal Code *</label>
                                <input
                                    type="text"
                                    value={formData.postal_code}
                                    onChange={(e) => setFormData({ ...formData, postal_code: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-black"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-gray-600 mb-1">Country</label>
                                <input
                                    type="text"
                                    value={formData.country}
                                    onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-black"
                                />
                            </div>
                        </div>
                        
                        {!selectionMode && (
                            <div className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    id="is_default"
                                    checked={formData.is_default}
                                    onChange={(e) => setFormData({ ...formData, is_default: e.target.checked })}
                                    className="w-4 h-4"
                                />
                                <label htmlFor="is_default" className="text-sm text-gray-700">
                                    Set as default address
                                </label>
                            </div>
                        )}
                        
                        <div className="flex gap-2 pt-2">
                            <button
                                type="submit"
                                disabled={saving}
                                className="px-4 py-2 bg-black text-white text-sm rounded-lg hover:bg-gray-800 disabled:opacity-50"
                            >
                                {saving ? 'Saving...' : editingId ? 'Update' : 'Save Address'}
                            </button>
                            <button
                                type="button"
                                onClick={resetForm}
                                className="px-4 py-2 border border-gray-200 text-sm rounded-lg hover:bg-gray-50"
                            >
                                Cancel
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* Address List */}
            {addresses.length === 0 && !showForm ? (
                <div className="text-center py-8 text-gray-500">
                    <MapPin className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                    <p>No saved addresses yet.</p>
                    <p className="text-sm">Add your first address to get started.</p>
                </div>
            ) : (
                <div className="space-y-3">
                    {addresses.map((address) => (
                        <div 
                            key={address.id} 
                            className={`p-4 border rounded-xl transition-all ${
                                selectionMode 
                                    ? selectedAddressId === address.id 
                                        ? 'border-black bg-gray-50' 
                                        : 'border-gray-200 hover:border-gray-300 cursor-pointer'
                                    : 'border-gray-200'
                            }`}
                            onClick={() => selectionMode && onSelectAddress && onSelectAddress(address)}
                        >
                            <div className="flex items-start justify-between">
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-1">
                                        {getLabelIcon(address.label)}
                                        <span className="font-medium">{address.label}</span>
                                        {address.is_default && (
                                            <span className="text-xs bg-green-100 text-green-700 px-1.5 py-0.5 rounded">
                                                Default
                                            </span>
                                        )}
                                        {selectionMode && selectedAddressId === address.id && (
                                            <Check className="w-4 h-4 text-green-600" />
                                        )}
                                    </div>
                                    <p className="font-medium text-sm">{address.full_name}</p>
                                    <p className="text-sm text-gray-600">
                                        {address.address_line1}
                                        {address.address_line2 && `, ${address.address_line2}`}
                                    </p>
                                    <p className="text-sm text-gray-600">
                                        {address.city}, {address.state} - {address.postal_code}
                                    </p>
                                    <p className="text-sm text-gray-500">Phone: {address.phone}</p>
                                </div>
                                
                                {!selectionMode && (
                                    <div className="flex items-center gap-1">
                                        {!address.is_default && (
                                            <button
                                                onClick={() => handleSetDefault(address.id)}
                                                className="p-1.5 text-gray-400 hover:text-yellow-500 hover:bg-yellow-50 rounded"
                                                title="Set as default"
                                            >
                                                <Star className="w-4 h-4" />
                                            </button>
                                        )}
                                        <button
                                            onClick={() => handleEdit(address)}
                                            className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded"
                                        >
                                            <Edit2 className="w-4 h-4" />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(address.id)}
                                            className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default AddressManager;
