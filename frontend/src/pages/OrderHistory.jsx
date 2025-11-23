import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchOrders } from '../services/api';
import { Package, Calendar, ChevronRight, ShoppingBag, Download, Eye } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

const OrderHistory = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [expandedOrders, setExpandedOrders] = useState({});
    const navigate = useNavigate();
    const { token, user } = useAuth();

    const toggleOrder = (orderId) => {
        setExpandedOrders(prev => ({
            ...prev,
            [orderId]: !prev[orderId]
        }));
    };

    const generateInvoiceDoc = (order) => {
        try {
            const doc = new jsPDF();

            // Header
            doc.setFontSize(20);
            doc.text('INVOICE', 105, 20, { align: 'center' });

            doc.setFontSize(10);
            doc.text('Clotherr Inc.', 105, 25, { align: 'center' });
            doc.text('support@clotherr.online', 105, 30, { align: 'center' });

            // Order Details
            doc.setFontSize(12);
            doc.text(`Order ID: ${order.id}`, 14, 45);
            doc.text(`Date: ${new Date(order.created_at).toLocaleDateString()}`, 14, 52);
            doc.text(`Status: ${order.status.toUpperCase()}`, 14, 59);

            // Customer Details
            doc.text('Bill To:', 140, 45);
            doc.setFontSize(10);
            doc.text(user?.full_name || 'Customer', 140, 50);
            doc.text(user?.email || '', 140, 55);

            // Split address for better formatting
            const addressLines = doc.splitTextToSize(String(order.shipping_address || ''), 60);
            doc.text(addressLines, 140, 60);

            // Items Table
            const tableColumn = ["Product", "Quantity", "Price", "Total"];
            const tableRows = [];

            order.order_items.forEach(item => {
                const productData = [
                    item.products?.name || 'Unknown Product',
                    item.quantity,
                    `Rs. ${Number(item.price_at_purchase).toFixed(2)}`,
                    `Rs. ${(item.quantity * item.price_at_purchase).toFixed(2)}`,
                ];
                tableRows.push(productData);
            });

            autoTable(doc, {
                head: [tableColumn],
                body: tableRows,
                startY: 80,
                theme: 'grid',
                headStyles: { fillColor: [0, 0, 0] },
                styles: { fontSize: 10 },
            });

            // Total
            const finalY = doc.lastAutoTable.finalY || 80;
            doc.setFontSize(12);
            doc.setFont('helvetica', 'bold');
            doc.text(`Total Amount: Rs. ${Number(order.total_amount).toFixed(2)}`, 140, finalY + 15);

            // Footer
            doc.setFontSize(10);
            doc.setFont('helvetica', 'normal');
            doc.text('Thank you for shopping with Clotherr!', 105, 280, { align: 'center' });

            return doc;
        } catch (err) {
            console.error("Invoice generation failed:", err);
            alert("Failed to generate invoice. Please try again.");
            return null;
        }
    };

    const handleDownloadInvoice = (e, order) => {
        e.stopPropagation();
        const doc = generateInvoiceDoc(order);
        if (doc) {
            doc.save(`Invoice_${order.id.slice(0, 8)}.pdf`);
        }
    };

    const handleViewInvoice = (e, order) => {
        e.stopPropagation();
        const doc = generateInvoiceDoc(order);
        if (doc) {
            window.open(doc.output('bloburl'), '_blank');
        }
    };

    useEffect(() => {
        if (!token) {
            navigate('/login');
            return;
        }

        const loadOrders = async () => {
            try {
                const data = await fetchOrders(token);
                // Sort orders by date descending (newest first)
                const sortedOrders = data.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
                setOrders(sortedOrders);
            } catch (err) {
                setError('Failed to load orders. Please try again later.');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        loadOrders();
    }, [token, navigate]);

    if (loading) {
        return (
            <div className="pt-24 pb-12 flex justify-center items-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="pt-24 pb-12 text-center text-red-500 min-h-screen">
                {error}
            </div>
        );
    }

    return (
        <div className="pt-24 pb-12 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 min-h-screen">
            <h1 className="text-3xl font-bold text-gray-900 mb-8">Order History</h1>

            {orders.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-lg shadow-sm border border-gray-100">
                    <ShoppingBag className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                    <h3 className="text-lg font-medium text-gray-900">No orders yet</h3>
                    <p className="mt-1 text-gray-500">Start shopping to see your orders here.</p>
                    <button
                        onClick={() => navigate('/shop')}
                        className="mt-6 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-black hover:bg-gray-800"
                    >
                        Start Shopping
                    </button>
                </div>
            ) : (
                <div className="space-y-6">
                    {orders.map((order) => (
                        <div key={order.id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                            <div
                                className="p-6 border-b border-gray-100 bg-gray-50 cursor-pointer hover:bg-gray-100 transition-colors"
                                onClick={() => toggleOrder(order.id)}
                            >
                                <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                                    <div>
                                        <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
                                            <Calendar className="h-4 w-4" />
                                            {new Date(order.created_at).toLocaleDateString('en-US', {
                                                year: 'numeric',
                                                month: 'long',
                                                day: 'numeric'
                                            })}
                                        </div>
                                        <p className="text-sm font-medium text-gray-900">Order #{order.id.slice(0, 8)}</p>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <span className={`px-3 py-1 rounded-full text-xs font-medium capitalize
                                            ${order.status === 'delivered' ? 'bg-green-100 text-green-800' :
                                                order.status === 'shipped' ? 'bg-blue-100 text-blue-800' :
                                                    order.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                                                        'bg-yellow-100 text-yellow-800'}`}>
                                            {order.status}
                                        </span>
                                        <p className="text-lg font-bold text-gray-900">₹{order.total_amount.toFixed(2)}</p>

                                        <div className="flex items-center">
                                            <button
                                                onClick={(e) => handleViewInvoice(e, order)}
                                                className="p-2 text-gray-500 hover:text-black transition-colors"
                                                title="View Invoice"
                                            >
                                                <Eye className="h-5 w-5" />
                                            </button>
                                            <button
                                                onClick={(e) => handleDownloadInvoice(e, order)}
                                                className="p-2 text-gray-500 hover:text-black transition-colors"
                                                title="Download Invoice"
                                            >
                                                <Download className="h-5 w-5" />
                                            </button>
                                        </div>

                                        <ChevronRight
                                            className={`h-5 w-5 text-gray-400 transition-transform duration-200 ${expandedOrders[order.id] ? 'transform rotate-90' : ''}`}
                                        />
                                    </div>
                                </div>
                            </div>

                            {expandedOrders[order.id] && (
                                <div className="p-6 bg-white border-t border-gray-100 animate-fadeIn">
                                    <h4 className="text-sm font-medium text-gray-900 mb-4 flex items-center gap-2">
                                        <Package className="h-4 w-4" />
                                        Items
                                    </h4>
                                    <div className="space-y-4">
                                        {order.order_items?.map((item, index) => (
                                            <div key={index} className="flex justify-between items-center py-2 border-b border-gray-50 last:border-0">
                                                <div className="flex items-center gap-4">
                                                    <div className="h-16 w-16 bg-gray-100 rounded-md overflow-hidden">
                                                        {item.products?.image_url ? (
                                                            <img
                                                                src={item.products.image_url}
                                                                alt={item.products.name}
                                                                className="h-full w-full object-cover"
                                                            />
                                                        ) : (
                                                            <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">
                                                                No Img
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div>
                                                        <p className="font-medium text-gray-900">{item.products?.name || 'Unknown Product'}</p>
                                                        <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
                                                    </div>
                                                </div>
                                                <p className="font-medium text-gray-900">₹{item.price_at_purchase.toFixed(2)}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default OrderHistory;
