// data/cart/useUploadAvatar.ts
import instance from '@/api/axiosIntance';
import { useMutation } from '@tanstack/react-query';

const uploadAvatar = async (formData: FormData): Promise<string> => {
  const response = await instance.post('/upload-avatar', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  console.log('Phản hồi từ /upload-avatar:', response.data);
  return response.data; // Backend trả về string, ví dụ: "https://res.cloudinary.com/..."
};

export const useUploadAvatar = () => {
  return useMutation({
    mutationFn: uploadAvatar,
  });
};
