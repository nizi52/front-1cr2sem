import axios from "axios";

const apiClient = axios.create({
    baseURL: 'http://localhost:3000/api',
    headers: {
        'Content-Type': 'application/json',
        'accept': 'application/json',
    }
});

// Interceptor запросов — подставляем accessToken
apiClient.interceptors.request.use(
    (config) => {
        const accessToken = localStorage.getItem('accessToken');
        if (accessToken) {
            config.headers.Authorization = `Bearer ${accessToken}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Interceptor ответов — обновляем токен при 401
apiClient.interceptors.response.use(
    (response) => response,
    async (error) => {
        const accessToken = localStorage.getItem('accessToken');
        const refreshToken = localStorage.getItem('refreshToken');
        const originalRequest = error.config;

        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;

            if (!accessToken || !refreshToken) {
                localStorage.removeItem('accessToken');
                localStorage.removeItem('refreshToken');
                localStorage.removeItem('user');
                window.location.href = '/';
                return Promise.reject(error);
            }

            try {
                const response = await api.refresh(refreshToken);
                const isRefreshExpired = response.data?.refresh_expired;

                if (isRefreshExpired) {
                    localStorage.removeItem('accessToken');
                    localStorage.removeItem('refreshToken');
                    localStorage.removeItem('user');
                    window.location.href = '/';
                    return Promise.reject(error);
                }

                const newAccessToken = response.data.accessToken;
                const newRefreshToken = response.data.refreshToken;

                localStorage.setItem('accessToken', newAccessToken);
                localStorage.setItem('refreshToken', newRefreshToken);

                originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
                return apiClient(originalRequest);
            } catch (refreshError) {
                localStorage.removeItem('accessToken');
                localStorage.removeItem('refreshToken');
                localStorage.removeItem('user');
                window.location.href = '/';
                return Promise.reject(refreshError);
            }
        }

        return Promise.reject(error);
    }
);

export const api = {
    // Auth
    register: (email, first_name, last_name, password, role) =>
        apiClient.post('/auth/register', { email, first_name, last_name, password, role }),

    login: (email, password) =>
        apiClient.post('/auth/login', { email, password }),

    refresh: (refreshToken) =>
        apiClient.post('/auth/refresh', { refreshToken }),

    me: () =>
        apiClient.get('/auth/me'),

    // Users (admin only)
    getUsers: () =>
        apiClient.get('/users'),

    getUserById: (id) =>
        apiClient.get(`/users/${id}`),

    updateUser: (id, data) =>
        apiClient.put(`/users/${id}`, data),

    blockUser: (id) =>
        apiClient.delete(`/users/${id}`),

    // Products
    createProduct: (product) =>
        apiClient.post('/products', product),

    getProducts: (category = null) => {
        const params = category ? { category } : {};
        return apiClient.get('/products', { params });
    },

    getProductById: (id) =>
        apiClient.get(`/products/${id}`),

    updateProduct: (id, product) =>
        apiClient.put(`/products/${id}`, product),

    deleteProduct: (id) =>
        apiClient.delete(`/products/${id}`),
};