import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

export const fetchTransactions = async (params) => {
  try {
    const response = await api.get('/sales/transactions', { params });
    return response.data;
  } catch (error) {
    console.error('Error fetching transactions:', error);
    throw error;
  }
};

export const fetchFilterOptions = async () => {
  try {
    const response = await api.get('/sales/filter-options');
    return response.data.data;
  } catch (error) {
    console.error('Error fetching filter options:', error);
    throw error;
  }
};

export const fetchSuggestions = async (query) => {
  try {
    const response = await api.get('/sales/suggestions', { params: { query } });
    return response.data.data;
  } catch (error) {
    console.error('Error fetching suggestions:', error);
    return [];
  }
};

export default api;
