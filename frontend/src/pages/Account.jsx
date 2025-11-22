import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { updateUserProfile } from '../services/api';
import { User, MapPin, Phone, Mail, LogOut, Calendar, Edit2, Save, X } from 'lucide-react';

const Account = () => {
    const { user, token, setUser } = useAuth();
    const navigate = useNavigate();
    const [isEditing, setIsEditing] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [formData, setFormData] = useState({
        full_name: user?.full_name || '',
        phone: user?.phone || '',
        address_line1: user?.address_line1 || '',
        address_line2: user?.address_line2 || '',
        city: user?.city || '',
        state: user?.state || '',
        postal_code: user?.postal_code || '',
        country: user?.country || ''
    });

    const handleLogout = async () => {
        await useAuth().signOut();
        navigate('/login');
    };

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSave = async () => {
        try {
            setError('');
            setLoading(true);
            const updatedUser = await updateUserProfile(user.id, formData, token);

            // Update user in AuthContext and localStorage
            const newUserData = { ...user, ...updatedUser };
            localStorage.setItem('user_data', JSON.stringify(newUserData));
            setUser(newUserData);

            setIsEditing(false);
        } catch (err) {
            setError(err.message || 'Failed to update profile');
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = () => {
        setFormData({
            full_name: user?.full_name || '',
            phone: user?.phone || '',
            address_line1: user?.address_line1 || '',
            address_line2: user?.address_line2 || '',
            city: user?.city || '',
            state: user?.state || '',
            postal_code: user?.postal_code || '',
            country: user?.country || ''
        });
        setIsEditing(false);
        setError('');
    };

    if (!user) {
        navigate('/login');
        return null;
    }

    return (
        <div className="min-h-screen bg-gray-50 pt-20 pb-12">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="bg-white rounded-lg shadow-lg overflow-hidden">
                    {/* Header */}
                    <div className="bg-gradient-to-r from-gray-900 to-gray-700 px-8 py-12">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-4">
                                <div className="bg-white rounded-full p-4">
                                    <User className="h-12 w-12 text-gray-900" />
                                </div>
                                <div className="text-white">
                                    <h1 className="text-3xl font-bold">{user.full_name || 'User'}</h1>
                                    <p className="text-gray-300 mt-1">{user.email}</p>
                                </div>
                            </div>

                            {/* Edit/Save Buttons */}
                            <div>
                                {!isEditing ? (
                                    <button
                                        onClick={() => setIsEditing(true)}
                                        className="flex items-center space-x-2 bg-white text-gray-900 px-4 py-2 rounded-lg hover:bg-gray-100 transition-colors"
                                    >
                                        <Edit2 className="h-4 w-4" />
                                        <span>Edit Profile</span>
                                    </button>
                                ) : (
                                    <div className="flex space-x-2">
                                        <button
                                            onClick={handleSave}
                                            disabled={loading}
                                            className="flex items-center space-x-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors disabled:bg-gray-400"
                                        >
                                            <Save className="h-4 w-4" />
                                            <span>{loading ? 'Saving...' : 'Save'}</span>
                                        </button>
                                        <button
                                            onClick={handleCancel}
                                            disabled={loading}
                                            className="flex items-center space-x-2 bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
                                        >
                                            <X className="h-4 w-4" />
                                            <span>Cancel</span>
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Error Message */}
                    {error && (
                        <div className="mx-8 mt-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                            {error}
                        </div>
                    )}

                    {/* Personal Information */}
                    <div className="p-8">
                        <h2 className="text-2xl font-bold text-gray-900 mb-6">Personal Information</h2>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                            {/* Full Name */}
                            <div className="flex items-start space-x-3 p-4 bg-gray-50 rounded-lg">
                                <User className="h-5 w-5 text-gray-400 mt-1 flex-shrink-0" />
                                <div className="min-w-0 flex-1">
                                    <p className="text-sm font-medium text-gray-500 mb-1">Full Name</p>
                                    {isEditing ? (
                                        <input
                                            type="text"
                                            name="full_name"
                                            value={formData.full_name}
                                            onChange={handleChange}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black"
                                        />
                                    ) : (
                                        <p className="text-gray-900 truncate">{user.full_name || 'Not provided'}</p>
                                    )}
                                </div>
                            </div>

                            {/* Email (Read-only) */}
                            <div className="flex items-start space-x-3 p-4 bg-gray-50 rounded-lg">
                                <Mail className="h-5 w-5 text-gray-400 mt-1 flex-shrink-0" />
                                <div className="min-w-0 flex-1">
                                    <p className="text-sm font-medium text-gray-500 mb-1">Email Address</p>
                                    <p className="text-gray-900 truncate">{user.email}</p>
                                </div>
                            </div>

                            {/* Phone */}
                            <div className="flex items-start space-x-3 p-4 bg-gray-50 rounded-lg">
                                <Phone className="h-5 w-5 text-gray-400 mt-1 flex-shrink-0" />
                                <div className="min-w-0 flex-1">
                                    <p className="text-sm font-medium text-gray-500 mb-1">Phone Number</p>
                                    {isEditing ? (
                                        <input
                                            type="tel"
                                            name="phone"
                                            value={formData.phone}
                                            onChange={handleChange}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black"
                                        />
                                    ) : (
                                        <p className="text-gray-900">{user.phone || 'Not provided'}</p>
                                    )}
                                </div>
                            </div>

                            {/* Member Since */}
                            {user.created_at && (
                                <div className="flex items-start space-x-3 p-4 bg-gray-50 rounded-lg">
                                    <Calendar className="h-5 w-5 text-gray-400 mt-1 flex-shrink-0" />
                                    <div className="min-w-0 flex-1">
                                        <p className="text-sm font-medium text-gray-500 mb-1">Member Since</p>
                                        <p className="text-gray-900">
                                            {new Date(user.created_at).toLocaleDateString('en-US', {
                                                year: 'numeric',
                                                month: 'long',
                                                day: 'numeric'
                                            })}
                                        </p>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Shipping Address */}
                        <div className="mt-8">
                            <h3 className="text-xl font-bold text-gray-900 mb-4">Shipping Address</h3>
                            <div className="bg-gray-50 p-6 rounded-lg">
                                <div className="flex items-start space-x-3">
                                    <MapPin className="h-5 w-5 text-gray-400 mt-1 flex-shrink-0" />
                                    <div className="flex-1 space-y-4">
                                        {/* Address Line 1 */}
                                        <div>
                                            <p className="text-sm font-medium text-gray-500 mb-1">Street Address</p>
                                            {isEditing ? (
                                                <input
                                                    type="text"
                                                    name="address_line1"
                                                    value={formData.address_line1}
                                                    onChange={handleChange}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black"
                                                />
                                            ) : (
                                                <p className="text-gray-900">{user.address_line1 || 'Not provided'}</p>
                                            )}
                                        </div>

                                        {/* Address Line 2 */}
                                        <div>
                                            <p className="text-sm font-medium text-gray-500 mb-1">Apartment, Suite, etc. (optional)</p>
                                            {isEditing ? (
                                                <input
                                                    type="text"
                                                    name="address_line2"
                                                    value={formData.address_line2}
                                                    onChange={handleChange}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black"
                                                />
                                            ) : (
                                                <p className="text-gray-900">{user.address_line2 || '-'}</p>
                                            )}
                                        </div>

                                        {/* City & State */}
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <p className="text-sm font-medium text-gray-500 mb-1">City</p>
                                                {isEditing ? (
                                                    <input
                                                        type="text"
                                                        name="city"
                                                        value={formData.city}
                                                        onChange={handleChange}
                                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black"
                                                    />
                                                ) : (
                                                    <p className="text-gray-900">{user.city || 'Not provided'}</p>
                                                )}
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium text-gray-500 mb-1">State / Province</p>
                                                {isEditing ? (
                                                    <input
                                                        type="text"
                                                        name="state"
                                                        value={formData.state}
                                                        onChange={handleChange}
                                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black"
                                                    />
                                                ) : (
                                                    <p className="text-gray-900">{user.state || 'Not provided'}</p>
                                                )}
                                            </div>
                                        </div>

                                        {/* Postal Code & Country */}
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <p className="text-sm font-medium text-gray-500 mb-1">Postal Code</p>
                                                {isEditing ? (
                                                    <input
                                                        type="text"
                                                        name="postal_code"
                                                        value={formData.postal_code}
                                                        onChange={handleChange}
                                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black"
                                                    />
                                                ) : (
                                                    <p className="text-gray-900">{user.postal_code || 'Not provided'}</p>
                                                )}
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium text-gray-500 mb-1">Country</p>
                                                {isEditing ? (
                                                    <input
                                                        type="text"
                                                        name="country"
                                                        value={formData.country}
                                                        onChange={handleChange}
                                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black"
                                                    />
                                                ) : (
                                                    <p className="text-gray-900">{user.country || 'Not provided'}</p>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="mt-8 pt-8 border-t border-gray-200">
                            <button
                                onClick={handleLogout}
                                className="flex items-center space-x-2 text-red-600 hover:text-red-700 font-medium transition-colors"
                            >
                                <LogOut className="h-5 w-5" />
                                <span>Sign Out</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Account;
