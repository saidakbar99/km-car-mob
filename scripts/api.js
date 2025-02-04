import axiosInstance from './axios'

export const login = (data) => axiosInstance.post(`/auth/login`, data)
export const fetchCars = () => axiosInstance.get(`/cars`);
export const fetchHistory = (startDate, endDate) =>
  axiosInstance.get(`/car-in-out/${startDate}/${endDate}`);
export const createEntry = (data) =>
  axiosInstance.post(`/car-in-out`, data);
export const updateEntry = (id, data) =>
  axiosInstance.put(`/car-in-out/${id}`, data);
export const removeEntry = (id) =>
  axiosInstance.delete(`/car-in-out/${id}`);