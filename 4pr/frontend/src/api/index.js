import axios from "axios";

const apiClient = axios.create({
    baseURL: 'http://localhost:3000/api',
    headers: {
        'Content-Type': 'application/json',
        'accept': 'application/json',
    }
});

// Interceptor запросов — подставляем accessToken в каждый запрос
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

            // Если нет токенов — выходим
            if (!accessToken || !refreshToken) {
                localStorage.removeItem('accessToken');
                localStorage.removeItem('refreshToken');
                localStorage.removeItem('user');
                window.location.href = '/login';
                return Promise.reject(error);
            }

            try {
                const response = await api.refresh(refreshToken);
                const isRefreshExpired = response.data?.refresh_expired;

                if (isRefreshExpired) {
                    localStorage.removeItem('accessToken');
                    localStorage.removeItem('refreshToken');
                    localStorage.removeItem('user');
                    window.location.href = '/login';
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
                window.location.href = '/login';
                return Promise.reject(refreshError);
            }
        }

        return Promise.reject(error);
    }
);

export const api = {
    // Auth
    register: async (email, first_name, last_name, password) => {
        return apiClient.post('/auth/register', { email, first_name, last_name, password });
    },
    login: async (email, password) => {
        return apiClient.post('/auth/login', { email, password });
    },
    refresh: async (refreshToken) => {
        return apiClient.post('/auth/refresh', { refreshToken });
    },
    me: async () => {
        return apiClient.get('/auth/me');
    },

    // Products
    createProduct: async (product) => {
        const response = await apiClient.post('/products', product);
        return response.data;
    },
    getProducts: async (category = null) => {
        const params = category ? { category } : {};
        const response = await apiClient.get('/products', { params });
        return response.data;
    },
    getProductById: async (id) => {
        const response = await apiClient.get(`/products/${id}`);
        return response.data;
    },
    updateProduct: async (id, product) => {
        const response = await apiClient.put(`/products/${id}`, product);
        return response.data;
    },
    deleteProduct: async (id) => {
        const response = await apiClient.delete(`/products/${id}`);
        return response.data;
    }
};