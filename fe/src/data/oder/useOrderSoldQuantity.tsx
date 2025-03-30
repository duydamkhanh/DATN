import instance from '@/api/axiosIntance';
import { useQuery } from '@tanstack/react-query';

const fetchSoldQuantity = async (productId: string) => {
  try {
    const res = await instance.get(`/order/sold/${productId}`);
    if (res.status !== 200) {
      throw new Error('Error while fetching order');
    }
    return res.data;
  } catch (error) {
    console.log('error', error);
  }
};

const useSoldQuantity = (productId: string) => {
  return useQuery({
    queryKey: ['soldQuantity', productId],
    queryFn: () => fetchSoldQuantity(productId),
    enabled: !!productId,
  });
};

export default useSoldQuantity;
