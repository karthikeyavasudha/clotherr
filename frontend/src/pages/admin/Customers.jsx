import React, { useState, useEffect } from 'react';
import {
    Search,
    Eye,
    X,
    Users,
    AlertTriangle,
    Mail,
    Phone,
    MapPin,
    ShoppingBag
} from 'lucide-react';
import {
    fetchAdminUsers,
    fetchUserDetails
} from '../../services/adminApi';
import AdminLayout from '../../components/admin/AdminLayout';

const Customers = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [search, setSearch] = useState('');
    const [selectedUser, setSelectedUser] = useState(null);
    const [userDetails, setUserDetails] = useState(null);
    const [loadingDetails, setLoadingDetails] = useState(false);

    useEffect(() => {
        const timer = setTimeout(() => {
            loadUsers();
        }, 300);
        return () => clearTimeout(timer);
    }, [search]);

    const loadUsers = async () => {
        try {
            setLoading(true);
            const data = await fetchAdminUsers(0, 100, search);
            setUsers(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleViewUser = async (userId) => {
        setSelectedUser(userId);
        setLoadingDetails(true);
        try {
            const details = await fetchUserDetails(userId);
            setUserDetails(details);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoadingDetails(false);
        }
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            maximumFractionDigits: 0
        }).format(amount);
    };

    const getStatusColor = (status) => {
        const colors = {
            pending: 'bg-yellow-100 text-yellow-700',
            paid: 'bg-blue-100 text-blue-700',
            shipped: 'bg-purple-100 text-purple-700',
            delivered: 'bg-green-100 text-green-700',
            cancelled: 'bg-red-100 text-red-700'
        };
        return colors[status] || 'bg-gray-100 text-gray-700';
    };

    return (
        <AdminLayout>
            <div className="space-y-6">
                {/* Header */}
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Customers</h1>
                    <p className="text-gray-500 mt-1">View and manage your customer base</p>
                </div>

                {/* Search */}
                <div className="relative max-w-md">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                        type="text"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search by name or email..."
                        className="w-full pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                    />
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

                {/* Customers Table */}
                <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
                    {loading ? (
                        <div className="flex items-center justify-center h-64">
                            <div className="w-10 h-10 border-4 border-black border-t-transparent rounded-full animate-spin" />
                        </div>
                    ) : users.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-64 text-gray-500">
                            <Users className="w-12 h-12 mb-4" />
                            <p>No customers found</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="text-gray-500 text-sm border-b border-gray-200">
                                        <th className="text-left p-4 font-medium">Customer</th>
                                        <th className="text-left p-4 font-medium">Contact</th>
                                        <th className="text-left p-4 font-medium">Location</th>
                                        <th className="text-left p-4 font-medium">Joined</th>
                                        <th className="text-right p-4 font-medium">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {users.map((user) => (
                                        <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                                            <td className="p-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 bg-gray-900 rounded-full flex items-center justify-center text-white font-bold">
                                                        {user.full_name?.charAt(0) || user.email?.charAt(0) || '?'}
                                                    </div>
                                                    <div>
                                                        <p className="text-gray-900 font-medium">
                                                            {user.full_name || 'No name'}
                                                        </p>
                                                        {user.is_admin && (
                                                            <span className="text-xs bg-gray-900 text-white px-2 py-0.5 rounded-full">
                                                                Admin
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="p-4">
                                                <div className="space-y-1">
                                                    <p className="text-gray-700 text-sm flex items-center gap-2">
                                                        <Mail className="w-3 h-3" />
                                                        {user.email}
                                                    </p>
                                                    {user.phone && (
                                                        <p className="text-gray-500 text-sm flex items-center gap-2">
                                                            <Phone className="w-3 h-3" />
                                                            {user.phone}
                                                        </p>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="p-4 text-gray-700 text-sm">
                                                {user.city && user.country ? `${user.city}, ${user.country}` : '-'}
                                            </td>
                                            <td className="p-4 text-gray-500 text-sm">
                                                {new Date(user.created_at).toLocaleDateString('en-IN', {
                                                    day: 'numeric',
                                                    month: 'short',
                                                    year: 'numeric'
                                                })}
                                            </td>
                                            <td className="p-4 text-right">
                                                <button
                                                    onClick={() => handleViewUser(user.id)}
                                                    className="p-2 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                                                >
                                                    <Eye className="w-4 h-4" />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>

            {/* Customer Details Modal */}
            {selectedUser && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/20" onClick={() => { setSelectedUser(null); setUserDetails(null); }} />
                    <div className="relative bg-white rounded-2xl border border-gray-200 w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-xl">
                        <div className="sticky top-0 bg-white p-6 border-b border-gray-200 flex items-center justify-between">
                            <h2 className="text-xl font-bold text-gray-900">
                                Customer Details
                            </h2>
                            <button
                                onClick={() => { setSelectedUser(null); setUserDetails(null); }}
                                className="p-2 text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded-lg"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {loadingDetails ? (
                            <div className="flex items-center justify-center h-64">
                                <div className="w-10 h-10 border-4 border-black border-t-transparent rounded-full animate-spin" />
                            </div>
                        ) : userDetails && (
                            <div className="p-6 space-y-6">
                                {/* Profile Header */}
                                <div className="flex items-center gap-4">
                                    <div className="w-16 h-16 bg-gray-900 rounded-2xl flex items-center justify-center text-white font-bold text-2xl">
                                        {userDetails.full_name?.charAt(0) || userDetails.email?.charAt(0) || '?'}
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-bold text-gray-900">
                                            {userDetails.full_name || 'No name'}
                                        </h3>
                                        <p className="text-gray-500">{userDetails.email}</p>
                                    </div>
                                </div>

                                {/* Stats */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="bg-gray-50 rounded-xl p-4 text-center">
                                        <p className="text-2xl font-bold text-gray-900">{userDetails.total_orders || 0}</p>
                                        <p className="text-gray-500 text-sm">Total Orders</p>
                                    </div>
                                    <div className="bg-gray-50 rounded-xl p-4 text-center">
                                        <p className="text-2xl font-bold text-green-600">
                                            {formatCurrency(userDetails.total_spent || 0)}
                                        </p>
                                        <p className="text-gray-500 text-sm">Total Spent</p>
                                    </div>
                                </div>

                                {/* Contact Info */}
                                <div className="bg-gray-50 rounded-xl p-4 space-y-3">
                                    <h4 className="text-gray-900 font-semibold">Contact Information</h4>
                                    <div className="space-y-2 text-sm">
                                        <p className="flex items-center gap-3 text-gray-700">
                                            <Mail className="w-4 h-4 text-gray-400" />
                                            {userDetails.email}
                                        </p>
                                        {userDetails.phone && (
                                            <p className="flex items-center gap-3 text-gray-700">
                                                <Phone className="w-4 h-4 text-gray-400" />
                                                {userDetails.phone}
                                            </p>
                                        )}
                                        {userDetails.address_line1 && (
                                            <p className="flex items-start gap-3 text-gray-700">
                                                <MapPin className="w-4 h-4 text-gray-400 mt-0.5" />
                                                <span>
                                                    {userDetails.address_line1}
                                                    {userDetails.address_line2 && <>, {userDetails.address_line2}</>}
                                                    <br />
                                                    {userDetails.city}, {userDetails.state} {userDetails.postal_code}
                                                    <br />
                                                    {userDetails.country}
                                                </span>
                                            </p>
                                        )}
                                    </div>
                                </div>

                                {/* Recent Orders */}
                                <div>
                                    <h4 className="text-gray-900 font-semibold mb-3">Recent Orders</h4>
                                    {userDetails.recent_orders?.length > 0 ? (
                                        <div className="space-y-2">
                                            {userDetails.recent_orders.map((order) => (
                                                <div key={order.id} className="flex items-center justify-between bg-gray-50 rounded-xl p-3">
                                                    <div className="flex items-center gap-3">
                                                        <ShoppingBag className="w-5 h-5 text-gray-400" />
                                                        <div>
                                                            <p className="text-gray-900 font-mono text-sm">#{order.id.slice(0, 8)}</p>
                                                            <p className="text-gray-500 text-xs">
                                                                {new Date(order.created_at).toLocaleDateString()}
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <div className="text-right">
                                                        <p className="text-gray-900 font-medium">{formatCurrency(order.total_amount)}</p>
                                                        <span className={`text-xs px-2 py-0.5 rounded-full capitalize ${getStatusColor(order.status)}`}>
                                                            {order.status}
                                                        </span>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <p className="text-gray-500 text-center py-4">No orders yet</p>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </AdminLayout>
    );
};

export default Customers;
