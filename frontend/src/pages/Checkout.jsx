import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { createOrder } from '../services/api';
import { CheckCircle, MapPin, CreditCard, Package, ArrowLeft } from 'lucide-react';

const Checkout = () => {
    const navigate = useNavigate();
    const { cartItems, getCartTotal, clearCart } = useCart();
    const { user, token } = useAuth();
    const [currentStep, setCurrentStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [orderPlaced, setOrderPlaced] = useState(false);

    // Address form state
    const [address, setAddress] = useState({
        full_name: user?.full_name || '',
        phone: user?.phone || '',
        address_line1: user?.address_line1 || '',
        address_line2: user?.address_line2 || '',
        city: user?.city || '',
        state: user?.state || '',
        postal_code: user?.postal_code || '',
        country: user?.country || ''
    });

    const handleAddressChange = (e) => {
        setAddress({ ...address, [e.target.name]: e.target.value });
    };

    const handlePlaceOrder = async () => {
        try {
            setLoading(true);

            const orderData = {
                total_amount: getCartTotal(),
                shipping_address: `${address.address_line1}, ${address.city}, ${address.state} ${address.postal_code}`,
                status: "pending",
                items: cartItems.map(item => ({
                    product_id: item.id,
                    quantity: item.quantity,
                    price_at_purchase: item.price
                }))
            };

            await createOrder(orderData, token);
            clearCart();
            setOrderPlaced(true);
        } catch (error) {
            alert('Failed to place order: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    if (!user) {
        navigate('/login');
        return null;
    }

    if (cartItems.length === 0 && !orderPlaced) {
        return (
            <div className="min-h-screen bg-gray-50 pt-20 flex items-center justify-center">
                <div className="text-center">
                    <Package className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Your cart is empty</h2>
                    <button
                        onClick={() => navigate('/shop')}
                        className="mt-4 bg-black text-white px-6 py-3 rounded-lg hover:bg-gray-800"
                    >
                        Continue Shopping
                    </button>
                </div>
            </div>
        );
    }

    if (orderPlaced) {
        return (
            <div className="min-h-screen bg-gray-50 pt-20 flex items-center justify-center">
                <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
                    <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Order Placed Successfully!</h2>
                    <p className="text-gray-600 mb-6">Thank you for your order. We'll send you a confirmation email shortly.</p>
                    <div className="space-y-3">
                        <button
                            onClick={() => navigate('/shop')}
                            className="w-full bg-black text-white px-6 py-3 rounded-lg hover:bg-gray-800"
                        >
                            Continue Shopping
                        </button>
                        <button
                            onClick={() => navigate('/')}
                            className="w-full bg-gray-200 text-gray-900 px-6 py-3 rounded-lg hover:bg-gray-300"
                        >
                            Go to Home
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    const steps = [
        { number: 1, title: 'Review Order', icon: Package },
        { number: 2, title: 'Shipping Address', icon: MapPin },
        { number: 3, title: 'Payment', icon: CreditCard }
    ];

    return (
        <div className="min-h-screen bg-gray-50 pt-20 pb-12">
            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Back Button */}
                <button
                    onClick={() => currentStep > 1 ? setCurrentStep(currentStep - 1) : navigate('/shop')}
                    className="flex items-center text-gray-600 hover:text-gray-900 mb-6"
                >
                    <ArrowLeft className="h-5 w-5 mr-2" />
                    {currentStep > 1 ? 'Back' : 'Back to Shop'}
                </button>

                {/* Progress Steps */}
                <div className="mb-8">
                    <div className="flex items-center justify-between">
                        {steps.map((step, index) => (
                            <React.Fragment key={step.number}>
                                <div className="flex flex-col items-center flex-1">
                                    <div className={`w-12 h-12 rounded-full flex items-center justify-center ${currentStep >= step.number ? 'bg-black text-white' : 'bg-gray-200 text-gray-600'
                                        }`}>
                                        <step.icon className="h-6 w-6" />
                                    </div>
                                    <p className={`mt-2 text-sm font-medium ${currentStep >= step.number ? 'text-black' : 'text-gray-500'
                                        }`}>
                                        {step.title}
                                    </p>
                                </div>
                                {index < steps.length - 1 && (
                                    <div className={`flex-1 h-1 mx-4 ${currentStep > step.number ? 'bg-black' : 'bg-gray-200'
                                        }`} />
                                )}
                            </React.Fragment>
                        ))}
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Main Content */}
                    <div className="lg:col-span-2">
                        {/* Step 1: Review Order */}
                        {currentStep === 1 && (
                            <div className="bg-white rounded-lg shadow p-6">
                                <h2 className="text-2xl font-bold mb-6">Review Your Order</h2>
                                <div className="space-y-4">
                                    {cartItems.map((item) => (
                                        <div key={item.cartId} className="flex items-center space-x-4 pb-4 border-b">
                                            <img
                                                src={item.image_url}
                                                alt={item.name}
                                                className="w-20 h-20 object-cover rounded"
                                            />
                                            <div className="flex-1">
                                                <h3 className="font-semibold">{item.name}</h3>
                                                <p className="text-sm text-gray-600">Quantity: {item.quantity}</p>
                                                {item.size && <p className="text-sm text-gray-600">Size: {item.size}</p>}
                                            </div>
                                            <p className="font-bold">${(item.price * item.quantity).toFixed(2)}</p>
                                        </div>
                                    ))}
                                </div>
                                <button
                                    onClick={() => setCurrentStep(2)}
                                    className="w-full mt-6 bg-black text-white py-3 rounded-lg hover:bg-gray-800"
                                >
                                    Continue to Shipping
                                </button>
                            </div>
                        )}

                        {/* Step 2: Shipping Address */}
                        {currentStep === 2 && (
                            <div className="space-y-6">
                                {/* Order Items Preview */}
                                <div className="bg-white rounded-lg shadow p-6">
                                    <h3 className="text-lg font-bold mb-4">Order Items ({cartItems.length})</h3>
                                    <div className="space-y-3">
                                        {cartItems.map((item) => (
                                            <div key={item.cartId} className="flex items-center space-x-3 pb-3 border-b last:border-b-0">
                                                <img
                                                    src={item.image_url}
                                                    alt={item.name}
                                                    className="w-16 h-16 object-cover rounded"
                                                />
                                                <div className="flex-1">
                                                    <p className="font-medium text-sm">{item.name}</p>
                                                    <p className="text-xs text-gray-600">Qty: {item.quantity}</p>
                                                    {item.size && <p className="text-xs text-gray-600">Size: {item.size}</p>}
                                                </div>
                                                <p className="font-semibold text-sm">${(item.price * item.quantity).toFixed(2)}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Shipping Address Form */}
                                <div className="bg-white rounded-lg shadow p-6">
                                    <h2 className="text-2xl font-bold mb-6">Shipping Address</h2>
                                    <div className="space-y-4">
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                                                <input
                                                    type="text"
                                                    name="full_name"
                                                    value={address.full_name}
                                                    onChange={handleAddressChange}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-black"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                                                <input
                                                    type="tel"
                                                    name="phone"
                                                    value={address.phone}
                                                    onChange={handleAddressChange}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-black"
                                                />
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Address Line 1</label>
                                            <input
                                                type="text"
                                                name="address_line1"
                                                value={address.address_line1}
                                                onChange={handleAddressChange}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-black"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Address Line 2 (Optional)</label>
                                            <input
                                                type="text"
                                                name="address_line2"
                                                value={address.address_line2}
                                                onChange={handleAddressChange}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-black"
                                            />
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                                                <input
                                                    type="text"
                                                    name="city"
                                                    value={address.city}
                                                    onChange={handleAddressChange}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-black"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
                                                <input
                                                    type="text"
                                                    name="state"
                                                    value={address.state}
                                                    onChange={handleAddressChange}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-black"
                                                />
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">Postal Code</label>
                                                <input
                                                    type="text"
                                                    name="postal_code"
                                                    value={address.postal_code}
                                                    onChange={handleAddressChange}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-black"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">Country</label>
                                                <input
                                                    type="text"
                                                    name="country"
                                                    value={address.country}
                                                    onChange={handleAddressChange}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-black"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => setCurrentStep(3)}
                                        className="w-full mt-6 bg-black text-white py-3 rounded-lg hover:bg-gray-800"
                                    >
                                        Continue to Payment
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Step 3: Payment */}
                        {currentStep === 3 && (
                            <div className="space-y-6">
                                {/* Order Items Review */}
                                <div className="bg-white rounded-lg shadow p-6">
                                    <h3 className="text-lg font-bold mb-4">Order Items ({cartItems.length})</h3>
                                    <div className="space-y-3">
                                        {cartItems.map((item) => (
                                            <div key={item.cartId} className="flex items-center space-x-3 pb-3 border-b last:border-b-0">
                                                <img
                                                    src={item.image_url}
                                                    alt={item.name}
                                                    className="w-16 h-16 object-cover rounded"
                                                />
                                                <div className="flex-1">
                                                    <p className="font-medium text-sm">{item.name}</p>
                                                    <p className="text-xs text-gray-600">Qty: {item.quantity}</p>
                                                    {item.size && <p className="text-xs text-gray-600">Size: {item.size}</p>}
                                                </div>
                                                <p className="font-semibold text-sm">${(item.price * item.quantity).toFixed(2)}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Shipping Address Review */}
                                <div className="bg-white rounded-lg shadow p-6">
                                    <div className="flex justify-between items-center mb-4">
                                        <h3 className="text-lg font-bold">Shipping Address</h3>
                                        <button
                                            onClick={() => setCurrentStep(2)}
                                            className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                                        >
                                            Edit
                                        </button>
                                    </div>
                                    <div className="text-gray-700 text-sm space-y-1">
                                        <p className="font-medium text-base text-gray-900">{address.full_name}</p>
                                        <p>{address.address_line1}</p>
                                        {address.address_line2 && <p>{address.address_line2}</p>}
                                        <p>{address.city}, {address.state} {address.postal_code}</p>
                                        <p>{address.country}</p>
                                        <p className="pt-2 flex items-center text-gray-600">
                                            <span className="mr-2">Phone:</span> {address.phone}
                                        </p>
                                    </div>
                                </div>

                                {/* Payment Method */}
                                <div className="bg-white rounded-lg shadow p-6">
                                    <h2 className="text-2xl font-bold mb-6">Payment Method</h2>
                                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                                        <p className="text-blue-800 text-sm">
                                            <strong>Demo Mode:</strong> Payment processing is simulated. No actual payment will be charged.
                                        </p>
                                    </div>
                                    <div className="space-y-4">
                                        <div className="border-2 border-black rounded-lg p-4 bg-gray-50">
                                            <div className="flex items-center">
                                                <input type="radio" checked readOnly className="mr-3" />
                                                <div>
                                                    <p className="font-semibold">Cash on Delivery</p>
                                                    <p className="text-sm text-gray-600">Pay when you receive your order</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <button
                                        onClick={handlePlaceOrder}
                                        disabled={loading}
                                        className="w-full mt-6 bg-black text-white py-3 rounded-lg hover:bg-gray-800 disabled:bg-gray-400"
                                    >
                                        {loading ? 'Processing...' : 'Place Order'}
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Order Summary Sidebar */}
                    <div className="lg:col-span-1">
                        <div className="bg-white rounded-lg shadow p-6 sticky top-24">
                            <h3 className="text-lg font-bold mb-4">Order Summary</h3>
                            <div className="space-y-3 mb-4">
                                <div className="flex justify-between text-sm">
                                    <span>Subtotal ({cartItems.length} items)</span>
                                    <span>${getCartTotal().toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span>Shipping</span>
                                    <span className="text-green-600">FREE</span>
                                </div>
                                <div className="border-t pt-3 flex justify-between font-bold text-lg">
                                    <span>Total</span>
                                    <span>${getCartTotal().toFixed(2)}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Checkout;
