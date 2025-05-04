import { useMutation, useQueryClient } from '@tanstack/react-query';
import instance from '@/api/axiosIntance';
import { useNavigate } from '@tanstack/react-router';
import { toast } from '@medusajs/ui';
import { useSocket } from '@/data/socket/useSocket';
import { useEffect } from 'react';

const useCheckoutMutation = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const socket = useSocket();

  const createOrder = useMutation({
    mutationFn: data => instance.post('/orders', data),

    onSuccess: async result => {
      const { data } = result;

      // Gửi sự kiện đến server
      socket.emit('admin-update-product', data);

      // Kiểm tra phản hồi nếu là URL
      if (typeof data === 'string' && data.includes('http')) {
        location.href = data;
      } else {
        const { orderId } = data;
        if (!orderId) {
          console.error('Order ID is missing in the response.');
          return;
        }
        await queryClient.invalidateQueries({ queryKey: ['cart'] });
        navigate({
          to: '/thanks',
          search: {
            status: '1',
            apptransid: `${orderId}-thanks`,
          },
        });
      }
    },

    onError: error => {
      toast.warning(`Thanh toán không thành công, số lượng còn lại ko đủ!`);
    },
  });

  useEffect(() => {
    // Lắng nghe phản hồi từ server
    const handleProductUpdated = updatedProduct => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
    };

    socket.on('product-updated', handleProductUpdated);

    // Hủy lắng nghe khi component bị unmount
    return () => {
      socket.off('product-updated', handleProductUpdated);
    };
  }, [socket, queryClient]);

  const updateOrderStatus = useMutation({
    mutationFn: async ({ orderId, status }) => {
      try {
        // Lấy thông tin đơn hàng từ API
        const orderResponse = await instance.get(`/orders/${orderId}`);

        // Lấy thông tin người dùng từ localStorage (giả sử thông tin người dùng được lưu trong localStorage dưới dạng JSON)
        const storedData = JSON.parse(localStorage.getItem('user') || '{}'); // Default là object rỗng nếu không có gì trong localStorage

        // Kiểm tra vai trò của người dùng
        if (storedData.role === 'admin' && status === 'delivered') {
          toast.warning(
            'Khách hàng chưa xác nhận đã nhận hàng. Admin không thể cập nhật trạng thái thành "delivered".'
          );
          return; // Dừng việc gửi yêu cầu cập nhật trạng thái nếu là admin và trạng thái là "delivered"
        }

        // Nếu không phải admin hoặc trạng thái không phải là "delivered", gửi yêu cầu cập nhật trạng thái
        const response = await instance.put(`/orders/${orderId}`, { status });
        return response;
      } catch (error) {
        console.error('Error updating order status:', error);

        // Nếu lỗi xảy ra trong quá trình gọi API, ném lại lỗi để `onError` có thể xử lý
        throw new Error(error.message || 'Unknown error');
      }
    },

    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['orders'] });
    },
  });

  return { createOrder, updateOrderStatus };
};

export default useCheckoutMutation;
