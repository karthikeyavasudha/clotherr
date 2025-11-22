import React, { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext();

export const useCart = () => {
    return useContext(CartContext);
};

export const CartProvider = ({ children }) => {
    const [cartItems, setCartItems] = useState(() => {
        const savedCart = localStorage.getItem('cart');
        return savedCart ? JSON.parse(savedCart) : [];
    });

    const [isCartOpen, setIsCartOpen] = useState(false);

    useEffect(() => {
        localStorage.setItem('cart', JSON.stringify(cartItems));
    }, [cartItems]);

    const addToCart = (product) => {
        setCartItems((prevItems) => {
            const cartId = `${product.id}-${product.size || 'default'}`;
            const existingItem = prevItems.find((item) => item.cartId === cartId);

            if (existingItem) {
                return prevItems.map((item) =>
                    item.cartId === cartId
                        ? { ...item, quantity: item.quantity + (product.quantity || 1) }
                        : item
                );
            }

            return [...prevItems, {
                ...product,
                cartId,
                quantity: product.quantity || 1
            }];
        });
        setIsCartOpen(true);
    };

    const removeFromCart = (cartId) => {
        setCartItems((prevItems) => prevItems.filter((item) => item.cartId !== cartId));
    };

    const updateQuantity = (cartId, quantity) => {
        if (quantity < 1) {
            removeFromCart(cartId);
            return;
        }
        setCartItems((prevItems) =>
            prevItems.map((item) =>
                item.cartId === cartId ? { ...item, quantity } : item
            )
        );
    };

    const clearCart = () => {
        setCartItems([]);
    };

    const getCartTotal = () => {
        return cartItems.reduce((total, item) => total + item.price * item.quantity, 0);
    };

    const getCartCount = () => {
        return cartItems.reduce((count, item) => count + item.quantity, 0);
    };

    const toggleCart = () => {
        setIsCartOpen(!isCartOpen);
    };

    return (
        <CartContext.Provider
            value={{
                cartItems,
                addToCart,
                removeFromCart,
                updateQuantity,
                clearCart,
                getCartTotal,
                getCartCount,
                isCartOpen,
                setIsCartOpen,
                toggleCart,
            }}
        >
            {children}
        </CartContext.Provider>
    );
};
