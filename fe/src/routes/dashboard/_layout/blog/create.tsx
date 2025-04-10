import NewHeader from '@/components/layoutAdmin/header/new-header';
import TextareaDescription from '@/components/textarea';
import useBlogMutation from '@/data/blog/useBlogMutation';
import { ArrowDownTray, XMark } from '@medusajs/icons';
import { Button, Input, Textarea, toast } from '@medusajs/ui';
import { createFileRoute, useNavigate } from '@tanstack/react-router';
import axios from 'axios';
import { useRef, useState } from 'react';
import { Controller, SubmitHandler, useForm } from 'react-hook-form';

export const Route = createFileRoute('/dashboard/_layout/blog/create')({
  component: AddBlog,
});

interface BlogFormValues {
  title: string;
  content: string;
  author: string;
  tags: string;
  thumbnail?: string;
  slug: string;
  description: string;
  gallery: string; // Chuỗi URL cách nhau bởi dấu phẩy hoặc mảng trong blogData
  createdAt: string;
  updatedAt: string;
}

function AddBlog() {
  const navigate = useNavigate();
  const { createPost } = useBlogMutation();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imageUrl, setImageUrl] = useState<string>('');
  const [selectedGallery, setSelectedGallery] = useState<File[]>([]); // Danh sách file gallery

  const {
    register,
    setValue,
    control,
    getValues,
    formState: { errors },
    setError,
    trigger,
    reset,
  } = useForm<BlogFormValues>({
    defaultValues: {
      title: '',
      content: '',
      author: '',
      tags: '',
      description: '',
      thumbnail: '',
      slug: '',
      gallery: '',
      createdAt: '',
      updatedAt: '',
    },
    mode: 'onSubmit',
  });

  const formatFileSize = (size: number) => {
    if (size < 1024) return `${size} B`;
    else if (size < 1048576) return `${(size / 1024).toFixed(2)} KB`;
    else return `${(size / 1048576).toFixed(2)} MB`;
  };

  const handleThumbnailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const file = files[0];
      console.log('Selected thumbnail:', file.name, file.size, file.type);
      if (file.size > 500 * 1024) {
        setError('thumbnail', {
          type: 'manual',
          message: 'Kích thước tệp tối đa là 500KB.',
        });
        toast.error('Kích thước tệp tối đa là 500KB.');
        return;
      }
      if (!['image/jpeg', 'image/png'].includes(file.type)) {
        setError('thumbnail', {
          type: 'manual',
          message: 'Chỉ hỗ trợ định dạng .jpg và .png.',
        });
        toast.error('Chỉ hỗ trợ định dạng .jpg và .png.');
        return;
      }
      setSelectedImage(file);
      setImageUrl(URL.createObjectURL(file));
      setValue('thumbnail', file.name);
      console.log('Thumbnail set to:', file.name);
    }
  };

  const handleGalleryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const fileArray = Array.from(files);
      console.log(
        'Selected gallery files:',
        fileArray.map(f => f.name)
      );
      if (fileArray.length > 10) {
        setError('gallery', {
          type: 'manual',
          message: 'Tối đa 10 ảnh trong gallery.',
        });
        toast.error('Tối đa 10 ảnh trong gallery.');
        return;
      }
      fileArray.forEach(file => {
        if (file.size > 500 * 1024) {
          setError('gallery', {
            type: 'manual',
            message: 'Kích thước tệp tối đa là 500KB.',
          });
          toast.error('Kích thước tệp tối đa là 500KB.');
          return;
        }
        if (!['image/jpeg', 'image/png'].includes(file.type)) {
          setError('gallery', {
            type: 'manual',
            message: 'Chỉ hỗ trợ định dạng .jpg và .png.',
          });
          toast.error('Chỉ hỗ trợ định dạng .jpg và .png.');
          return;
        }
      });
      setSelectedGallery(fileArray);
      setValue('gallery', fileArray.map(f => f.name).join(',')); // Lưu tên file tạm thời
      console.log(
        'Gallery set to:',
        fileArray.map(f => f.name)
      );
    }
  };

  const handleThumbnailClick = () => {
    if (fileInputRef.current) fileInputRef.current.click();
  };

  const handleGalleryClick = () => {
    if (galleryInputRef.current) galleryInputRef.current.click();
  };

  const onCreateBlog: SubmitHandler<BlogFormValues> = async data => {
    console.log('onCreateBlog called with data:', data);
    try {
      // Upload thumbnail
      if (!selectedImage) {
        setError('thumbnail', {
          type: 'manual',
          message: 'Ảnh thumbnail bắt buộc.',
        });
        toast.error('Vui lòng chọn ảnh thumbnail.');
        return;
      }

      const formDataThumbnail = new FormData();
      formDataThumbnail.append('blog', selectedImage);
      console.log(
        'Uploading thumbnail:',
        selectedImage.name,
        selectedImage.size
      );
      const thumbnailResponse = await axios.post(
        `http://localhost:8080/api/upload-thumbnail-blog`,
        formDataThumbnail,
        { headers: { 'Content-Type': 'multipart/form-data' } }
      );
      console.log('Thumbnail upload response:', thumbnailResponse.data);
      const thumbnailUrl = thumbnailResponse.data;
      if (!thumbnailUrl || typeof thumbnailUrl !== 'string') {
        throw new Error(
          'Thumbnail upload failed: Invalid URL returned from server'
        );
      }

      // Upload gallery (nếu có)
      let galleryUrls: string[] = [];
      if (selectedGallery.length > 0) {
        const formDataGallery = new FormData();
        selectedGallery.forEach(file => {
          formDataGallery.append('photos', file); // Tên field phải khớp với router: "photos"
        });
        console.log(
          'Uploading gallery:',
          selectedGallery.map(f => f.name)
        );
        const galleryResponse = await axios.post(
          `http://localhost:8080/api/upload-gallery-blog`,
          formDataGallery,
          { headers: { 'Content-Type': 'multipart/form-data' } }
        );
        console.log('Gallery upload response:', galleryResponse.data);
        galleryUrls = galleryResponse.data; // Giả sử API trả về mảng URL
        if (
          !Array.isArray(galleryUrls) ||
          galleryUrls.some(url => typeof url !== 'string')
        ) {
          throw new Error(
            'Gallery upload failed: Invalid URLs returned from server'
          );
        }
      }

      const currentDate = new Date().toISOString();
      const blogData = {
        ...data,
        thumbnail: thumbnailUrl,
        gallery: galleryUrls, // Chuyển mảng URL thành chuỗi nếu cần
        createdAt: currentDate,
        updatedAt: currentDate,
        tags: data.tags.split(',').map(tag => tag.trim()),
      };

      createPost.mutate(blogData, {
        onSuccess: () => {
          console.log('Blog created successfully');
          toast.success('Tạo bài viết thành công');
          reset();
          setSelectedImage(null);
          setImageUrl('');
          setSelectedGallery([]);
          navigate({ to: '/dashboard/blog' });
        },
        onError: error => {
          console.error('Create post error:', error);
          toast.error(`Lỗi khi tạo bài viết: ${error.message}`);
        },
      });
    } catch (error: any) {
      console.error('Error in onCreateBlog:', error);
      toast.error(error.message || 'Lỗi khi tạo bài viết');
    }
  };

  const handleEditorChange = (content: string) => {
    setValue('content', content);
    trigger('content');
  };

  const onSubmitDebug = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Form submit triggered');
    console.log('Form values:', getValues());
    console.log('Form errors:', errors);
    const data = getValues();
    await onCreateBlog(data);
  };

  return (
    <div className="h-screen overflow-y-auto">
      <div className="fixed left-0 right-0 top-16 z-10 md:relative md:left-auto md:right-auto md:top-0">
        <NewHeader
          breadcrumbs={[
            { title: 'Danh sách bài viết', href: '/dashboard/blog' },
            { title: 'Thêm bài viết mới' },
          ]}
        />
      </div>
      <form onSubmit={onSubmitDebug} className="m-8">
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
              Tạo bài viết
            </Button>
          </div>
        </div>

        <div className="rounded-lg border bg-ui-bg-base p-7">
          <h1 className="text-2xl font-medium text-ui-fg-base">
            Thông tin bài viết
          </h1>
          <p className="mb-4 text-sm font-normal text-ui-fg-subtle">
            Nhập chi tiết bài viết như tiêu đề, nội dung...
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
                  <span className="text-ui-tag-red-text">*</span> Thẻ
                </label>
                <Input
                  placeholder="Thẻ (cách nhau bởi dấu phẩy)"
                  size="base"
                  {...register('tags', { required: 'Thẻ bắt buộc' })}
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
                <span className="text-ui-tag-red-text">*</span> Ảnh Thumbnail
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
                        {formatFileSize(selectedImage.size)}
                      </p>
                    </div>
                    <XMark
                      className="cursor-pointer"
                      onClick={() => {
                        setSelectedImage(null);
                        setImageUrl('');
                        setValue('thumbnail', '');
                      }}
                    />
                  </div>
                )}
                {imageUrl && (
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
                        <div>
                          <p className="text-sm font-normal text-ui-fg-base">
                            {file.name}
                          </p>
                          <p className="text-xs font-normal text-ui-fg-subtle">
                            {formatFileSize(file.size)}
                          </p>
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
                              newGallery.map(f => f.name).join(',')
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
                  defaultValue=""
                  rules={{ required: 'Nội dung cần bắt buộc' }}
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

export default AddBlog;
