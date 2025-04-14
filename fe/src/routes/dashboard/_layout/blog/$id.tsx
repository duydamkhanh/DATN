import NewHeader from '@/components/layoutAdmin/header/new-header';
import { useFetchByIdBlog } from '@/data/blog/useBlogBySlug';
import useBlogMutation from '@/data/blog/useBlogMutation';
import {
  createFileRoute,
  useParams,
  useNavigate,
} from '@tanstack/react-router';
import { useForm, Controller } from 'react-hook-form';
import { useEffect, useRef, useState } from 'react';
import { Button, Input, Textarea, Toast } from '@medusajs/ui';
import { ArrowDownTray, XMark } from '@medusajs/icons';
import TextareaDescription from '@/components/textarea';
import axios from 'axios';

export const Route = createFileRoute('/dashboard/_layout/blog/$id')({
  component: EditBlog,
});

interface BlogForm {
  title: string;
  author: string;
  tags: string;
  thumbnail: string;
  gallery: string;
  description: string;
  content: string;
}

function EditBlog() {
  const { id } = useParams({
    from: '/dashboard/_layout/blog/$id',
  });
  const navigate = useNavigate();
  const { data: blogList } = useFetchByIdBlog(id);
  const { updatePost } = useBlogMutation();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    control,
    setValue,
    formState: { errors },
    reset,
  } = useForm<BlogForm>({
    defaultValues: {
      title: '',
      author: '',
      tags: '',
      thumbnail: '',
      gallery: '',
      description: '',
      content: '',
    },
  });

  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imageUrl, setImageUrl] = useState<string>('');
  const [selectedGallery, setSelectedGallery] = useState<
    Array<File | { name: string; url: string }>
  >([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);

  // Populate form with existing blog data
  useEffect(() => {
    if (blogList?.data) {
      console.log('Initial blog data:', blogList.data);
      reset({
        title: blogList.data.title || '',
        author: blogList.data.author || '',
        tags: blogList.data.tags?.join(',') || '',
        thumbnail: blogList.data.thumbnail || '',
        gallery: blogList.data.gallery?.join(',') || '',
        description: blogList.data.description || '',
        content: blogList.data.content || '',
      });
      if (blogList.data.thumbnail) {
        setImageUrl(blogList.data.thumbnail);
      }
      if (blogList.data.gallery) {
        setSelectedGallery(
          blogList.data.gallery.map((url: string) => ({
            name: url.split('/').pop() || url,
            url,
          }))
        );
      }
    }
  }, [blogList, reset]);

  const handleThumbnailClick = () => {
    fileInputRef.current?.click();
  };

  const handleGalleryClick = () => {
    galleryInputRef.current?.click();
  };

  const handleThumbnailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (
      file &&
      file.size <= 500000 &&
      ['image/jpeg', 'image/png'].includes(file.type)
    ) {
      setSelectedImage(file);
      setImageUrl(URL.createObjectURL(file)); // Temporary preview
      setValue('thumbnail', file.name);
    } else {
      setValue('thumbnail', '');
      setErrorMessage(
        'Ảnh thumbnail phải dưới 500KB và định dạng .jpg hoặc .png'
      );
    }
  };

  const handleGalleryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (
      files.length <= 10 &&
      files.every(
        file =>
          file.size <= 500000 && ['image/jpeg', 'image/png'].includes(file.type)
      )
    ) {
      setSelectedGallery(prev => [
        ...prev.filter(item => !(item instanceof File)),
        ...files,
      ]);
      setValue(
        'gallery',
        [...selectedGallery.filter(item => !(item instanceof File)), ...files]
          .map(f => f.name)
          .join(',')
      );
    } else {
      setValue('gallery', '');
      setErrorMessage(
        'Ảnh gallery phải dưới 500KB, định dạng .jpg hoặc .png, và tối đa 10 ảnh'
      );
    }
  };

  const handleEditorChange = (content: string) => {
    setValue('content', content, { shouldValidate: true });
  };

  const uploadThumbnail = async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append('blog', file); // Adjust field name to match backend
    try {
      const response = await axios.post(
        'http://localhost:8080/api/upload-thumbnail-blog',
        formData,
        {
          headers: { 'Content-Type': 'multipart/form-data' },
        }
      );
      console.log('Thumbnail upload response:', response.data);
      return response.data.url; // Adjust based on actual response
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || 'Lỗi khi tải lên thumbnail'
      );
    }
  };

  const uploadGallery = async (files: File[]): Promise<string[]> => {
    const formData = new FormData();
    files.forEach(file => formData.append('photos', file)); // Adjust field name to match backend
    try {
      const response = await axios.post(
        'http://localhost:8080/api/upload-gallery-blog',
        formData,
        {
          headers: { 'Content-Type': 'multipart/form-data' },
        }
      );
      console.log('Gallery upload response:', response.data);
      return response.data.urls; // Adjust based on actual response
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || 'Lỗi khi tải lên gallery'
      );
    }
  };

  const onSubmit = async (data: BlogForm) => {
    try {
      setErrorMessage(null);

      // Validate required fields
      if (!data.title || !data.author || !data.content) {
        setErrorMessage('Tiêu đề, tác giả và nội dung là bắt buộc');
        return;
      }

      // Initialize with current state
      let thumbnailUrl = imageUrl;
      let galleryUrls = selectedGallery
        .filter(item => !(item instanceof File))
        .map(item => (item as { url: string }).url);

      // Handle thumbnail upload
      if (selectedImage) {
        thumbnailUrl = await uploadThumbnail(selectedImage);
        console.log('New thumbnail URL:', thumbnailUrl);
        setImageUrl(thumbnailUrl);
        setSelectedImage(null);
        setValue('thumbnail', thumbnailUrl); // Update form state
      }

      // Handle gallery upload
      const newGalleryFiles = selectedGallery.filter(
        item => item instanceof File
      ) as File[];
      if (newGalleryFiles.length > 0) {
        const uploadedUrls = await uploadGallery(newGalleryFiles);
        console.log('New gallery URLs:', uploadedUrls);
        galleryUrls = [
          ...galleryUrls, // Keep existing URLs if desired
          ...uploadedUrls,
        ];
        setSelectedGallery([
          ...selectedGallery.filter(item => !(item instanceof File)),
          ...uploadedUrls.map(url => ({
            name: url.split('/').pop() || url,
            url,
          })),
        ]);
        setValue('gallery', galleryUrls.join(',')); // Update form state
      }

      // Prepare payload
      const payload = {
        title: data.title,
        author: data.author,
        tags: data.tags
          ? data.tags
              .split(',')
              .map(tag => tag.trim())
              .filter(tag => tag)
          : [],
        description: data.description,
        content: data.content,
        thumbnail: thumbnailUrl || '', // Ensure no null/undefined
        gallery: galleryUrls.length > 0 ? galleryUrls : [],
      };

      console.log('Final payload sent to updatePost:', payload);
      const response = await updatePost.mutateAsync({ id, data: payload });
      console.log('Update response:', response);

      navigate({ to: '/dashboard/blog' });
    } catch (error: any) {
      console.error('Error updating post:', error);
      setErrorMessage(
        error.message || 'Đã có lỗi xảy ra khi cập nhật bài viết'
      );
    }
  };

  return (
    <div className="h-screen overflow-y-auto">
      <div className="fixed left-0 right-0 top-16 z-10 md:relative md:left-auto md:right-auto md:top-0">
        <NewHeader
          breadcrumbs={[
            { title: 'Danh sách bài viết', href: '/dashboard/blog' },
            { title: 'Chỉnh sửa bài viết' },
          ]}
        />
      </div>
      <form onSubmit={handleSubmit(onSubmit)} className="m-8">
        {errorMessage && (
          <Toast variant="error" className="mb-4">
            {errorMessage}
          </Toast>
        )}
        <div className="my-3 flex justify-between">
          <div className="w-[330px]">
            <Input
              placeholder="Search"
              id="search-input"
              size="small"
              type="search"
            />
          </div>
          <div className="flex gap-2">
            <Button
              variant="secondary"
              type="button"
              onClick={() => navigate({ to: '/dashboard/blog' })}
            >
              Hủy
            </Button>
            <Button variant="primary" type="submit">
              Cập nhật bài viết
            </Button>
          </div>
        </div>

        <div className="rounded-lg border bg-ui-bg-base p-7">
          <h1 className="text-2xl font-medium text-ui-fg-base">
            Thông tin bài viết
          </h1>
          <p className="mb-4 text-sm font-normal text-ui-fg-subtle">
            Chỉnh sửa chi tiết bài viết như tiêu đề, nội dung...
          </p>

          <div className="space-y-4">
            <div className="flex space-x-4">
              <div className="flex-1 space-y-3">
                <label className="text-sm font-medium text-ui-fg-base">
                  <span className="text-ui-tag-red-text">*</span> Tiêu đề
                </label>
                <Input
                  placeholder="Tiêu đề"
                  size="base"
                  {...register('title', { required: 'Tiêu đề bắt buộc' })}
                />
                {errors.title && (
                  <span className="text-xs text-red-500">
                    {errors.title.message}
                  </span>
                )}
              </div>
            </div>
            <div className="flex space-x-4">
              <div className="flex-1 space-y-3">
                <label className="text-sm font-medium text-ui-fg-base">
                  <span className="text-ui-tag-red-text">*</span> Tác giả
                </label>
                <Input
                  placeholder="Tác giả"
                  size="base"
                  {...register('author', { required: 'Tác giả bắt buộc' })}
                />
                {errors.author && (
                  <span className="text-xs text-red-500">
                    {errors.author.message}
                  </span>
                )}
              </div>
            </div>
            <div className="flex space-x-4">
              <div className="flex-1 space-y-3">
                <label className="text-sm font-medium text-ui-fg-base">
                  Thẻ
                </label>
                <Input
                  placeholder="Thẻ (cách nhau bởi dấu phẩy)"
                  size="base"
                  {...register('tags')}
                />
                {errors.tags && (
                  <span className="text-xs text-red-500">
                    {errors.tags.message}
                  </span>
                )}
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-ui-fg-base">
                Ảnh Thumbnail
              </label>
              <p className="mb-2 text-xs text-ui-fg-muted">
                Kích thước tệp tối đa là 500KB. Hỗ trợ các định dạng .jpg và
                .png.
              </p>
              <button
                type="button"
                className="flex w-full cursor-pointer flex-col items-center gap-2 rounded-lg border border-dashed border-ui-border-strong p-8"
                onClick={handleThumbnailClick}
              >
                <div className="mb-2 flex items-center">
                  <ArrowDownTray className="mr-1 h-5 w-5" />
                  <p className="text-xs font-medium text-ui-fg-base">
                    Tải lên file
                  </p>
                </div>
                <p className="mb-2 text-center text-xs text-ui-fg-muted">
                  Kéo và thả file vào đây hoặc bấm vào để tải lên
                </p>
              </button>
              <input
                type="file"
                id="thumbnail"
                ref={fileInputRef}
                accept=".jpg, .png"
                onChange={handleThumbnailChange}
                className="hidden cursor-pointer"
              />
              {errors.thumbnail && (
                <span className="text-xs text-red-500">
                  {errors.thumbnail.message}
                </span>
              )}
              <div className="mt-5">
                {selectedImage && (
                  <div className="mb-3 flex items-center justify-between gap-3 rounded-lg border bg-ui-bg-subtle-hover px-2 py-3">
                    <div>
                      <p className="text-sm font-normal text-ui-fg-base">
                        {selectedImage.name}
                      </p>
                      <p className="text-xs font-normal text-ui-fg-subtle">
                        {(selectedImage.size / 1024).toFixed(2)} KB
                      </p>
                    </div>
                    <XMark
                      className="cursor-pointer"
                      onClick={() => {
                        setSelectedImage(null);
                        setImageUrl(blogList?.data.thumbnail || '');
                        setValue('thumbnail', blogList?.data.thumbnail || '');
                      }}
                    />
                  </div>
                )}
                {imageUrl && !selectedImage && (
                  <div className="mt-4">
                    <img
                      src={imageUrl}
                      alt="Thumbnail Preview"
                      className="h-16 w-16 object-cover"
                    />
                  </div>
                )}
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-ui-fg-base">
                Gallery (Tối đa 10 ảnh)
              </label>
              <p className="mb-2 text-xs text-ui-fg-muted">
                Kích thước tệp tối đa là 500KB. Hỗ trợ các định dạng .jpg và
                .png.
              </p>
              <button
                type="button"
                className="flex w-full cursor-pointer flex-col items-center gap-2 rounded-lg border border-dashed border-ui-border-strong p-8"
                onClick={handleGalleryClick}
              >
                <div className="mb-2 flex items-center">
                  <ArrowDownTray className="mr-1 h-5 w-5" />
                  <p className="text-xs font-medium text-ui-fg-base">
                    Tải lên files
                  </p>
                </div>
                <p className="mb-2 text-center text-xs text-ui-fg-muted">
                  Kéo và thả files vào đây hoặc bấm vào để tải lên (tối đa 10
                  ảnh)
                </p>
              </button>
              <input
                type="file"
                id="gallery"
                ref={galleryInputRef}
                accept=".jpg, .png"
                multiple
                onChange={handleGalleryChange}
                className="hidden cursor-pointer"
              />
              {errors.gallery && (
                <span className="text-xs text-red-500">
                  {errors.gallery.message}
                </span>
              )}
              <div className="mt-5">
                {selectedGallery.length > 0 && (
                  <div className="space-y-2">
                    {selectedGallery.map((file, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between gap-3 rounded-lg border bg-ui-bg-subtle-hover px-2 py-3"
                      >
                        <div className="flex items-center gap-2">
                          <img
                            src={
                              'url' in file
                                ? file.url
                                : URL.createObjectURL(file)
                            }
                            alt={file.name}
                            className="h-16 w-16 object-cover"
                          />
                          <div>
                            <p className="text-sm font-normal text-ui-fg-base">
                              {file.name}
                            </p>
                            <p className="text-xs font-normal text-ui-fg-subtle">
                              {'size' in file
                                ? (file.size / 1024).toFixed(2)
                                : 'Existing'}{' '}
                              KB
                            </p>
                          </div>
                        </div>
                        <XMark
                          className="cursor-pointer"
                          onClick={() => {
                            const newGallery = selectedGallery.filter(
                              (_, i) => i !== index
                            );
                            setSelectedGallery(newGallery);
                            setValue(
                              'gallery',
                              newGallery
                                .map(f => ('url' in f ? f.url : f.name))
                                .join(',')
                            );
                          }}
                        />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="flex flex-col">
              <label className="text-sm font-medium text-ui-fg-base">
                <span className="text-ui-tag-red-text">*</span> Mô tả
              </label>
              <div className="mt-2">
                <Textarea
                  placeholder="Type here"
                  {...register('description', { required: 'Mô tả bắt buộc' })}
                />
                {errors.description && (
                  <span className="text-xs text-red-500">
                    {errors.description.message}
                  </span>
                )}
              </div>
            </div>
            <div className="flex flex-col">
              <label className="text-sm font-medium text-ui-fg-base">
                <span className="text-ui-tag-red-text">*</span> Nội dung
              </label>
              <div className="mt-2 flex flex-1 flex-col">
                <Controller
                  name="content"
                  control={control}
                  rules={{ required: 'Nội dung bắt buộc' }}
                  render={({ field: { onChange, value } }) => (
                    <TextareaDescription
                      apiKey="vx5npguuuktlxhbv9tv6vvgjk1x5astnj8kznhujei9w6ech"
                      value={value}
                      onChange={(content: string) => {
                        onChange(content);
                        handleEditorChange(content);
                      }}
                    />
                  )}
                />
                {errors.content && (
                  <span className="mt-2 text-xs text-red-500">
                    {errors.content.message}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}

export default EditBlog;
