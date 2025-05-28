import useProductMutation from '@/data/products/useProductMutation';
import { Button, Input, Select, Textarea, toast } from '@medusajs/ui';
import {
  createFileRoute,
  useNavigate,
  RouteParams,
} from '@tanstack/react-router';
import axios from 'axios';
import { useRef, useState, useEffect } from 'react';
import { ArrowDownTray, PlusMini, Trash, XMark } from '@medusajs/icons';
import {
  Controller,
  SubmitHandler,
  useFieldArray,
  useForm,
} from 'react-hook-form';
import instance from '@/api/axiosIntance';
import TextareaDescription from '@/components/textarea';
import NewHeader from '@/components/layoutAdmin/header/new-header';
import useCartMutation from '@/data/cart/useCartMutation';

export const Route = createFileRoute('/dashboard/_layout/products/$id/edit')({
  loader: async ({ params }: { params: RouteParams }) => {
    const { id } = params;
    if (!id) {
      throw new Error('Product ID is required');
    }
    const productResponse = await instance.get(`products/${id}`);
    const categoriesResponse = await instance.get('categories');

    return {
      product: productResponse.data?.data as Product,
      categories: categoriesResponse.data as Category[],
    };
  },
  component: EditProduct,
});

function EditProduct() {
  const navigate = useNavigate();
  const userId = localStorage.getItem('userId');

  const { product, categories } = Route.useLoaderData();

  const {
    register,
    handleSubmit,
    setValue,
    control,
    watch,
    reset,
    formState: { errors },
  } = useForm<{
    _id: string;
    name: string;
    price: number;
    originalPrice: number;
    image: string;
    category: string[];
    gallery?: string[];
    description: string;
    detaildescription: string;
    totalCountInStock: number;
    variants: Variant[];
  }>({
    defaultValues: {
      _id: '',
      name: '',
      price: 0,
      originalPrice: 0,
      image: '',
      category: [],
      gallery: [],
      description: '',
      totalCountInStock: 0,
      variants: [],
    },
  });

  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [selectedVariant, setSelectedVariant] = useState<File | null>(null);
  const [selectedGallery, setSelectedGallery] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState({});

  const fileInputRef = useRef<HTMLInputElement>(null);
  const fileInput2Ref = useRef<HTMLInputElement>(null);
  const fileInput3Ref = useRef<HTMLInputElement>(null);

  const { editProduct } = useProductMutation();
  const { deleteItemFromCart } = useCartMutation();
  const { fields, append, remove } = useFieldArray({
    control,
    name: 'variants',
  });

  const handleDeleteFormCart = async (variantIds: string[]) => {
    await deleteItemFromCart.mutateAsync({
      userId: String(userId),
      variantIds: variantIds,
    });
  };

  const getImagePreview = imageVariant => {
    if (!imageVariant) return ''; // Nếu không có ảnh, trả về chuỗi rỗng
    if (imageVariant instanceof File) return URL.createObjectURL(imageVariant); // Nếu là File, tạo URL
    if (typeof imageVariant === 'string' && imageVariant.startsWith('http'))
      return imageVariant; // Nếu là URL hợp lệ từ API, giữ nguyên
    return ''; // Trả về chuỗi rỗng nếu giá trị không hợp lệ
  };

  useEffect(() => {
    const variants = watch('variants') || [];
    const newPreviews = {};

    variants.forEach((variant, index) => {
      newPreviews[index] = getImagePreview(variant?.imageVariant);
    });

    setImagePreviews(newPreviews);

    // 🛑 Xóa ObjectURL để tránh rò rỉ bộ nhớ
    return () => {
      Object.values(newPreviews).forEach(url => {
        if (url.startsWith('blob:')) {
          URL.revokeObjectURL(url);
        }
      });
    };
  }, [watch('variants')]);

  useEffect(() => {
    if (product) {
      reset({
        _id: product._id,
        name: product.name,
        price: product.price,
        originalPrice: product.originalPrice,
        image: product.image,
        category: product.category,
        gallery: product.gallery || [],
        description: product.description,
        detaildescription: product.detaildescription,
        totalCountInStock: product.totalCountInStock || 0,
        variants: product.variants.map(variant => ({
          size: variant.size,
          color: variant.color,
          price: variant.price,
          countInStock: variant.countInStock,
          sku: variant.sku,
          weight: variant.weight,
          imageVariant:
            typeof variant.imageVariant === 'string' ||
            variant.imageVariant instanceof File
              ? variant.imageVariant
              : '', // Nếu không phải string hoặc File, đặt rỗng tránh lỗi
        })),
      });
    }
  }, [product, reset]);

  const handleGalleryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let selectedGalleryFiles: File[] = [];
    if (e.target.files && e.target.files.length > 0) {
      for (let file of e.target.files) {
        selectedGalleryFiles.push(file);
      }
      setSelectedGallery(selectedGalleryFiles);
    }
  };

  const handleThumbnailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      setSelectedImage(files[0]);
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
  // const plainText = data.detaildescription
  //   .replace(/<\/?[^>]+(>|$)/g, '')
  //   .normalize('NFC');
  const onCreateProduct: SubmitHandler<{
    _id: string;
    name: string;
    price: number;
    originalPrice: number;
    image: string;
    category: string[];
    gallery?: string[];
    description: string;
    detaildescription: string;
    totalCountInStock: number;
    variants: Variant[];
  }> = async data => {
    const uniqueVariants = new Set();
    for (const variant of data.variants) {
      const key = `${variant.size}-${variant.color}`;

      if (uniqueVariants.has(key)) {
        toast.error('Duplicate variant detected: color must be unique.');
        return;
      }
      uniqueVariants.add(key);
    }
    if (
      !data.name ||
      !data.price ||
      data.category.length === 0 ||
      !data.description
    ) {
      // Kiểm tra các trường bắt buộc
      return;
    }

    const totalCountInStock = data.variants.reduce((total, variant) => {
      return total + Number(variant.countInStock);
    }, 0);

    const formDataThumbnail = new FormData();
    const formDataGallery = new FormData();

    if (selectedImage) {
      formDataThumbnail.append('image', selectedImage);
    }

    if (selectedGallery.length > 0) {
      for (let file of selectedGallery) {
        formDataGallery.append('photos', file);
      }
    }

    try {
      const [responseThumbnail, responseGallery] = await Promise.all([
        selectedImage
          ? axios.post(
              `http://localhost:8080/api/upload-thumbnail-product`,
              formDataThumbnail
            )
          : Promise.resolve({ data: data.image }), // Nếu không tải lên hình mới, giữ hình hiện tại
        selectedGallery.length > 0
          ? axios.post(
              `http://localhost:8080/api/upload-gallery-product`,
              formDataGallery
            )
          : Promise.resolve({ data: data.gallery }), // Nếu không tải lên gallery mới, giữ gallery hiện tại
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

      if (responseThumbnail?.data && responseGallery.data) {
        editProduct.mutate({
          ...data,
          image: responseThumbnail.data,
          gallery: responseGallery.data,
          variants: uploadedVariants,
          totalCountInStock: totalCountInStock,
        });

        navigate({ to: '/dashboard/products' }); // Chuyển hướng sau khi thành công
      }

      console.log('totalCountInStock', totalCountInStock);
    } catch (error) {
      console.error('Failed to upload image', error);
      // Xử lý lỗi nếu cần
    }
  };
  // Để cập nhật giá trị khi nội dung thay đổi
  const handleEditorChange = (content: string) => {
    setValue('detaildescription', content);
  };

  return (
    <div className="h-screen">
      <div className="fixed left-0 right-0 top-16 z-10 md:relative md:left-auto md:right-auto md:top-0">
        <NewHeader
          breadcrumbs={[
            {
              title: 'Danh sách sản phẩm',
              href: '/dashboard/products',
            },
            {
              title: 'Cập nhật sản phẩm',
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
              Lưu thay đổi
            </Button>
          </div>
        </div>
        <div className="rounded-lg border bg-ui-bg-base p-7">
          <h1 className="text-2xl font-medium text-ui-fg-base">
            Thông tin chung
          </h1>
          <p className="mb-4 text-sm font-normal text-ui-fg-subtle">
            Cung cấp các chi tiết cơ bản về sản phẩm như tên, chủng loại, giá
            cả, giảm giá và mô tả.
          </p>

          <div className="space-y-4">
            {/* Product Name */}
            <div className="flex space-x-4">
              <div className="flex-1 space-y-3">
                <label className="block text-sm font-medium text-ui-fg-base">
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
              <label className="block text-sm font-medium text-ui-fg-base">
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
                {selectedImage ? (
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
                      onClick={() => setSelectedImage(null)}
                    />
                  </div>
                ) : product.image ? (
                  <div className="mb-3 flex items-center justify-between gap-3 rounded-lg border bg-ui-bg-subtle-hover px-2 py-3">
                    <div>
                      <img
                        src={product.image}
                        alt={product.name}
                        className="h-10 w-10 object-cover"
                      />
                    </div>
                    <XMark
                      className="cursor-pointer"
                      onClick={() => setValue('image', '')}
                    />
                  </div>
                ) : null}
              </div>
            </div>

            {/* Price */}
            <div className="flex space-x-4">
              <div className="flex-1 space-y-3">
                <label className="block text-sm font-medium text-ui-fg-base">
                  <span className="text-ui-tag-red-text">*</span> Giá (VND)
                </label>
                <Input
                  type="number"
                  step="0.01"
                  placeholder="e.g., 199.99"
                  size="base"
                  {...register('price', {
                    required: 'Giá phải bắt buộc',
                    min: { value: 0, message: 'Price must be positive' },
                  })}
                />
                {errors.price && (
                  <span className="text-xs text-red-500">
                    {errors.price.message}
                  </span>
                )}
              </div>
            </div>

            {/* originalPrice */}
            <div className="flex space-x-4">
              <div className="flex-1 space-y-3">
                <label className="block text-sm font-medium text-ui-fg-base">
                  <span className="text-ui-tag-red-text">*</span> Giá Cũ (VND)
                </label>
                <Input
                  type="number"
                  step="0.01"
                  placeholder="e.g., 199.99"
                  size="base"
                  {...register('originalPrice', {
                    required: 'Giá cũ phải bắt buộc',
                    min: { value: 0, message: 'Price must be positive' },
                  })}
                />
                {errors.originalPrice && (
                  <span className="text-xs text-red-500">
                    {errors.originalPrice.message}
                  </span>
                )}
              </div>
            </div>

            {/* Category */}
            <div className="flex space-x-4">
              <div className="flex-1 space-y-3">
                <label className="block text-sm font-medium text-ui-fg-base">
                  <span className="text-ui-tag-red-text">*</span> Danh mục
                </label>
                <div className="w-full">
                  <Select
                    multiple
                    onValueChange={value => setValue('category', value)}
                    value={watch('category')}
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
                <label className="block text-sm font-medium text-ui-fg-base">
                  <span className="text-ui-tag-red-text">*</span> Mô tả
                </label>
                <Textarea
                  placeholder="Type here"
                  {...register('description', {
                    required: 'Mô tả phải bắt buộc',
                  })}
                />
                {errors.description && (
                  <span className="text-xs text-red-500">
                    {errors.description.message}
                  </span>
                )}
              </div>
            </div>

            {/* Gallery Upload */}
            <div>
              <label className="block text-sm font-medium text-ui-fg-base">
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
                {selectedGallery.length > 0
                  ? selectedGallery.map(item => (
                      <div
                        key={item.name}
                        className="mb-3 flex items-center justify-between gap-3 rounded-lg border bg-ui-bg-subtle-hover px-2 py-3"
                      >
                        <div>
                          <p className="text-sm font-normal text-ui-fg-base">
                            {item.name}
                          </p>
                          <p className="text-xs font-normal text-ui-fg-subtle">
                            {formatFileSize(item.size)}
                          </p>
                        </div>
                        <XMark
                          className="cursor-pointer"
                          onClick={() =>
                            setSelectedGallery(prev =>
                              prev.filter(file => file.name !== item.name)
                            )
                          }
                        />
                      </div>
                    ))
                  : product.gallery &&
                    product.gallery.map(imgUrl => (
                      <div
                        key={imgUrl}
                        className="mb-3 flex items-center justify-between gap-3 rounded-lg border bg-ui-bg-subtle-hover px-2 py-3"
                      >
                        <div>
                          <img
                            src={imgUrl}
                            alt="Gallery Image"
                            className="h-10 w-10 object-cover"
                          />
                        </div>
                        <XMark
                          className="cursor-pointer"
                          onClick={() => {
                            // Implement removal logic, e.g., remove from gallery array
                            const updatedGallery = watch('gallery').filter(
                              url => url !== imgUrl
                            );
                            setValue('gallery', updatedGallery);
                          }}
                        />
                      </div>
                    ))}
              </div>
            </div>
            {/* detaildescription */}
            <div className="flex flex-col">
              <label className="block text-sm font-medium text-ui-fg-base">
                <span className="text-ui-tag-red-text">*</span> Nội dung
              </label>
              <div className="mt-2 flex flex-1 flex-col">
                <Controller
                  name="detaildescription"
                  control={control}
                  defaultValue=""
                  rules={{ required: 'Mô tả phải bắt buộc' }}
                  render={({ field: { onChange, value } }) => (
                    <TextareaDescription
                      apiKey="vx5npguuuktlxhbv9tv6vvgjk1x5astnj8kznhujei9w6ech"
                      value={value}
                      onChange={content =>
                        handleEditorChange(content, onChange)
                      }
                      className="h-full w-full"
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

            {/* Variants */}
            <div>
              <h2 className="mt-5 text-lg font-medium text-ui-fg-base">
                Variants
              </h2>
              <div className="mt-4">
                {fields.map((item, index) => (
                  <div key={item.id} className="mb-4 flex space-x-4">
                    {/* Size Input */}
                    <div className="flex-1 space-y-3">
                      <label className="block text-sm font-medium text-ui-fg-base">
                        <span className="text-ui-tag-red-text">*</span> Size
                      </label>
                      <Input
                        placeholder="e.g., M"
                        size="base"
                        {...register(`variants.${index}.size` as const, {
                          required: 'Kích thước là bắt buộc',
                          validate: value => {
                            const variants = watch('variants');
                            const isDuplicate = variants.some(
                              (variant, i) =>
                                i !== index &&
                                variant.color.trim().toLowerCase() ===
                                  value.trim().toLowerCase() &&
                                variant.size.trim().toLowerCase() ===
                                  variants[index].size.trim().toLowerCase()
                            );
                            return isDuplicate
                              ? 'Kích thướcthước đã tồn tại.'
                              : true;
                          },
                        })}
                      />
                      {errors.variants?.[index]?.size && (
                        <span className="text-xs text-red-500">
                          {errors.variants[index].size.message}
                        </span>
                      )}
                    </div>
                    <div className="mt-6">
                      <label className="pt-1 text-sm font-medium text-ui-fg-base">
                        <span className="text-ui-tag-red-text">*</span> Ảnh biến
                        thể
                      </label>

                      <div className="mt-4 flex items-center gap-3">
                        {/* Nút tải ảnh */}
                        <label
                          htmlFor={`upload-${index}`}
                          className="mt-3 flex w-full cursor-pointer items-center justify-center rounded-lg border border-dashed border-gray-300 px-2 py-1 text-gray-600 transition-all hover:border-blue-500 hover:bg-blue-50"
                        >
                          <ArrowDownTray className="h-6 w-6 text-gray-500" />
                          <span className="text-sm font-medium">
                            Tải lên ảnh
                          </span>
                        </label>

                        {/* Input ẩn để chọn ảnh */}
                        <input
                          id={`upload-${index}`}
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={e => {
                            const file = e.target.files[0];
                            if (file) {
                              setValue(`variants.${index}.imageVariant`, file); // Lưu file vào form
                            }
                          }}
                        />

                        {/* Hiển thị ảnh preview nếu có */}
                        {(() => {
                          const imageValue = watch(
                            `variants.${index}.imageVariant`
                          );
                          console.log(
                            `Variant ${index} - imageVariant:`,
                            imageValue
                          );

                          if (!imageValue) return null; // Không hiển thị nếu chưa có ảnh

                          return (
                            <div className="relative">
                              <img
                                src={
                                  typeof imageValue === 'string'
                                    ? imageValue
                                    : URL.createObjectURL(imageValue)
                                }
                                alt="Preview"
                                className="mt-2 h-10 w-14 rounded-lg object-cover"
                              />
                            </div>
                          );
                        })()}
                      </div>
                    </div>

                    {/* Color Input */}
                    <div className="flex-1 space-y-3">
                      <label className="block text-sm font-medium text-ui-fg-base">
                        <span className="text-ui-tag-red-text">*</span> Color
                      </label>
                      <Input
                        placeholder="e.g., Red"
                        size="base"
                        {...register(`variants.${index}.color` as const, {
                          required: 'Màu là bắt buộc',
                          validate: value => {
                            const variants = watch('variants');
                            const isDuplicate = variants.some(
                              (variant, i) =>
                                i !== index &&
                                variant.color.trim().toLowerCase() ===
                                  value.trim().toLowerCase() &&
                                variant.size.trim().toLowerCase() ===
                                  variants[index].size.trim().toLowerCase()
                            );
                            return isDuplicate ? 'màu sắc đã tồn tại.' : true;
                          },
                        })}
                      />
                      {errors.variants?.[index]?.color && (
                        <span className="text-xs text-red-500">
                          {errors.variants[index].color.message}
                        </span>
                      )}
                    </div>
                    <div className="flex-1 space-y-3">
                      <label className="block text-sm font-medium text-ui-fg-base">
                        Price (VND)
                      </label>
                      <Input
                        type="number"
                        placeholder="e.g., 199.99"
                        size="base"
                        {...register(`variants.${index}.price` as const, {
                          required: 'Giá phải bắt buộc',
                          min: { value: 0, message: 'Price must be positive' },
                        })}
                      />
                      {errors.variants?.[index]?.price && (
                        <span className="text-xs text-red-500">
                          {errors.variants[index].price.message}
                        </span>
                      )}
                    </div>
                    <div className="flex-1 space-y-3">
                      <label className="block text-sm font-medium text-ui-fg-base">
                        Số lượng tồn kho
                      </label>
                      <Input
                        type="number"
                        placeholder="e.g., 100"
                        size="base"
                        {...register(
                          `variants.${index}.countInStock` as const,
                          {
                            required: 'Số lượng trong kho cần băt buộc',
                            min: {
                              value: 0,
                              message: 'Count In Stock must be positive',
                            },
                          }
                        )}
                      />
                      {errors.variants?.[index]?.countInStock && (
                        <span className="text-xs text-red-500">
                          {errors.variants[index].countInStock.message}
                        </span>
                      )}
                    </div>
                    <div className="flex-1 space-y-3">
                      <label className="block text-sm font-medium text-ui-fg-base">
                        Weight
                      </label>
                      <Input
                        placeholder="e.g., SKU123"
                        size="base"
                        {...register(`variants.${index}.weight` as const)}
                      />
                    </div>
                    <Trash
                      className="mt-24 cursor-pointer text-red-500"
                      onClick={() => {
                        remove(index);
                        handleDeleteFormCart([item.sku]);
                      }}
                    />
                  </div>
                ))}
                <Button
                  variant="secondary"
                  onClick={() =>
                    append({
                      size: '',
                      color: '',
                      price: 0,
                      countInStock: 0,
                      sku: '',
                      imageVariant: '',
                    })
                  }
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

export default EditProduct;
