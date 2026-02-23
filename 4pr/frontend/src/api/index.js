import axios from "axios";

const apiCLient = axios.create({
    baseURL: 'http://localhost:3000/api',
    headers: {
        'Content-Type': 'application/json',
        'accept': 'application/json',
    }
});

export const api = {
    createProduct: async (product) => {
        const responce = await apiCLient.post('/products', product);
        return responce.data
    },
    getProducts: async (category = null) => {
        const params = category ? { category} : {};
        const responce = await apiCLient.get('/products', { params});
        return responce.data;
    },
    getProductById: async (id) => {
        const responce = await apiCLient.get(`/product/${id}`);
        return responce.data;
    },
    updateProduct: async (id, product) => {
        const responce = await apiCLient.patch(`/products/${id}`, product);
        return responce.data;
    },
    deleteProduct: async (id) => {
        const responce = await apiCLient.delete(`/product/${id}`);
        return responce.data
    }
};