const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
const API_URL = `${API_BASE_URL}/api/v1`;

// Token refresh function
const refreshTokens = async () => {
    const refreshToken = localStorage.getItem('refresh_token');
    if (!refreshToken) {
        throw new Error('No refresh token');
    }

    const response = await fetch(`${API_URL}/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refresh_token: refreshToken })
    });

    if (!response.ok) {
        // Clear tokens on refresh failure
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('user_data');
        throw new Error('Token refresh failed');
    }

    const data = await response.json();
    localStorage.setItem('access_token', data.access_token);
    localStorage.setItem('refresh_token', data.refresh_token);
    return data.access_token;
};

// Authenticated fetch with automatic token refresh
const authenticatedFetch = async (url, options = {}) => {
    let token = localStorage.getItem('access_token');

    const makeRequest = async (authToken) => {
        const headers = {
            ...options.headers,
            'Authorization': `Bearer ${authToken}`
        };
        return fetch(url, { ...options, headers });
    };

    let response = await makeRequest(token);

    // If 401, try to refresh token and retry once
    if (response.status === 401) {
        try {
            const newToken = await refreshTokens();
            response = await makeRequest(newToken);
        } catch (error) {
            // Refresh failed, token is invalid
            throw new Error('Session expired. Please login again.');
        }
    }

    return response;
};

export const fetchProducts = async (category = null) => {
    let url = `${API_URL}/products/`;
    if (category) {
        url += `?category=${encodeURIComponent(category)}`;
    }
    const response = await fetch(url);
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

export const updateUserProfile = async (userId, userData) => {
    const response = await authenticatedFetch(`${API_URL}/auth/update/${userId}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData)
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to update profile');
    }
    return response.json();
};

export const createOrder = async (orderData) => {
    const response = await authenticatedFetch(`${API_URL}/orders/`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(orderData)
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to create order');
    }
    return response.json();
};

export const fetchOrders = async () => {
    const response = await authenticatedFetch(`${API_URL}/orders/`);

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to fetch orders');
    }
    return response.json();
};
