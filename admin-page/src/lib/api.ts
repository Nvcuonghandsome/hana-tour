import { Tour } from '@/types/tour';
import axios from 'axios';
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
    // console.error('Session expired', session);
    return Promise.reject('Session expired');
  }

  config.headers.Authorization = `Bearer ${session.accessToken}`;
  return config;
});

export const fetchTours = async (search: string): Promise<Tour[]> => {
  const res = await api.get(
    `${API_BASE}/tour/list?search=${encodeURIComponent(search)}`,
  );
  return res.data.data;
};

export const fetchTour = async (id: string): Promise<Tour> => {
  const res = await api.get(`${API_BASE}/tour/detail/${id}`);
  return res.data.data;
};

export const createTour = async ({ data }: { data: FormData }) => {
  await api.post(`${API_BASE}/tour/create`, data);
};

export const updateTour = async ({ data }: { data: FormData }) => {
  await api.put(`${API_BASE}/tour/update`, data);
};

export const logout = async () => {
  await api.post(`${API_BASE}/auth/logout`);
};
export const logoutById = async (userId: string) => {
  await axios.post(`${API_BASE}/auth/logout-by-id`, { userId });
};
