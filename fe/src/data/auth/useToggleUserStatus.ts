import { useCallback } from 'react';
import instance from '@/api/axiosIntance';
import { useFetchUsers } from '@/data/auth/useUserList';

export const useToggleUserStatus = () => {
  const { refetch } = useFetchUsers({ page: 0, limit: 5 }); // Đảm bảo cập nhật danh sách người dùng sau khi thay đổi trạng thái

  const toggleUserStatus = useCallback(async (userId: string, currentStatus: string) => {
    const newStatus = currentStatus === 'ACTIVE' ? 'BLOCKED' : 'ACTIVE';

    try {
      const response = await instance.patch(`/users/${userId}/status`, {
        status: newStatus,
      });
      console.log('Phản hồi API:', response.data);
      refetch();
    } catch (error) {
      console.error('Lỗi API:', error.response?.data || error.message);
    }
  }, [refetch]);

  return { toggleUserStatus };
};