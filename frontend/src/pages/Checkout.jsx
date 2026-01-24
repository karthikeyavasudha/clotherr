import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { createOrder, createRazorpayOrder, verifyRazorpayPayment, fetchPaymentSettings } from '../services/api';
import { CheckCircle, MapPin, CreditCard, Package, ArrowLeft, AlertCircle, Loader } from 'lucide-react';

const Checkout = () => {
    const navigate = useNavigate();
    const { cartItems, getCartTotal, clearCart } = useCart();
    const { user, token } = useAuth();
    const [currentStep, setCurrentStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [orderPlaced, setOrderPlaced] = useState(false);
    const [paymentMethod, setPaymentMethod] = useState('razorpay');
    const [paymentError, setPaymentError] = useState(null);
    
    // Payment settings from backend
    const [paymentSettings, setPaymentSettings] = useState(null);
    const [settingsLoading, setSettingsLoading] = useState(true);

    // Calculate total extra charges
    const getExtraChargesTotal = () => {
        let total = 0;
        // Add COD extra charge if applicable
        if (paymentMethod === 'cod' && paymentSettings?.cod_extra_charge_enabled) {
            total += paymentSettings?.cod_extra_charge || 0;
        }
        // Add custom extra charges
        if (paymentSettings?.extra_charges) {
            total += paymentSettings.extra_charges.reduce((sum, charge) => sum + (charge.amount || 0), 0);
        }
        return total;
    };

    // Get final total including extra charges
    const getFinalTotal = () => {
        return getCartTotal() + getExtraChargesTotal();
    };

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

    // Fetch payment settings on mount
    useEffect(() => {
        const loadPaymentSettings = async () => {
            try {
                const settings = await fetchPaymentSettings();
                setPaymentSettings(settings);
                // Set default payment method based on available options
                if (settings.payment_razorpay_enabled) {
                    setPaymentMethod('razorpay');
                } else if (settings.payment_cod_enabled) {
                    setPaymentMethod('cod');
                }
            } catch (error) {
                console.error('Failed to load payment settings:', error);
                // Use defaults
                setPaymentSettings({
                    payment_cod_enabled: true,
                    payment_razorpay_enabled: true,
                    min_order_amount: 0,
                    cod_extra_charge: 0,
                    extra_charges: []
                });
            } finally {
                setSettingsLoading(false);
            }
        };
        loadPaymentSettings();
    }, []);

    const handleAddressChange = (e) => {
        setAddress({ ...address, [e.target.name]: e.target.value });
    };

    const handleRazorpayPayment = async () => {
        try {
            setLoading(true);
            setPaymentError(null);

            const shippingAddress = `${address.full_name}, ${address.address_line1}${address.address_line2 ? ', ' + address.address_line2 : ''}, ${address.city}, ${address.state} ${address.postal_code}, ${address.country}. Phone: ${address.phone}`;

            // Create Razorpay order (includes extra charges except COD charge)
            const razorpayExtraCharges = paymentSettings?.extra_charges?.reduce((sum, charge) => sum + (charge.amount || 0), 0) || 0;
            const orderData = {
                amount: getCartTotal() + razorpayExtraCharges,
                shipping_address: shippingAddress,
                items: cartItems.map(item => ({
                    product_id: item.id,
                    quantity: item.quantity,
                    price_at_purchase: item.price
                }))
            };

            const razorpayData = await createRazorpayOrder(orderData, token);

            // Initialize Razorpay checkout
            const options = {
                key: razorpayData.razorpay_key_id,
                amount: razorpayData.amount,
                currency: razorpayData.currency,
                name: 'Clotherr',
                description: 'Payment for your order',
                order_id: razorpayData.razorpay_order_id,
                prefill: {
                    name: razorpayData.user_name,
                    email: razorpayData.user_email,
                    contact: razorpayData.user_phone
                },
                theme: {
                    color: '#000000'
                },
                handler: async function (response) {
                    try {
                        // Verify payment on backend
                        const verifyData = {
                            razorpay_order_id: response.razorpay_order_id,
                            razorpay_payment_id: response.razorpay_payment_id,
                            razorpay_signature: response.razorpay_signature,
                            order_id: razorpayData.order_id
                        };

                        await verifyRazorpayPayment(verifyData, token);
                        clearCart();
                        setOrderPlaced(true);
                    } catch (error) {
                        setPaymentError('Payment verification failed. Please contact support.');
                    }
                },
                modal: {
                    ondismiss: function () {
                        setLoading(false);
                        setPaymentError('Payment was cancelled. Please try again.');
                    }
                }
            };

            const razorpay = new window.Razorpay(options);
            razorpay.on('payment.failed', function (response) {
                setPaymentError(`Payment failed: ${response.error.description}`);
                setLoading(false);
            });
            razorpay.open();

        } catch (error) {
            setPaymentError('Failed to initiate payment: ' + error.message);
            setLoading(false);
        }
    };

    const handleCODOrder = async () => {
        try {
            setLoading(true);
            setPaymentError(null);

            const shippingAddress = `${address.full_name}, ${address.address_line1}${address.address_line2 ? ', ' + address.address_line2 : ''}, ${address.city}, ${address.state} ${address.postal_code}, ${address.country}. Phone: ${address.phone}`;

            // Add all extra charges
            const totalAmount = getFinalTotal();

            const orderData = {
                total_amount: totalAmount,
                shipping_address: shippingAddress,
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
            setPaymentError('Failed to place order: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    const handlePlaceOrder = async () => {
        if (paymentMethod === 'razorpay') {
            await handleRazorpayPayment();
        } else {
            await handleCODOrder();
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
                                            <p className="font-bold">₹{(item.price * item.quantity).toFixed(2)}</p>
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
                                                <p className="font-semibold text-sm">₹{(item.price * item.quantity).toFixed(2)}</p>
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
                                                <p className="font-semibold text-sm">₹{(item.price * item.quantity).toFixed(2)}</p>
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
                                    
                                    {paymentError && (
                                        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 flex items-start">
                                            <AlertCircle className="h-5 w-5 text-red-500 mr-3 flex-shrink-0 mt-0.5" />
                                            <p className="text-red-800 text-sm">{paymentError}</p>
                                        </div>
                                    )}

                                    {settingsLoading ? (
                                        <div className="flex items-center justify-center py-8">
                                            <Loader className="h-6 w-6 animate-spin text-gray-400" />
                                            <span className="ml-2 text-gray-500">Loading payment options...</span>
                                        </div>
                                    ) : (
                                        <div className="space-y-4">
                                            {/* Razorpay Option */}
                                            {paymentSettings?.payment_razorpay_enabled && (
                                                <div 
                                                    onClick={() => setPaymentMethod('razorpay')}
                                                    className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${
                                                        paymentMethod === 'razorpay' 
                                                            ? 'border-black bg-gray-50' 
                                                            : 'border-gray-200 hover:border-gray-400'
                                                    }`}
                                                >
                                                    <div className="flex items-center">
                                                        <input 
                                                            type="radio" 
                                                            checked={paymentMethod === 'razorpay'} 
                                                            onChange={() => setPaymentMethod('razorpay')}
                                                            className="mr-3" 
                                                        />
                                                        <div className="flex-1">
                                                            <div className="flex items-center justify-between">
                                                                <p className="font-semibold">Pay Online</p>
                                                                <div className="flex items-center space-x-2">
                                                                    <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">Recommended</span>
                                                                </div>
                                                            </div>
                                                            <p className="text-sm text-gray-600">UPI, Credit/Debit Card, Net Banking, Wallets</p>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}

                                            {/* COD Option */}
                                            {paymentSettings?.payment_cod_enabled && (
                                                <div 
                                                    onClick={() => setPaymentMethod('cod')}
                                                    className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${
                                                        paymentMethod === 'cod' 
                                                            ? 'border-black bg-gray-50' 
                                                            : 'border-gray-200 hover:border-gray-400'
                                                    }`}
                                                >
                                                    <div className="flex items-center">
                                                        <input 
                                                            type="radio" 
                                                            checked={paymentMethod === 'cod'} 
                                                            onChange={() => setPaymentMethod('cod')}
                                                            className="mr-3" 
                                                        />
                                                        <div className="flex-1">
                                                            <p className="font-semibold">Cash on Delivery</p>
                                                            <p className="text-sm text-gray-600">
                                                                Pay when you receive your order
                                                                {paymentSettings?.cod_extra_charge > 0 && (
                                                                    <span className="text-orange-600 ml-1">
                                                                        (+₹{paymentSettings.cod_extra_charge} extra)
                                                                    </span>
                                                                )}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}

                                            {/* No payment methods available */}
                                            {!paymentSettings?.payment_razorpay_enabled && !paymentSettings?.payment_cod_enabled && (
                                                <div className="text-center py-8 text-gray-500">
                                                    <AlertCircle className="h-12 w-12 mx-auto mb-3 text-gray-400" />
                                                    <p>No payment methods are currently available.</p>
                                                    <p className="text-sm">Please contact support.</p>
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    <button
                                        onClick={handlePlaceOrder}
                                        disabled={loading || settingsLoading || (!paymentSettings?.payment_razorpay_enabled && !paymentSettings?.payment_cod_enabled)}
                                        className="w-full mt-6 bg-black text-white py-3 rounded-lg hover:bg-gray-800 disabled:bg-gray-400 flex items-center justify-center"
                                    >
                                        {loading ? (
                                            <>
                                                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                </svg>
                                                Processing...
                                            </>
                                        ) : paymentMethod === 'razorpay' ? (
                                            `Pay ₹${getCartTotal().toFixed(2)}`
                                        ) : (
                                            `Place Order (COD) - ₹${getFinalTotal().toFixed(2)}`
                                        )}
                                    </button>

                                    {paymentMethod === 'razorpay' && (
                                        <p className="text-center text-xs text-gray-500 mt-4">
                                            Secured by Razorpay. Your payment information is encrypted.
                                        </p>
                                    )}
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
                                    <span>₹{getCartTotal().toFixed(2)}</span>
                                </div>
                                
                                {/* COD Extra Charge */}
                                {paymentMethod === 'cod' && paymentSettings?.cod_extra_charge_enabled && paymentSettings?.cod_extra_charge > 0 && (
                                    <div className="flex justify-between text-sm text-gray-600">
                                        <span>COD Charge</span>
                                        <span>₹{paymentSettings.cod_extra_charge.toFixed(2)}</span>
                                    </div>
                                )}
                                
                                {/* Custom Extra Charges */}
                                {paymentSettings?.extra_charges?.map((charge) => (
                                    <div key={charge.key} className="flex justify-between text-sm text-gray-600">
                                        <span>{charge.name}</span>
                                        <span>₹{charge.amount.toFixed(2)}</span>
                                    </div>
                                ))}
                                
                                <div className="border-t pt-3 flex justify-between font-bold text-lg">
                                    <span>Total</span>
                                    <span>₹{getFinalTotal().toFixed(2)}</span>
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
