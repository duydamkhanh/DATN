import instance from '@/api/axiosIntance';
import { useQuery } from '@tanstack/react-query';

const fetchComments = async (productIds: string[]) => {
  if (!Array.isArray(productIds) || productIds.length === 0) return [];

  const idsString = productIds.join(',');
  const response = await instance.get(
    `/comments/products?productIds=${idsString}`
  );
  return response.data;
};

const useProductComments = (productIds: string[]) => {
  return useQuery({
    queryKey: ['comments', productIds],
    queryFn: () => fetchComments(productIds),
    enabled: productIds.length > 0,
  });
};

export default useProductComments;
