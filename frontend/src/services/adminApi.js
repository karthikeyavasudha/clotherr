const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
const API_URL = `${API_BASE_URL}/api/v1/admin`;
const AUTH_URL = `${API_BASE_URL}/api/v1/auth`;

// Token refresh function for admin
const refreshAdminTokens = async () => {
    const refreshToken = localStorage.getItem('adminRefreshToken');
    if (!refreshToken) {
        throw new Error('No refresh token');
    }

    const response = await fetch(`${AUTH_URL}/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refresh_token: refreshToken })
    });

    if (!response.ok) {
        // Clear tokens on refresh failure
        localStorage.removeItem('adminToken');
        localStorage.removeItem('adminRefreshToken');
        localStorage.removeItem('adminUser');
        throw new Error('Token refresh failed');
    }

    const data = await response.json();
    localStorage.setItem('adminToken', data.access_token);
    localStorage.setItem('adminRefreshToken', data.refresh_token);
    return data.access_token;
};

// Authenticated fetch with automatic token refresh for admin
const authenticatedFetch = async (url, options = {}) => {
    let token = localStorage.getItem('adminToken');

    const makeRequest = async (authToken) => {
        const headers = {
            'Content-Type': 'application/json',
            ...options.headers,
            'Authorization': `Bearer ${authToken}`
        };
        return fetch(url, { ...options, headers });
    };

    let response = await makeRequest(token);

    // If 401, try to refresh token and retry once
    if (response.status === 401) {
        try {
            const newToken = await refreshAdminTokens();
            response = await makeRequest(newToken);
        } catch (error) {
            // Refresh failed, redirect to login
            window.location.href = '/admin/login';
            throw new Error('Session expired. Please login again.');
        }
    }

    return response;
};

// Auth
export const adminLogin = async (email, password) => {
    const response = await fetch(`${AUTH_URL}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to login');
    }

    const data = await response.json();

    // Store both access and refresh tokens
    if (data.access_token) {
        localStorage.setItem('adminToken', data.access_token);
        localStorage.setItem('adminRefreshToken', data.refresh_token);
    }

    return data;
};

// Dashboard Stats
export const fetchDashboardStats = async () => {
    const response = await authenticatedFetch(`${API_URL}/stats`);

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to fetch stats');
    }
    return response.json();
};

// Products
export const fetchAdminProducts = async (skip = 0, limit = 50, search = '', category = '') => {
    let url = `${API_URL}/products?skip=${skip}&limit=${limit}`;
    if (search) url += `&search=${encodeURIComponent(search)}`;
    if (category) url += `&category=${encodeURIComponent(category)}`;

    const response = await authenticatedFetch(url);

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to fetch products');
    }
    return response.json();
};

export const createProduct = async (productData) => {
    const response = await authenticatedFetch(`${API_URL}/products`, {
        method: 'POST',
        body: JSON.stringify(productData)
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to create product');
    }
    return response.json();
};

export const updateProduct = async (productId, productData) => {
    const response = await authenticatedFetch(`${API_URL}/products/${productId}`, {
        method: 'PUT',
        body: JSON.stringify(productData)
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to update product');
    }
    return response.json();
};

export const deleteProduct = async (productId) => {
    const response = await authenticatedFetch(`${API_URL}/products/${productId}`, {
        method: 'DELETE'
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to delete product');
    }
    return response.json();
};

export const fetchCategories = async () => {
    const response = await authenticatedFetch(`${API_URL}/categories`);

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to fetch categories');
    }
    return response.json();
};

// Orders
export const fetchAdminOrders = async (skip = 0, limit = 50, status = '') => {
    let url = `${API_URL}/orders?skip=${skip}&limit=${limit}`;
    if (status) url += `&status=${encodeURIComponent(status)}`;

    const response = await authenticatedFetch(url);

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to fetch orders');
    }
    return response.json();
};

export const fetchOrderDetails = async (orderId) => {
    const response = await authenticatedFetch(`${API_URL}/orders/${orderId}`);

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to fetch order');
    }
    return response.json();
};

export const updateOrderStatus = async (orderId, status) => {
    const response = await authenticatedFetch(`${API_URL}/orders/${orderId}/status`, {
        method: 'PUT',
        body: JSON.stringify({ status })
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to update order status');
    }
    return response.json();
};

// Users
export const fetchAdminUsers = async (skip = 0, limit = 50, search = '') => {
    let url = `${API_URL}/users?skip=${skip}&limit=${limit}`;
    if (search) url += `&search=${encodeURIComponent(search)}`;

    const response = await authenticatedFetch(url);

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to fetch users');
    }
    return response.json();
};

export const fetchUserDetails = async (userId) => {
    const response = await authenticatedFetch(`${API_URL}/users/${userId}`);

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to fetch user');
    }
    return response.json();
};
