import { useQuery } from '@tanstack/react-query';
import instance from '@/api/axiosIntance';
import { QUERY_KEY } from '../stores/key';
import { useEffect, useState } from 'react';

export interface User {
  _id: string;
  username: string;
  email: string;
  avatar: string;
  role: string;
  status: 'ACTIVE' | 'BLOCKED';
}

// Hàm fetch users từ API
export const fetchUsers = async (page = 1, limit = 10) => {
  try {

    const res = await instance.get<{ users: User[]; pagination: any }>(
      `/users?page=${page}&limit=${limit}`
    );

    console.log('Response from server:', res.data);

    if (res.status !== 200) {
      console.error('Unexpected status code:', res.status, res.statusText);
      throw new Error(`Error while fetching users - status code: ${res.status}`);
    }

    return res.data;
  } catch (error: any) {
    if (error.response) {
      console.error('Response error:', error.response.data);
    } else {
      console.error('Request error:', error.message);
    }
    throw new Error('Error while fetching users');
  }
};


// Hook `useFetchUsers` sử dụng `useQuery` để gọi API
export const useFetchUsers = ({ page, limit }: { page: number; limit: number }) => {
  return useQuery({
    queryKey: [QUERY_KEY.FETCH_USERS, page, limit], // Gồm cả page & limit
    queryFn: () => fetchUsers(page, limit), // Truyền tham số vào hàm fetch
    keepPreviousData: true, // Giữ dữ liệu cũ khi chuyển trang
  });
};
;

// Hook để lấy tất cả users (không sử dụng `useQuery`)
export const useFetchAllUsers = () => {
  const [listUsers, setListUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAllUsers = async () => {
      try {
        const res = await instance.get<{ data: User[] }>('/users');
        setListUsers(res.data.data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchAllUsers();
  }, []);

  return { listUsers, loading, error };
};
