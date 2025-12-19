import React, { useState, useEffect } from 'react';
import {
    Package,
    ShoppingCart,
    Users,
    DollarSign,
    TrendingUp,
    AlertTriangle,
    ArrowUpRight,
    ArrowDownRight
} from 'lucide-react';
import { fetchDashboardStats } from '../../services/adminApi';
import AdminLayout from '../../components/admin/AdminLayout';

const StatCard = ({ title, value, icon: Icon, trend, trendUp, color }) => (
    <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
        <div className="flex items-start justify-between">
            <div>
                <p className="text-gray-500 text-sm font-medium">{title}</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{value}</p>
                {trend && (
                    <div className={`flex items-center gap-1 mt-2 text-sm ${trendUp ? 'text-green-600' : 'text-red-600'}`}>
                        {trendUp ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
                        <span>{trend}</span>
                    </div>
                )}
            </div>
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${color}`}>
                <Icon className="w-6 h-6 text-white" />
            </div>
        </div>
    </div>
);

const Dashboard = () => {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        loadStats();
    }, []);

    const loadStats = async () => {
        try {
            setLoading(true);
            const data = await fetchDashboardStats();
            setStats(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
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

    if (loading) {
        return (
            <AdminLayout>
                <div className="flex items-center justify-center h-96">
                    <div className="w-12 h-12 border-4 border-black border-t-transparent rounded-full animate-spin" />
                </div>
            </AdminLayout>
        );
    }

    if (error) {
        return (
            <AdminLayout>
                <div className="flex items-center justify-center h-96">
                    <div className="text-center">
                        <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                        <p className="text-red-600">{error}</p>
                        <button
                            onClick={loadStats}
                            className="mt-4 px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors"
                        >
                            Retry
                        </button>
                    </div>
                </div>
            </AdminLayout>
        );
    }

    return (
        <AdminLayout>
            <div className="space-y-8">
                {/* Header */}
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
                    <p className="text-gray-500 mt-1">Welcome back! Here's what's happening with your store.</p>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <StatCard
                        title="Total Revenue"
                        value={formatCurrency(stats?.total_revenue || 0)}
                        icon={DollarSign}
                        color="bg-green-600"
                    />
                    <StatCard
                        title="Total Orders"
                        value={stats?.total_orders || 0}
                        icon={ShoppingCart}
                        color="bg-blue-600"
                    />
                    <StatCard
                        title="Products"
                        value={stats?.total_products || 0}
                        icon={Package}
                        color="bg-gray-900"
                    />
                    <StatCard
                        title="Customers"
                        value={stats?.total_customers || 0}
                        icon={Users}
                        color="bg-orange-500"
                    />
                </div>

                {/* Orders by Status */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Order Status */}
                    <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
                        <h2 className="text-lg font-semibold text-gray-900 mb-4">Orders by Status</h2>
                        <div className="space-y-3">
                            {Object.entries(stats?.orders_by_status || {}).map(([status, count]) => (
                                <div key={status} className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <span className={`px-3 py-1 rounded-full text-xs font-medium capitalize ${getStatusColor(status)}`}>
                                            {status}
                                        </span>
                                    </div>
                                    <span className="text-gray-900 font-semibold">{count}</span>
                                </div>
                            ))}
                            {Object.keys(stats?.orders_by_status || {}).length === 0 && (
                                <p className="text-gray-500 text-center py-4">No orders yet</p>
                            )}
                        </div>
                    </div>

                    {/* Low Stock Alert */}
                    <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
                        <div className="flex items-center gap-2 mb-4">
                            <AlertTriangle className="w-5 h-5 text-amber-500" />
                            <h2 className="text-lg font-semibold text-gray-900">Low Stock Alert</h2>
                        </div>
                        <div className="space-y-3">
                            {(stats?.low_stock_products || []).map((product) => (
                                <div key={product.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                                    <span className="text-gray-900 truncate flex-1">{product.name}</span>
                                    <span className={`px-2 py-1 rounded-lg text-xs font-medium ${product.stock === 0 ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'
                                        }`}>
                                        {product.stock} left
                                    </span>
                                </div>
                            ))}
                            {(stats?.low_stock_products || []).length === 0 && (
                                <p className="text-gray-500 text-center py-4">All products well stocked!</p>
                            )}
                        </div>
                    </div>
                </div>

                {/* Recent Orders */}
                <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Orders</h2>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="text-gray-500 text-sm border-b border-gray-200">
                                    <th className="text-left pb-4 font-medium">Order ID</th>
                                    <th className="text-left pb-4 font-medium">Customer</th>
                                    <th className="text-left pb-4 font-medium">Amount</th>
                                    <th className="text-left pb-4 font-medium">Status</th>
                                    <th className="text-left pb-4 font-medium">Date</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {(stats?.recent_orders || []).map((order) => (
                                    <tr key={order.id} className="text-sm">
                                        <td className="py-4 text-gray-900 font-mono">
                                            #{order.id.slice(0, 8)}
                                        </td>
                                        <td className="py-4 text-gray-900">
                                            {order.users?.full_name || order.users?.email || 'Unknown'}
                                        </td>
                                        <td className="py-4 text-gray-900 font-medium">
                                            {formatCurrency(order.total_amount)}
                                        </td>
                                        <td className="py-4">
                                            <span className={`px-3 py-1 rounded-full text-xs font-medium capitalize ${getStatusColor(order.status)}`}>
                                                {order.status}
                                            </span>
                                        </td>
                                        <td className="py-4 text-gray-500">
                                            {new Date(order.created_at).toLocaleDateString()}
                                        </td>
                                    </tr>
                                ))}
                                {(stats?.recent_orders || []).length === 0 && (
                                    <tr>
                                        <td colSpan="5" className="py-8 text-center text-gray-500">
                                            No orders yet
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
};

export default Dashboard;
