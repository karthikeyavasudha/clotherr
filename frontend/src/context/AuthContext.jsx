import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { loginUser, signupUser } from '../services/api';

const API_URL = `${import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000'}/api/v1`;

const AuthContext = createContext();

export const useAuth = () => {
    return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(localStorage.getItem('access_token'));
    const [refreshToken, setRefreshToken] = useState(localStorage.getItem('refresh_token'));
    const [loading, setLoading] = useState(true);

    // Refresh the access token using the refresh token
    const refreshAccessToken = useCallback(async () => {
        const storedRefreshToken = localStorage.getItem('refresh_token');
        if (!storedRefreshToken) {
            return null;
        }

        try {
            const response = await fetch(`${API_URL}/auth/refresh`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ refresh_token: storedRefreshToken })
            });

            if (!response.ok) {
                throw new Error('Failed to refresh token');
            }

            const data = await response.json();

            // Store new tokens
            localStorage.setItem('access_token', data.access_token);
            localStorage.setItem('refresh_token', data.refresh_token);
            setToken(data.access_token);
            setRefreshToken(data.refresh_token);

            return data.access_token;
        } catch (error) {
            console.error('Token refresh failed:', error);
            // Clear auth state on refresh failure
            signOut();
            return null;
        }
    }, []);

    // Check token validity and refresh if needed
    useEffect(() => {
        const initAuth = async () => {
            const storedToken = localStorage.getItem('access_token');
            const storedRefreshToken = localStorage.getItem('refresh_token');
            const storedUser = localStorage.getItem('user_data');

            if (storedToken && storedUser) {
                setToken(storedToken);
                setRefreshToken(storedRefreshToken);
                setUser(JSON.parse(storedUser));
            }
            setLoading(false);
        };

        initAuth();
    }, []);

    // Set up automatic token refresh (every 25 minutes to refresh before 30 min expiry)
    useEffect(() => {
        if (!refreshToken) return;

        const refreshInterval = setInterval(() => {
            refreshAccessToken();
        }, 25 * 60 * 1000); // 25 minutes

        return () => clearInterval(refreshInterval);
    }, [refreshToken, refreshAccessToken]);

    const signUp = async (userData) => {
        try {
            const data = await signupUser(userData);

            // Store tokens and user data
            if (data.access_token) {
                localStorage.setItem('access_token', data.access_token);
                localStorage.setItem('refresh_token', data.refresh_token);
                localStorage.setItem('user_data', JSON.stringify(data.user));
                setToken(data.access_token);
                setRefreshToken(data.refresh_token);
                setUser(data.user);
            }

            return { data, error: null };
        } catch (error) {
            return { data: null, error };
        }
    };

    const signIn = async (email, password) => {
        try {
            const data = await loginUser(email, password);

            // Store tokens and user data
            if (data.access_token) {
                localStorage.setItem('access_token', data.access_token);
                localStorage.setItem('refresh_token', data.refresh_token);
                localStorage.setItem('user_data', JSON.stringify(data.user));
                setToken(data.access_token);
                setRefreshToken(data.refresh_token);
                setUser(data.user);
            }

            return { data, error: null };
        } catch (error) {
            return { data: null, error };
        }
    };

    const signOut = async () => {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('user_data');
        setToken(null);
        setRefreshToken(null);
        setUser(null);
    };

    const value = {
        user,
        token,
        refreshToken,
        setUser,
        signUp,
        signIn,
        signOut,
        refreshAccessToken,
    };

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
};
