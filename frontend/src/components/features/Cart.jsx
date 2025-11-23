import React from 'react';
import { X, Minus, Plus, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';

const Cart = () => {
    const { cartItems, isCartOpen, toggleCart, removeFromCart, updateQuantity, getCartTotal } = useCart();
    const { user, token } = useAuth();
    const navigate = useNavigate();

    const handleCheckout = () => {
        if (!user || !token) {
            toggleCart();
            navigate('/login');
            return;
        }

        toggleCart();
        navigate('/checkout');
    };

    if (!isCartOpen) return null;

    return (
        <div className="fixed inset-0 z-50 overflow-hidden">
            <div className="absolute inset-0 bg-black bg-opacity-50 transition-opacity" onClick={toggleCart}></div>

            <div className="absolute inset-y-0 right-0 max-w-full flex">
                <div className="w-screen max-w-md transform transition-transform ease-in-out duration-300 bg-white shadow-xl flex flex-col h-full">

                    {/* Header */}
                    <div className="flex items-center justify-between px-4 py-6 sm:px-6 border-b border-gray-200">
                        <h2 className="text-lg font-medium text-gray-900">Shopping Cart</h2>
                        <button type="button" className="text-gray-400 hover:text-gray-500" onClick={toggleCart}>
                            <X className="h-6 w-6" />
                        </button>
                    </div>

                    {/* Cart Items */}
                    <div className="flex-1 py-6 overflow-y-auto px-4 sm:px-6">
                        {cartItems.length === 0 ? (
                            <div className="text-center py-20 text-gray-500">
                                Your cart is empty.
                            </div>
                        ) : (
                            <ul className="divide-y divide-gray-200">
                                {cartItems.map((item) => (
                                    <li key={item.cartId} className="py-6 flex">
                                        <div className="flex-shrink-0 w-24 h-24 border border-gray-200 rounded-md overflow-hidden">
                                            <img
                                                src={item.image_url || 'https://via.placeholder.com/150'}
                                                alt={item.name}
                                                className="w-full h-full object-center object-cover"
                                            />
                                        </div>

                                        <div className="ml-4 flex-1 flex flex-col">
                                            <div>
                                                <div className="flex justify-between text-base font-medium text-gray-900">
                                                    <h3>{item.name}</h3>
                                                    <p className="ml-4">₹{(item.price * item.quantity).toFixed(2)}</p>
                                                </div>
                                                <p className="mt-1 text-sm text-gray-500">{item.category}</p>
                                                {item.size && (
                                                    <p className="mt-1 text-sm text-gray-500">Size: {item.size}</p>
                                                )}
                                            </div>
                                            <div className="flex-1 flex items-end justify-between text-sm">
                                                <div className="flex items-center border border-gray-300 rounded-md">
                                                    <button
                                                        className="p-1 hover:bg-gray-100"
                                                        onClick={() => updateQuantity(item.cartId, item.quantity - 1)}
                                                    >
                                                        <Minus className="h-4 w-4" />
                                                    </button>
                                                    <span className="px-2">{item.quantity}</span>
                                                    <button
                                                        className="p-1 hover:bg-gray-100"
                                                        onClick={() => updateQuantity(item.cartId, item.quantity + 1)}
                                                    >
                                                        <Plus className="h-4 w-4" />
                                                    </button>
                                                </div>

                                                <button
                                                    type="button"
                                                    className="font-medium text-red-600 hover:text-red-500 flex items-center"
                                                    onClick={() => removeFromCart(item.cartId)}
                                                >
                                                    <Trash2 className="h-4 w-4 mr-1" /> Remove
                                                </button>
                                            </div>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>

                    {/* Footer */}
                    <div className="border-t border-gray-200 px-4 py-6 sm:px-6">
                        <div className="flex justify-between text-base font-medium text-gray-900 mb-4">
                            <p>Subtotal</p>
                            <p>₹{getCartTotal().toFixed(2)}</p>
                        </div>
                        <p className="mt-0.5 text-sm text-gray-500 mb-6">Shipping and taxes calculated at checkout.</p>
                        <button
                            onClick={handleCheckout}
                            disabled={cartItems.length === 0}
                            className="w-full flex justify-center items-center px-6 py-3 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-black hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Checkout
                        </button>
                        <div className="mt-6 flex justify-center text-sm text-center text-gray-500">
                            <p>
                                or{' '}
                                <button
                                    type="button"
                                    className="text-black font-medium hover:text-gray-800"
                                    onClick={toggleCart}
                                >
                                    Continue Shopping<span aria-hidden="true"> &rarr;</span>
                                </button>
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Cart;
