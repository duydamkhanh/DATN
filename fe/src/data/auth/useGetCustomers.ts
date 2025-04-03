import instance from '@/api/axiosIntance';
import { useQuery } from '@tanstack/react-query';

export const fetchCustomers = async ({
  page = 1,
  limit = 10,
}: {
  page?: number;
  limit?: number;
}) => {
  try {
    console.log('Fetching customers with params:', { page, limit });
    const res = await instance.get('/customer-user', {
      params: { page, limit },
    });

    console.log('Response from server:', res);

    if (res.status !== 200 && res.status !== 201) {
      console.error('Unexpected status code:', res.status, res.statusText);
      throw new Error(
        `Error while fetching customers - status code: ${res.status}`
      );
    }
    return res.data; // Trả về dữ liệu từ API (bao gồm customers, pagination, message)
  } catch (error: any) {
    if (error.response) {
      console.error('Response error:', error.response.data);
    } else {
      console.error('Request error:', error.message);
    }
    throw new Error('Error while fetching customers');
  }
};

// Hook sử dụng TanStack Query để fetch customers
export const useGetCustomers = ({
  page = 1,
  limit = 10,
}: {
  page?: number;
  limit?: number;
}) => {
  return useQuery({
    queryKey: ['customers', page, limit], // Query key để cache dữ liệu, thay đổi khi page hoặc limit thay đổi
    queryFn: () => fetchCustomers({ page, limit }), // Hàm gọi API
    enabled: true, // Luôn bật query (có thể điều chỉnh nếu cần)
  });
};
