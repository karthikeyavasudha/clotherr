const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
const API_URL = `${API_BASE_URL}/api/v1`;

export const fetchProducts = async () => {
    const response = await fetch(`${API_URL}/products/`);
    if (!response.ok) {
        throw new Error('Failed to fetch products');
    }
    return response.json();
};

export const fetchProductById = async (id) => {
    const response = await fetch(`${API_URL}/products/${id}`);
    if (!response.ok) {
        throw new Error('Failed to fetch product');
    }
    return response.json();
};

export const loginUser = async (email, password) => {
    const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password })
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to login');
    }
    return response.json();
};

export const signupUser = async (userData) => {
    const response = await fetch(`${API_URL}/auth/signup`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            email: userData.email,
            password: userData.password,
            full_name: userData.full_name,
            phone: userData.phone,
            address_line1: userData.address_line1,
            address_line2: userData.address_line2 || '',
            city: userData.city,
            state: userData.state,
            postal_code: userData.postal_code,
            country: userData.country
        })
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to signup');
    }
    return response.json();
};

export const updateUserProfile = async (userId, userData, token) => {
    const response = await fetch(`${API_URL}/auth/update/${userId}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(userData)
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to update profile');
    }
    return response.json();
};

export const createOrder = async (orderData, token) => {
    const response = await fetch(`${API_URL}/orders/`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(orderData)
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to create order');
    }
    return response.json();
};

export const fetchOrders = async (token) => {
    const response = await fetch(`${API_URL}/orders/`, {
        headers: {
            'Authorization': `Bearer ${token}`
        }
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to fetch orders');
    }
    return response.json();
};

// Razorpay Payment APIs
export const createRazorpayOrder = async (orderData, token) => {
    const response = await fetch(`${API_URL}/payments/create-order`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(orderData)
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to create payment order');
    }
    return response.json();
};

export const verifyRazorpayPayment = async (paymentData, token) => {
    const response = await fetch(`${API_URL}/payments/verify`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(paymentData)
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Payment verification failed');
    }
    return response.json();
};

// Payment Settings (public)
export const fetchPaymentSettings = async () => {
    const response = await fetch(`${API_URL}/payments/settings`);
    
    if (!response.ok) {
        // Return defaults if API fails
        return {
            payment_cod_enabled: true,
            payment_razorpay_enabled: true,
            min_order_amount: 0,
            cod_extra_charge: 0
        };
    }
    return response.json();
};

export const validateDiscountCode = async (code, orderAmount, userId = null) => {
    const response = await fetch(`${API_URL}/discounts/validate`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ code, order_amount: orderAmount, user_id: userId })
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Invalid discount code');
    }
    return response.json();
};

export const useDiscountCode = async (code, token, userId = null) => {
    const response = await fetch(`${API_URL}/discounts/use/${code}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ user_id: userId })
    });
    return response.json();
};

export const fetchAvailableDiscounts = async () => {
    const response = await fetch(`${API_URL}/discounts/available`);
    if (!response.ok) {
        return [];
    }
    return response.json();
};
