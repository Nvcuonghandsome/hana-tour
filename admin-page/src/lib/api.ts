import { Tour } from '@/types/tour';
import axios from 'axios';
import { TourFormData } from './schemas';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL;

export const fetchTours = async (token: string): Promise<Tour[]> => {
  const res = await axios.get(`${API_BASE}/tour/list`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data.data;
};

export const fetchTour = async (id: string, token: string) => {
  const res = await axios.get(`${API_BASE}/tour/detail/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
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
  token,
}: {
  id: string;
  data: TourFormData;
  token: string;
}) => {
  await axios.put(
    `${API_BASE}/tour/update`,
    { tourId: id, ...data },
    {
      headers: { Authorization: `Bearer ${token}` },
    },
  );
};

export const uploadTourImage = async ({
  id,
  file,
  token,
}: {
  id: string;
  file: File;
  token: string;
}) => {
  const formData = new FormData();
  formData.append('image', file);

  await axios.post(`${API_BASE}/tour/upload-image/${id}`, formData, {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'multipart/form-data',
    },
  });
};

export const logout = async (token: string) => {
  await axios.post(
    `${API_BASE}/auth/logout`,
    {},
    {
      headers: { Authorization: `Bearer ${token}` },
    },
  );
};
export const logoutById = async (userId: string) => {
  await axios.post(`${API_BASE}/auth/logout-by-id`, { userId });
};
