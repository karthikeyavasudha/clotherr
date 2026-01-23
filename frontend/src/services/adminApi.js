const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
const API_URL = `${API_BASE_URL}/api/v1/admin`;

const getAuthHeaders = () => {
    const token = localStorage.getItem('adminToken');
    return {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
    };
};

// Auth
export const adminLogin = async (email, password) => {
    const response = await fetch(`${API_BASE_URL}/api/v1/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to login');
    }
    
    const data = await response.json();
    
    // Check if user is admin (we'll verify this on the backend)
    return data;
};

// Dashboard Stats
export const fetchDashboardStats = async () => {
    const response = await fetch(`${API_URL}/stats`, {
        headers: getAuthHeaders()
    });

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

    const response = await fetch(url, { headers: getAuthHeaders() });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to fetch products');
    }
    return response.json();
};

export const createProduct = async (productData) => {
    const response = await fetch(`${API_URL}/products`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(productData)
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to create product');
    }
    return response.json();
};

export const updateProduct = async (productId, productData) => {
    const response = await fetch(`${API_URL}/products/${productId}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(productData)
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to update product');
    }
    return response.json();
};

export const deleteProduct = async (productId) => {
    const response = await fetch(`${API_URL}/products/${productId}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to delete product');
    }
    return response.json();
};

export const fetchCategories = async () => {
    const response = await fetch(`${API_URL}/categories`, {
        headers: getAuthHeaders()
    });

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

    const response = await fetch(url, { headers: getAuthHeaders() });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to fetch orders');
    }
    return response.json();
};

export const fetchOrderDetails = async (orderId) => {
    const response = await fetch(`${API_URL}/orders/${orderId}`, {
        headers: getAuthHeaders()
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to fetch order');
    }
    return response.json();
};

export const updateOrderStatus = async (orderId, status) => {
    const response = await fetch(`${API_URL}/orders/${orderId}/status`, {
        method: 'PUT',
        headers: getAuthHeaders(),
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

    const response = await fetch(url, { headers: getAuthHeaders() });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to fetch users');
    }
    return response.json();
};

export const fetchUserDetails = async (userId) => {
    const response = await fetch(`${API_URL}/users/${userId}`, {
        headers: getAuthHeaders()
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to fetch user');
    }
    return response.json();
};
