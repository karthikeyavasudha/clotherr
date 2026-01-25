import React, { useState, useEffect } from 'react';
import {
    Search,
    Eye,
    X,
    ShoppingCart,
    AlertTriangle,
    Package,
    Truck,
    Save,
    ExternalLink
} from 'lucide-react';
import {
    fetchAdminOrders,
    fetchOrderDetails,
    updateOrderStatus,
    updateOrderShipping,
    fetchOrderStatuses
} from '../../services/adminApi';
import AdminLayout from '../../components/admin/AdminLayout';

const CARRIERS = ['DTDC', 'Blue Dart', 'Delhivery', 'FedEx', 'India Post', 'Ecom Express', 'Xpressbees', 'Other'];

const Orders = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [orderDetails, setOrderDetails] = useState(null);
    const [loadingDetails, setLoadingDetails] = useState(false);
    const [updatingStatus, setUpdatingStatus] = useState(null);
    const [savingShipping, setSavingShipping] = useState(false);
    const [statusOptions, setStatusOptions] = useState([]);
    const [shippingForm, setShippingForm] = useState({
        tracking_number: '',
        carrier: '',
        tracking_url: '',
        estimated_delivery: ''
    });

    useEffect(() => {
        loadStatusOptions();
    }, []);

    useEffect(() => {
        loadOrders();
    }, [statusFilter]);

    const loadStatusOptions = async () => {
        try {
            const statuses = await fetchOrderStatuses();
            setStatusOptions(statuses);
        } catch (err) {
            console.error('Failed to load status options:', err);
            // Fallback to default statuses
            setStatusOptions([
                { status_code: 'pending', display_name: 'Pending' },
                { status_code: 'paid', display_name: 'Paid' },
                { status_code: 'shipped', display_name: 'Shipped' },
                { status_code: 'in_transit', display_name: 'In Transit' },
                { status_code: 'out_for_delivery', display_name: 'Out for Delivery' },
                { status_code: 'delivered', display_name: 'Delivered' },
                { status_code: 'cancelled', display_name: 'Cancelled' }
            ]);
        }
    };

    const loadOrders = async () => {
        try {
            setLoading(true);
            const data = await fetchAdminOrders(0, 100, statusFilter);
            setOrders(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleViewOrder = async (orderId) => {
        setSelectedOrder(orderId);
        setLoadingDetails(true);
        try {
            const details = await fetchOrderDetails(orderId);
            setOrderDetails(details);
            // Initialize shipping form with current values
            setShippingForm({
                tracking_number: details.tracking_number || '',
                carrier: details.carrier || '',
                tracking_url: details.tracking_url || '',
                estimated_delivery: details.estimated_delivery || ''
            });
        } catch (err) {
            setError(err.message);
        } finally {
            setLoadingDetails(false);
        }
    };

    const handleSaveShipping = async () => {
        if (!orderDetails) return;
        setSavingShipping(true);
        try {
            const updated = await updateOrderShipping(orderDetails.id, shippingForm);
            setOrderDetails({ ...orderDetails, ...updated });
            // Update in orders list too
            setOrders(orders.map(o => o.id === orderDetails.id ? { ...o, ...updated } : o));
        } catch (err) {
            setError(err.message);
        } finally {
            setSavingShipping(false);
        }
    };

    const handleStatusChange = async (orderId, newStatus) => {
        setUpdatingStatus(orderId);
        try {
            await updateOrderStatus(orderId, newStatus);
            loadOrders();
            if (orderDetails && orderDetails.id === orderId) {
                setOrderDetails({ ...orderDetails, status: newStatus });
            }
        } catch (err) {
            setError(err.message);
        } finally {
            setUpdatingStatus(null);
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
            pending: 'bg-yellow-100 text-yellow-700 border-yellow-200',
            paid: 'bg-blue-100 text-blue-700 border-blue-200',
            shipped: 'bg-purple-100 text-purple-700 border-purple-200',
            delivered: 'bg-green-100 text-green-700 border-green-200',
            cancelled: 'bg-red-100 text-red-700 border-red-200'
        };
        return colors[status] || 'bg-gray-100 text-gray-700 border-gray-200';
    };

    return (
        <AdminLayout>
            <div className="space-y-6">
                {/* Header */}
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Orders</h1>
                    <p className="text-gray-500 mt-1">Manage customer orders and update statuses</p>
                </div>

                {/* Filters */}
                <div className="flex flex-wrap gap-2">
                    <button
                        onClick={() => setStatusFilter('')}
                        className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${statusFilter === ''
                                ? 'bg-black text-white'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                    >
                        All
                    </button>
                    {statusOptions.map((status) => (
                        <button
                            key={status.status_code}
                            onClick={() => setStatusFilter(status.status_code)}
                            className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${statusFilter === status.status_code
                                    ? 'bg-black text-white'
                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                }`}
                        >
                            {status.display_name}
                        </button>
                    ))}
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

                {/* Orders Table */}
                <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
                    {loading ? (
                        <div className="flex items-center justify-center h-64">
                            <div className="w-10 h-10 border-4 border-black border-t-transparent rounded-full animate-spin" />
                        </div>
                    ) : orders.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-64 text-gray-500">
                            <ShoppingCart className="w-12 h-12 mb-4" />
                            <p>No orders found</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="text-gray-500 text-sm border-b border-gray-200">
                                        <th className="text-left p-4 font-medium">Order ID</th>
                                        <th className="text-left p-4 font-medium">Customer</th>
                                        <th className="text-left p-4 font-medium">Items</th>
                                        <th className="text-left p-4 font-medium">Total</th>
                                        <th className="text-left p-4 font-medium">Status</th>
                                        <th className="text-left p-4 font-medium">Date</th>
                                        <th className="text-right p-4 font-medium">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {orders.map((order) => (
                                        <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                                            <td className="p-4 text-gray-900 font-mono text-sm">
                                                #{order.id.slice(0, 8)}
                                            </td>
                                            <td className="p-4">
                                                <div>
                                                    <p className="text-gray-900">
                                                        {order.users?.full_name || 'Unknown'}
                                                    </p>
                                                    <p className="text-gray-500 text-sm">
                                                        {order.users?.email}
                                                    </p>
                                                </div>
                                            </td>
                                            <td className="p-4 text-gray-700">
                                                {order.order_items?.length || 0} items
                                            </td>
                                            <td className="p-4 text-gray-900 font-medium">
                                                {formatCurrency(order.total_amount)}
                                            </td>
                                            <td className="p-4">
                                                <select
                                                    value={order.status}
                                                    onChange={(e) => handleStatusChange(order.id, e.target.value)}
                                                    disabled={updatingStatus === order.id}
                                                    className={`px-3 py-1.5 rounded-lg text-sm font-medium border cursor-pointer focus:outline-none focus:ring-2 focus:ring-black ${getStatusColor(order.status)}`}
                                                >
                                                    {statusOptions.map((status) => (
                                                        <option key={status.status_code} value={status.status_code} className="bg-white text-gray-900">
                                                            {status.display_name}
                                                        </option>
                                                    ))}
                                                </select>
                                            </td>
                                            <td className="p-4 text-gray-500 text-sm">
                                                {new Date(order.created_at).toLocaleDateString('en-IN', {
                                                    day: 'numeric',
                                                    month: 'short',
                                                    year: 'numeric'
                                                })}
                                            </td>
                                            <td className="p-4 text-right">
                                                <button
                                                    onClick={() => handleViewOrder(order.id)}
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

            {/* Order Details Modal */}
            {selectedOrder && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/20" onClick={() => { setSelectedOrder(null); setOrderDetails(null); }} />
                    <div className="relative bg-white rounded-2xl border border-gray-200 w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-xl">
                        <div className="sticky top-0 bg-white p-6 border-b border-gray-200 flex items-center justify-between">
                            <h2 className="text-xl font-bold text-gray-900">
                                Order Details
                            </h2>
                            <button
                                onClick={() => { setSelectedOrder(null); setOrderDetails(null); }}
                                className="p-2 text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded-lg"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {loadingDetails ? (
                            <div className="flex items-center justify-center h-64">
                                <div className="w-10 h-10 border-4 border-black border-t-transparent rounded-full animate-spin" />
                            </div>
                        ) : orderDetails && (
                            <div className="p-6 space-y-6">
                                {/* Order Info */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <p className="text-gray-500 text-sm">Order ID</p>
                                        <p className="text-gray-900 font-mono">#{orderDetails.id.slice(0, 8)}</p>
                                    </div>
                                    <div>
                                        <p className="text-gray-500 text-sm">Status</p>
                                        <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium capitalize ${getStatusColor(orderDetails.status)}`}>
                                            {orderDetails.status}
                                        </span>
                                    </div>
                                    <div>
                                        <p className="text-gray-500 text-sm">Date</p>
                                        <p className="text-gray-900">
                                            {new Date(orderDetails.created_at).toLocaleString('en-IN')}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-gray-500 text-sm">Total</p>
                                        <p className="text-gray-900 font-bold text-lg">
                                            {formatCurrency(orderDetails.total_amount)}
                                        </p>
                                    </div>
                                </div>

                                {/* Customer Info */}
                                <div className="bg-gray-50 rounded-xl p-4">
                                    <h3 className="text-gray-900 font-semibold mb-3">Customer</h3>
                                    <div className="space-y-1 text-sm">
                                        <p className="text-gray-900">{orderDetails.users?.full_name}</p>
                                        <p className="text-gray-500">{orderDetails.users?.email}</p>
                                        <p className="text-gray-500">{orderDetails.users?.phone}</p>
                                    </div>
                                </div>

                                {/* Shipping Address */}
                                <div className="bg-gray-50 rounded-xl p-4">
                                    <h3 className="text-gray-900 font-semibold mb-3">Shipping Address</h3>
                                    <p className="text-gray-700 text-sm whitespace-pre-line">
                                        {orderDetails.shipping_address}
                                    </p>
                                </div>

                                {/* Shipping & Tracking - Only show when order is shipped or beyond */}
                                {['shipped', 'in_transit', 'out_for_delivery', 'delivered'].includes(orderDetails.status) ? (
                                    <div className="bg-blue-50 rounded-xl p-4 border border-blue-100">
                                        <div className="flex items-center justify-between mb-4">
                                            <h3 className="text-gray-900 font-semibold flex items-center gap-2">
                                                <Truck className="w-4 h-4 text-blue-600" />
                                                Shipping & Tracking
                                            </h3>
                                            <button
                                                onClick={handleSaveShipping}
                                                disabled={savingShipping}
                                                className="flex items-center gap-1 px-3 py-1.5 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50"
                                            >
                                                <Save className="w-4 h-4" />
                                                {savingShipping ? 'Saving...' : 'Save'}
                                            </button>
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">Carrier</label>
                                                <select
                                                    value={shippingForm.carrier}
                                                    onChange={(e) => setShippingForm({...shippingForm, carrier: e.target.value})}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
                                                >
                                                    <option value="">Select Carrier</option>
                                                    {CARRIERS.map(c => (
                                                        <option key={c} value={c}>{c}</option>
                                                    ))}
                                                </select>
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">Tracking Number</label>
                                                <input
                                                    type="text"
                                                    value={shippingForm.tracking_number}
                                                    onChange={(e) => setShippingForm({...shippingForm, tracking_number: e.target.value})}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
                                                    placeholder="Enter tracking number"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">Est. Delivery</label>
                                                <input
                                                    type="date"
                                                    value={shippingForm.estimated_delivery}
                                                    onChange={(e) => setShippingForm({...shippingForm, estimated_delivery: e.target.value})}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">Tracking URL</label>
                                                <input
                                                    type="url"
                                                    value={shippingForm.tracking_url}
                                                    onChange={(e) => setShippingForm({...shippingForm, tracking_url: e.target.value})}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
                                                    placeholder="https://..."
                                                />
                                            </div>
                                        </div>
                                        {orderDetails.tracking_url && (
                                            <a
                                                href={orderDetails.tracking_url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="mt-3 inline-flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800 font-medium"
                                            >
                                                View Tracking <ExternalLink className="w-3 h-3" />
                                            </a>
                                        )}
                                    </div>
                                ) : (
                                    <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                                        <h3 className="text-gray-500 font-medium flex items-center gap-2">
                                            <Truck className="w-4 h-4" />
                                            Shipping & Tracking
                                        </h3>
                                        <p className="text-gray-400 text-sm mt-2">Shipping details can be added once the order status is changed to "Shipped"</p>
                                    </div>
                                )}

                                {/* Order Items */}
                                <div>
                                    <h3 className="text-gray-900 font-semibold mb-3">Items</h3>
                                    <div className="space-y-3">
                                        {orderDetails.order_items?.map((item) => (
                                            <div key={item.id} className="flex items-center gap-4 bg-gray-50 rounded-xl p-3">
                                                <div className="w-14 h-14 rounded-lg bg-gray-200 overflow-hidden flex-shrink-0">
                                                    {item.products?.image_url ? (
                                                        <img
                                                            src={item.products.image_url}
                                                            alt={item.products?.name}
                                                            className="w-full h-full object-cover"
                                                        />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center">
                                                            <Package className="w-6 h-6 text-gray-400" />
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="flex-1">
                                                    <p className="text-gray-900">{item.products?.name || 'Unknown Product'}</p>
                                                    <p className="text-gray-500 text-sm">
                                                        Qty: {item.quantity} × {formatCurrency(item.price_at_purchase)}
                                                    </p>
                                                </div>
                                                <p className="text-gray-900 font-medium">
                                                    {formatCurrency(item.quantity * item.price_at_purchase)}
                                                </p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </AdminLayout>
    );
};

export default Orders;
