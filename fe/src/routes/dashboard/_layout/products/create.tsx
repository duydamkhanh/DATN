import instance from '@/api/axiosIntance';
import NewHeader from '@/components/layoutAdmin/header/new-header';
import TextareaDescription from '@/components/textarea';
import useProductMutation from '@/data/products/useProductMutation';
import { ArrowDownTray, PlusMini, Trash, XMark } from '@medusajs/icons';
import { Button, Input, Select, Textarea, toast } from '@medusajs/ui';
import { createFileRoute, useNavigate } from '@tanstack/react-router';
import axios from 'axios';
import { useRef, useState } from 'react';
import {
  Controller,
  SubmitHandler,
  useFieldArray,
  useForm,
} from 'react-hook-form';

export const Route = createFileRoute('/dashboard/_layout/products/create')({
  loader: async () => {
    const response = await instance.get('categories');
    return response.data as Category[];
  },
  component: AddProduct,
});

function AddProduct() {
  const navigate = useNavigate();
  const [Loading, setIsLoading] = useState(false);
  const categories = Route.useLoaderData();

  const {
    register,
    handleSubmit,
    setValue,
    control,
    watch,
    reset,
    formState: { errors },
  } = useForm<{
    name: string;
    price: number;
    originalPrice: number;
    image: string;
    category: string;
    gallery?: string[];
    description: string;
    detaildescription: string;
    totalCountInStock: number;
    variants: Variant[];
  }>({
    defaultValues: {
      variants: [
        { size: '', color: '', price: 0, countInStock: 0, imageVariant: '' },
      ],
    },
  });

  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [selectedVariant, setSelectedVariant] = useState<File | null>(null);
  const [selectedGallery, setSelectedGallery] = useState<File[] | []>([]);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const fileInput2Ref = useRef<HTMLInputElement>(null);
  const fileInput3Ref = useRef<HTMLInputElement>(null);

  const { createProduct } = useProductMutation();

  const handleGalleryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let selectedGallery: File[] = [];
    const maxSize = 800000; // 500KB
    let errorMessage = ''; // Khởi tạo chuỗi lỗi

    if (e.target.files && e.target.files.length > 0) {
      for (let file of e.target.files) {
        if (file.size > maxSize) {
          errorMessage += `File ${file.name} quá lớn, vui lòng chọn file nhỏ hơn 500KB.\n`;
        } else if (!['image/jpeg', 'image/png'].includes(file.type)) {
          errorMessage += `File ${file.name} không phải định dạng .jpg hoặc .png.\n`;
        } else {
          selectedGallery.push(file);
        }
      }

      if (errorMessage) {
        toast.error(errorMessage);
      }

      if (selectedGallery.length === 0) {
        toast.error('Vui lòng chọn ít nhất một ảnh hợp lệ.');
      } else {
        setSelectedGallery(prev => [...prev, ...selectedGallery]);
      }
    } else {
      toast.error('Vui lòng chọn ít nhất một file.');
    }
  };
  const handleThumbnailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      setSelectedImage(files[0]);
    }
  };
  const handleVariantChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const imageVariant = e.target.files;
    if (imageVariant && imageVariant.length > 0) {
      setSelectedVariant(imageVariant[0]);
    }
  };

  const handleClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handle2Click = () => {
    if (fileInput3Ref.current) {
      fileInput3Ref.current.click();
    }
  };

  const formatFileSize = (size: number) => {
    return size < 1024 * 1024
      ? `${(size / 1024).toFixed(2)}KB`
      : `${(size / (1024 * 1024)).toFixed(2)}MB`;
  };

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'variants',
  });

  const onCreateProduct: SubmitHandler<{
    name: string;
    price: number;
    originalPrice: number;
    image: string;
    category: string[];
    gallery?: string[];
    description: string;
    totalCountInStock: number;
    variants: Variant[];
  }> = async data => {
    // Kiểm tra trùng size và color
    const uniqueVariants = new Set();
    for (const variant of data.variants) {
      const key = `${variant.color}-${variant.size}`;
      if (uniqueVariants.has(key)) {
        toast.error('Duplicate variant detected: color must be unique.');
        return;
      }
      uniqueVariants.add(key);
    }

    if (!selectedImage) return;

    const formDataThumbnail = new FormData();
    const formDataGallery = new FormData();
    formDataThumbnail.append('image', selectedImage);
    for (let file of selectedGallery) {
      formDataGallery.append('photos', file);
    }

    setIsLoading(true);
    try {
      // Upload ảnh chính & ảnh gallery
      const [responseThumbnail, responseGallery] = await Promise.all([
        axios.post(
          `http://localhost:8080/api/upload-thumbnail-product`,
          formDataThumbnail
        ),
        axios.post(
          `http://localhost:8080/api/upload-gallery-product`,
          formDataGallery
        ),
      ]);

      // Upload từng ảnh biến thể nếu có
      const uploadedVariants = await Promise.all(
        data.variants.map(async variant => {
          console.log('Checking variant:', variant);

          if (variant.imageVariant instanceof File) {
            console.log('Uploading variant image:', variant.imageVariant);

            const formDataVariant = new FormData();
            formDataVariant.append('variant', variant.imageVariant);

            const response = await axios.post(
              `http://localhost:8080/api/upload-variant-product`,
              formDataVariant
            );

            console.log('Uploaded variant image:', response.data);

            return { ...variant, imageVariant: response.data };
          }

          console.log('Skipping variant without image');
          return variant; // Nếu không có ảnh thì giữ nguyên
        })
      );

      // Gửi dữ liệu sản phẩm lên server
      createProduct.mutate(
        {
          ...data,
          image: responseThumbnail.data,
          gallery: responseGallery.data,
          variants: uploadedVariants, // Cập nhật biến thể với ảnh đã upload
        },
        {
          onSuccess: () => {
            setIsLoading(false);
            reset();
          },
          onError: error => {
            setIsLoading(false);
            toast.error(`Cập nhật trạng thái thất bại: ${error.message}`);
          },
        }
      );
    } catch (error) {
      setIsLoading(false);
      toast.error('Failed to upload image');
    }
  };

  const handleEditorChange = (content: string) => {
    setValue('detaildescription', content);
    trigger('detaildescription');
  };

  console.log('selectedGallery', selectedGallery);

  return (
    <div className="h-screen overflow-y-auto">
      {Loading && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-800 bg-opacity-50">
          <div className="flex items-center justify-center space-x-2 rounded-lg bg-white p-6 py-4 shadow-lg">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-t-4 border-solid border-gray-200 border-t-indigo-600" />
            <p className="text-gray-500">Đang thêm sản phẩm...</p>
          </div>
        </div>
      )}
      <div className="fixed left-0 right-0 top-16 z-10 md:relative md:left-auto md:right-auto md:top-0">
        <NewHeader
          breadcrumbs={[
            {
              title: 'Danh sách sản phẩm',
              href: '/dashboard/products',
            },
            {
              title: 'thêm sản phẩm mới',
            },
          ]}
        />
      </div>
      <form onSubmit={handleSubmit(onCreateProduct)} className="m-8">
        <div className="my-3 flex justify-end">
          <div className="flex gap-2">
            <Button
              variant="secondary"
              type="button"
              onClick={() => navigate({ to: '/dashboard/products' })}
            >
              Hủy
            </Button>
            <Button variant="primary" type="submit">
              Thêm sản phẩm mới
            </Button>
          </div>
        </div>
        <div className="rounded-lg border bg-ui-bg-base p-7">
          <h1 className="text-2xl font-medium text-ui-fg-base">
            Thông tin chung
          </h1>
          <p className="mb-4 text-sm font-normal text-ui-fg-subtle">
            Cung cấp các chi tiết cơ bản về thương hiệu như tên, chủng loại, giá
            cả, giảm giá và mô tả.
          </p>

          <div className="space-y-4">
            {/* Product Name */}
            <div className="flex space-x-4">
              <div className="flex-1 space-y-3">
                <label className="text-sm font-medium text-ui-fg-base">
                  <span className="text-ui-tag-red-text">*</span> Tên sản phẩm
                </label>
                <Input
                  placeholder="Type here"
                  size="base"
                  {...register('name', {
                    required: 'Tên sản phẩm phải bắt buộc',
                  })}
                />
                {errors.name && (
                  <span className="text-xs text-red-500">
                    {errors.name.message}
                  </span>
                )}
              </div>
            </div>

            {/* Image Upload */}
            <div>
              <label className="text-sm font-medium text-ui-fg-base">
                <span className="text-ui-tag-red-text">*</span> Ảnh
              </label>
              <p className="mb-2 text-xs text-ui-fg-muted">
                Kích thước tệp tối đa là 500KB. Hỗ trợ các định dạng .jpg và
                .png.
              </p>
              <button
                type="button"
                className="flex w-full cursor-pointer flex-col items-center gap-2 rounded-lg border border-dashed border-ui-border-strong p-8"
                onClick={handleClick}
              >
                <div className="mb-2 flex items-center">
                  <ArrowDownTray className="mr-1 h-5 w-5" />
                  <p className="text-xs font-medium text-ui-fg-base">
                    Tải lên file
                  </p>
                  <input
                    type="file"
                    id="image"
                    ref={fileInputRef}
                    accept=".jpg, .png"
                    onChange={handleThumbnailChange}
                    className="hidden cursor-pointer"
                  />
                </div>
                <p className="mb-2 text-center text-xs text-ui-fg-muted">
                  Kéo và thả file vào đây hoặc bấm vào để tải lên
                </p>
              </button>
              <div className="mt-5">
                {selectedImage && (
                  <div className="mb-3 flex items-center justify-between gap-3 rounded-lg border bg-ui-bg-subtle-hover px-2 py-3">
                    <div>
                      <p className="text-sm font-normal text-ui-fg-base">
                        <img
                          src={URL.createObjectURL(selectedImage)}
                          alt="Ảnh sản phẩm"
                          className="h-10 w-10 rounded-lg object-cover"
                        />
                      </p>
                      <p className="text-xs font-normal text-ui-fg-subtle">
                        {formatFileSize(selectedImage.size)},{' '}
                        {selectedImage.name}
                      </p>
                    </div>
                    <XMark
                      className="cursor-pointer"
                      onClick={() => setSelectedImage(null)}
                    />
                  </div>
                )}
              </div>
            </div>

            {/* originalPrice */}
            <div className="flex space-x-4">
              <div className="flex-1 space-y-3">
                <label className="text-sm font-medium text-ui-fg-base">
                  <span className="text-ui-tag-red-text">*</span> Giá Cũ (VND)
                </label>
                <Input
                  type="number"
                  step="0.01"
                  placeholder="e.g., 199.99"
                  size="base"
                  {...register('originalPrice', {
                    required: 'Giá cũ phải bắt buộc',
                    min: { value: 0, message: 'Giá không được nhỏ hơn 0' },
                  })}
                />
                {errors.originalPrice && (
                  <span className="text-xs text-red-500">
                    {errors.originalPrice.message}
                  </span>
                )}
              </div>
            </div>

            {/* Price */}
            <div className="flex space-x-4">
              <div className="flex-1 space-y-3">
                <label className="text-sm font-medium text-ui-fg-base">
                  <span className="text-ui-tag-red-text">*</span> Giá (VND)
                </label>
                <Input
                  type="number"
                  step="0.01"
                  placeholder="e.g., 199.99"
                  size="base"
                  {...register('price', {
                    required: 'Giá phải bắt buộc',
                    min: { value: 0, message: 'Giá không được nhỏ hơn 0' },
                  })}
                />
                {errors.price && (
                  <span className="text-xs text-red-500">
                    {errors.price.message}
                  </span>
                )}
              </div>
            </div>

            {/* Category */}
            <div className="flex space-x-4">
              <div className="flex-1 space-y-3">
                <label className="text-sm font-medium text-ui-fg-base">
                  <span className="text-ui-tag-red-text">*</span> Danh mục
                </label>
                <div className="w-full">
                  <Select
                    onValueChange={value => setValue('category', value)}
                    defaultValue=""
                  >
                    <Select.Trigger>
                      <Select.Value placeholder="Select a category" />
                    </Select.Trigger>
                    <Select.Content>
                      {categories.map(category => (
                        <Select.Item key={category._id} value={category._id}>
                          {category.name}
                        </Select.Item>
                      ))}
                    </Select.Content>
                  </Select>
                </div>
                {errors.category && (
                  <span className="text-xs text-red-500">
                    {errors.category.message}
                  </span>
                )}
              </div>
            </div>
            {/* Description */}
            <div className="flex space-x-4">
              <div className="flex-1 space-y-3">
                <label className="text-sm font-medium text-ui-fg-base">
                  <span className="text-ui-tag-red-text">*</span> Mô tả
                </label>
                <Textarea
                  placeholder="Type here"
                  {...register('description')}
                />
              </div>
            </div>

            {/* Gallery Upload */}
            <div>
              <label className="text-sm font-medium text-ui-fg-base">
                <span className="text-ui-tag-red-text">*</span> Ảnh trưng bày
              </label>
              <p className="mb-2 text-xs text-ui-fg-muted">
                Kích thước tệp tối đa là 500KB. Hỗ trợ các định dạng .jpg và
                .png.
              </p>
              <button
                type="button"
                className="flex w-full cursor-pointer flex-col items-center gap-2 rounded-lg border border-dashed border-ui-border-strong p-8"
                onClick={() => fileInput2Ref.current?.click()}
              >
                <div className="mb-2 flex items-center">
                  <ArrowDownTray className="mr-1 h-5 w-5" />
                  <p className="text-xs font-medium text-ui-fg-base">
                    Tải lên file
                  </p>
                  <input
                    type="file"
                    id="photos"
                    multiple
                    ref={fileInput2Ref}
                    accept=".jpg, .png"
                    onChange={handleGalleryChange}
                    className="hidden cursor-pointer"
                  />
                </div>
                <p className="mb-2 text-center text-xs text-ui-fg-muted">
                  Kéo và thả file vào đây hoặc bấm vào để tải lên
                </p>
              </button>
              <div className="mt-5">
                {selectedGallery.length > 0 &&
                  selectedGallery.map(item => (
                    <div className="mb-3 flex items-center justify-between gap-3 rounded-lg border bg-ui-bg-subtle-hover px-2 py-3">
                      <div className="">
                        <p className="text-sm font-normal text-ui-fg-base">
                          <img
                            src={URL.createObjectURL(item)}
                            alt="Ảnh sản phẩm"
                            className="h-10 w-10 rounded-lg object-cover"
                          />
                        </p>
                        <p className="text-xs font-normal text-ui-fg-subtle">
                          {formatFileSize(item.size)}, {item.name}
                        </p>
                      </div>
                      <XMark
                        className="cursor-pointer"
                        onClick={() =>
                          setSelectedGallery(prev =>
                            prev.filter(file => file.name != item.name)
                          )
                        }
                      />
                    </div>
                  ))}
              </div>

              <div className="flex flex-col">
                <label className="text-sm font-medium text-ui-fg-base">
                  <span className="text-ui-tag-red-text">*</span> Content
                </label>
                <div className="mt-2 flex flex-1 flex-col">
                  <Controller
                    name="detaildescription"
                    control={control}
                    defaultValue=""
                    rules={{ required: 'Mô tả cần bắt buộc' }}
                    render={({ field: { onChange, value } }) => (
                      <TextareaDescription
                        apiKey="03491t61serrx76t1i2kcn2dno2b45jmt28up6et6tgrb3uz"
                        value={value}
                        onChange={(content: string) =>
                          handleEditorChange(content, onChange)
                        }
                        className="h-full w-full" // To make the text area take full space
                      />
                    )}
                  />
                  {errors.detaildescription && (
                    <span className="mt-2 text-xs text-red-500">
                      {errors.detaildescription.message}
                    </span>
                  )}
                </div>
              </div>
            </div>
            {/* Variants */}

            <div>
              <h2 className="mt-5 text-lg font-medium text-ui-fg-base">
                Biến thể
              </h2>
              <div className="mt-4">
                {fields.map((item, index) => (
                  <div key={item.id} className="mb-4 flex space-x-4">
                    <div className="flex-1 space-y-3">
                      <label className="text-sm font-medium text-ui-fg-base">
                        <span className="text-ui-tag-red-text">*</span> Size
                      </label>
                      <Input
                        placeholder="e.g., M"
                        size="base"
                        {...register(`variants.${index}.size`, {
                          required: 'Kích thước là bắt buộc',
                        })}
                      />
                      {errors.variants?.[index]?.size && (
                        <span className="text-xs text-red-500">
                          {errors.variants[index].size.message}
                        </span>
                      )}
                    </div>
                    <div>
                      <label className="text-sm font-medium text-ui-fg-base">
                        <span className="text-ui-tag-red-text">*</span> Ảnh biến
                        thể
                      </label>
                      <button
                        type="button"
                        className="mt-2 flex w-full cursor-pointer flex-col items-center gap-2 rounded-lg border-ui-border-strong"
                        onClick={handle2Click}
                      >
                        <div className="flex items-center gap-2">
                          <label
                            htmlFor={`upload-${index}`}
                            className="flex cursor-pointer items-center rounded-lg border border-dashed border-gray-300 px-4 py-2 text-sm font-medium text-gray-600 hover:border-blue-500 hover:bg-blue-50"
                          >
                            <ArrowDownTray className="mr-2 h-5 w-5 text-gray-500" />
                            <span>Tải lên ảnh</span>
                          </label>
                          <input
                            id={`upload-${index}`}
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={e => {
                              const file = e.target.files?.[0];
                              if (file) {
                                setValue(
                                  `variants.${index}.imageVariant`,
                                  file
                                ); // Cập nhật vào form
                              }
                            }}
                          />
                          {watch(`variants.${index}.imageVariant`) && (
                            <img
                              src={URL.createObjectURL(
                                watch(`variants.${index}.imageVariant`)
                              )}
                              alt="Preview"
                              className="h-12 w-12 rounded-lg object-cover shadow-md"
                            />
                          )}
                        </div>
                      </button>
                      <div className="mt-5">
                        {selectedVariant && (
                          <div className="mb-3 flex items-center justify-between gap-3 rounded-lg border bg-ui-bg-subtle-hover px-2 py-3">
                            <div>
                              <p className="text-sm font-normal text-ui-fg-base">
                                <img
                                  src={URL.createObjectURL(selectedVariant)}
                                  alt="Ảnh sản phẩm"
                                  className="h-10 w-10 rounded-lg object-cover"
                                />
                              </p>
                              <p className="text-xs font-normal text-ui-fg-subtle">
                                {formatFileSize(selectedVariant.size)},{' '}
                                {selectedVariant.name}
                              </p>
                            </div>
                            <XMark
                              className="cursor-pointer"
                              onClick={() => setSelectedVariant(null)}
                            />
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex-1 space-y-3">
                      <label className="text-sm font-medium text-ui-fg-base">
                        <span className="text-ui-tag-red-text">*</span> Màu
                      </label>
                      <Input
                        placeholder="e.g., Red"
                        size="base"
                        {...register(`variants.${index}.color`, {
                          required: 'Màu là bắt buộc',
                        })}
                      />
                      {errors.variants?.[index]?.color && (
                        <span className="text-xs text-red-500">
                          {errors.variants[index].color.message}
                        </span>
                      )}
                    </div>
                    <div className="flex-1 space-y-3">
                      <label className="text-sm font-medium text-ui-fg-base">
                        <span className="text-ui-tag-red-text">*</span> Giá
                        (VND)
                      </label>
                      <Input
                        type="number"
                        placeholder="e.g., 199.99"
                        size="base"
                        {...register(`variants.${index}.price`, {
                          required: 'Giá phải bắt buộc',
                          min: { value: 0, message: 'Giá phải lớn hơn 0' },
                        })}
                      />
                      {errors.variants?.[index]?.price && (
                        <span className="text-xs text-red-500">
                          {errors.variants[index].price.message}
                        </span>
                      )}
                    </div>
                    <div className="flex-1 space-y-3">
                      <label className="text-sm font-medium text-ui-fg-base">
                        <span className="text-ui-tag-red-text">*</span> Số lượng
                      </label>
                      <Input
                        type="number"
                        placeholder="e.g., 100"
                        size="base"
                        {...register(`variants.${index}.countInStock`, {
                          required: 'Số lượng trong kho là bắt buộc',
                          min: { value: 0, message: 'Số lượng phải lớn hơn 0' },
                        })}
                      />
                      {errors.variants?.[index]?.countInStock && (
                        <span className="text-xs text-red-500">
                          {errors.variants[index].countInStock.message}
                        </span>
                      )}
                    </div>
                    <div className="flex-1 space-y-3">
                      <label className="text-sm font-medium text-ui-fg-base">
                        <span className="text-ui-tag-red-text">*</span> Khối
                        lượng
                      </label>
                      <Input
                        type="number"
                        placeholder="e.g., 100"
                        size="base"
                        {...register(`variants.${index}.weight` as const, {
                          required: 'Khối lượng cần bắt buộc',
                          min: {
                            value: 0,
                            message: 'weight must be positive',
                          },
                        })}
                      />
                      {errors.variants?.[index]?.countInStock && (
                        <span className="text-xs text-red-500">
                          {errors.variants[index].countInStock.message}
                        </span>
                      )}
                    </div>
                    <Trash
                      className="mt-9 cursor-pointer text-red-500"
                      onClick={() => remove(index)}
                    />
                  </div>
                ))}

                <Button
                  variant="secondary"
                  onClick={() => {
                    const currentVariants = watch('variants') || [];
                    setValue('variants', [
                      ...currentVariants,
                      {
                        size: '',
                        color: '',
                        price: 0,
                        countInStock: 0,
                        weight: 0,
                        sku: '',
                      },
                    ]);
                  }}
                >
                  <PlusMini /> Thêm biến thể
                </Button>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}

export default AddProduct;
