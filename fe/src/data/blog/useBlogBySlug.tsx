import instance from '@/api/axiosIntance';
import { useQuery } from '@tanstack/react-query';

export const fetchFindOneBlog = async (slug: string) => {
  try {
    const res = await instance.get<Blog>(`/detailblog/${slug}`);
    if (res.status !== 200) {
      throw new Error('Error while fetching detail product');
    }
    return res.data;
  } catch (error) {
    console.log('error:', error);
  }
};

export const useFetchDetailBlog = (slug: string) => {
  return useQuery({
    queryKey: ['blog', slug],
    queryFn: () => fetchFindOneBlog(slug),
    staleTime: 5 * 1000 * 60,
  });
};
