import instance from '@/api/axiosIntance';
import { useQuery } from '@tanstack/react-query';

interface OrderDetail {
  id: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

const useOrderDetail = (orderId: string) => {
  return useQuery<OrderDetail, Error>({
    queryKey: ['orderDetail', orderId],
    queryFn: async () => {
      try {
        const response = await instance.get<OrderDetail>(
          `/orders/${orderId}/admin`
        );
        return response.data;
      } catch (error: any) {
        throw new Error(error.message || 'Có lỗi xảy ra khi tải đơn hàng.');
      }
    },
  });
};

export default useOrderDetail;
