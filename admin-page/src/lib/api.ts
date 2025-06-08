import { Tour } from '@/types/tour';
import axios from 'axios';
import { TourFormData } from './schemas';
import { getSession, signOut } from 'next-auth/react';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL;

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL,
});

// Have issue focus on other tab and comeback to website -> error Session expired
api.interceptors.request.use(async (config) => {
  const session = await getSession();
  // console.log('getSession', session);
  if (!session || session.error === 'RefreshTokenError') {
    await logoutById(session?.user?.id || '');
    await signOut({ callbackUrl: '/login' });
    console.error('Session expired', session);
    return Promise.reject('Session expired');
  }

  config.headers.Authorization = `Bearer ${session.accessToken}`;
  return config;
});

export const fetchTours = async (): Promise<Tour[]> => {
  const res = await api.get(`${API_BASE}/tour/list`);
  return res.data.data;
};

export const fetchTour = async (id: string) => {
  const res = await api.get(`${API_BASE}/tour/detail/${id}`);
  return res.data.data;
};

export const createTour = async ({
  data,
  token,
}: {
  data: FormData;
  token: string;
}) => {
  await axios.post(`${API_BASE}/tour/create`, data, {
    headers: { Authorization: `Bearer ${token}` },
  });
};

export const updateTour = async ({
  id,
  data,
}: {
  id: string;
  data: TourFormData;
}) => {
  await api.put(`${API_BASE}/tour/update`, { tourId: id, ...data });
};

export const uploadTourImage = async ({
  id,
  file,
}: {
  id: string;
  file: File;
}) => {
  const formData = new FormData();
  formData.append('image', file);

  await api.post(`${API_BASE}/tour/upload-image/${id}`, formData);
};

export const logout = async () => {
  await api.post(`${API_BASE}/auth/logout`);
};
export const logoutById = async (userId: string) => {
  await axios.post(`${API_BASE}/auth/logout-by-id`, { userId });
};
