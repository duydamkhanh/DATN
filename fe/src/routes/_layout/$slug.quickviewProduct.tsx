import instance from '@/api/axiosIntance';
import ChatBot from '@/components/ChatBot';
import CurrencyVND from '@/components/config/vnd';
import FeaturedProducts from '@/components/featuredProducts';
import { useCart } from '@/data/cart/useCartLogic';
import useCommentMutation from '@/data/Comment/useCommentMutation';
import { useFetchCategory } from '@/data/products/useProductList';
import { useSocket } from '@/data/socket/useSocket';
import {
  EllipsisHorizontal,
  EyeMini,
  ShoppingCart,
  StarSolid,
  Trash,
} from '@medusajs/icons';
import { DropdownMenu, IconButton, toast } from '@medusajs/ui';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { createFileRoute, useParams } from '@tanstack/react-router';
import { useEffect, useState } from 'react';

export const Route = createFileRoute('/_layout/$slug/quickviewProduct')({
  component: DetailProduct,
});

function DetailProduct() {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const { data: categories } = useFetchCategory();
  const [currentImage, setCurrentImage] = useState('');
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [availableColors, setAvailableColors] = useState([]);
  const [quantity, setQuantity] = useState(1);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const { createComment, removeComment } = useCommentMutation();
  const [rating, setRating] = useState(0); // State for product rating
  const [averageRating, setAverageRating] = useState(0);

  const { slug } = useParams({ from: '/_layout/$slug/quickviewProduct' });
  const queryClient = useQueryClient();
  const socket = useSocket();
  // Fetch product information from API
  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true);
      try {
        const response = await instance.get(`/products/slug/${slug}`);
        if (response.data && response.data.product) {
          setProduct(response.data.product);
          setCurrentImage(response.data.product.image);
        } else {
          throw new Error('Dữ liệu sản phẩm không có');
        }
      } catch (err) {
        setError('Có lỗi khi lấy sản phẩm');
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();

    const handleCartUpdate = async () => {
      await fetchProduct();
    };

    socket.on('update-cart', handleCartUpdate);

    return () => {
      socket.off('update-cart', handleCartUpdate);
    };
  }, [slug]);

  useEffect(() => {
    if (product) {
      const fetchComments = async () => {
        try {
          const response = await instance.get(
            `/comments/product/${product._id}`
          );
          setComments(response.data);
          const totalRating = response.data.reduce(
            (sum, comment) => sum + comment.rating,
            0
          );
          const average = totalRating / response.data.length;
          setAverageRating(average); // Cập nhật số sao trung bình
        } catch (err) {}
      };
      fetchComments();
    }
  }, [product]);
  useEffect(() => {
    if (window.location.hash === '#comments-section') {
      const commentsSection = document.getElementById('comments-section');
      if (commentsSection) {
        commentsSection.scrollIntoView({ behavior: 'smooth' });
      }
    }
  }, [slug]); // Ensure this effect runs when the component mounts

  useEffect(() => {
    if (window.location.hash === '#comments-section') {
      const commentTextarea = document.querySelector('textarea');
      if (commentTextarea) {
        commentTextarea.focus(); // Focus the textarea
      }
    }
  }, [product]); // Trigger when product data is available

  // Mutation to add item to cart
  const addItemToCart = useMutation({
    mutationFn: data => instance.post('/cart/add-to-cart', data),
    onSuccess: () => {
      toast.success('Đã thêm sản phẩm vào giỏ hàng', {
        duration: 100,
      });
      queryClient.invalidateQueries(['cart']);
    },
    onError: error => {
      if (error.response) {
        toast.warning(`Không thể thêm vào giỏ hàng!`, {
          description: 'Bạn cần đăng nhập để thêm vào giỏ hàng.',
          duration: 1000,
        });
      }
    },
  });

  const handleSizeChange = size => {
    setSelectedSize(size); // Cập nhật kích cỡ được chọn
    setSelectedColor(''); // Reset màu khi thay đổi kích cỡ

    if (!product || !product.variants) return;

    const availableColors = product.variants
      .filter(variant => variant.size === size)
      .map(variant => variant.color);

    setAvailableColors([...new Set(availableColors)]); // Loại bỏ trùng lặp
  };

  if (
    product &&
    product.variants &&
    product.variants.length > 0 &&
    !selectedSize
  ) {
    handleSizeChange(product.variants[0].size);
  }
  const userId = localStorage.getItem('userId'); // Lấy userId từ localStorage

  const { cartData, isLoading } = useCart(userId);

  const handleAddToCart = () => {
    if (!selectedSize || !selectedColor) {
      toast.warning(
        !selectedSize ? 'Vui lòng chọn Size!' : 'Vui lòng chọn Màu!'
      );
      return;
    }

    // Lấy số lượng từ state (ô input)
    const selectedQuantity = quantity;

    // Tìm biến thể trong danh sách sản phẩm
    const variant = product?.variants?.find(
      v => v.size === selectedSize && v.color === selectedColor
    );

    if (!variant) {
      toast.warning(
        'Không tìm thấy biến thể sản phẩm với size và màu đã chọn.'
      );
      return;
    }

    if (!product?._id || !variant?.sku) {
      toast.warning('Thông tin sản phẩm không hợp lệ.');
      return;
    }

    // Kiểm tra nếu số lượng chọn lớn hơn tồn kho
    if (variant.countInStock === 0 || selectedQuantity > variant.countInStock) {
      toast.warning(
        variant.countInStock === 0
          ? 'Mã hàng này đã hết, vui lòng thử lại sau hoặc chọn mã khác!'
          : `Chỉ có thể thêm tối đa ${variant.countInStock} sản phẩm vào giỏ hàng!`
      );
      return;
    }

    // Kiểm tra sản phẩm đã có trong giỏ hàng chưa
    const variantInCart = cartData?.products?.find(
      v => v.variantId === variant.sku
    );

    // Số lượng hiện tại trong giỏ hàng
    const quantityInCart = variantInCart ? variantInCart.quantity : 0;

    // Số lượng mới sau khi thêm vào giỏ hàng
    const newQuantity = quantityInCart + selectedQuantity;

    // Kiểm tra nếu số lượng tổng cộng vượt quá tồn kho
    if (newQuantity > variant.countInStock) {
      toast.warning(
        `Bạn chỉ có thể thêm tối đa ${variant.countInStock} sản phẩm của mã này vào giỏ hàng.`
      );
      return;
    }

    // Gửi dữ liệu lên server
    addItemToCart.mutate({
      userId: localStorage.getItem('userId'),
      products: [
        {
          productId: String(product._id),
          variantId: String(variant.sku),
          quantity: selectedQuantity,
          priceAtTime: Number(variant.price) || 0,
        },
      ],
    });
  };

  const handleDeleteComment = (commentId: string) => {
    removeComment.mutate(commentId);
  };

  // Display loading or error if any
  if (loading) return <div>Đang tải...</div>;
  if (error) return <div>{error}</div>;

  // Generate unique sizes from product variants
  const uniqueSizes = [
    ...new Set(product.variants.map(variant => variant.size)),
  ];
  const sendMessageToAdmin = async () => {
    try {
      const userId = localStorage.getItem('userId'); // Lấy userId từ localStorage
      if (!userId) {
        toast.error('Không tìm thấy thông tin người dùng.');
        return;
      }

      const messageContent = `Tôi cần hỗ trợ về hướng dẫn kích cỡ cho sản phẩm ${product.name}`;
      await instance.post('/chat', {
        message: messageContent,
        userId,
      });
    } catch (error) {
      toast.error('Không thể gửi yêu cầu, vui lòng thử lại.');
    }
  };

  const category = categories?.find(cat => cat._id === product.category);

  const selectedVariant = product.variants.find(
    variant => variant.size === selectedSize && variant.color === selectedColor
  );

  const countInStock = selectedVariant ? selectedVariant.countInStock : 0;

  const handleInputChange = e => {
    const inputValue = e.target.value;

    if (!/^\d*$/.test(inputValue)) return;

    const newValue =
      inputValue === ''
        ? ''
        : Math.max(1, Math.min(countInStock, Number(inputValue)));

    if (Number(inputValue) > countInStock) {
      toast.warning(`Chỉ còn ${countInStock} sản phẩm trong kho!`, {
        duration: 1000,
      });
    }

    setQuantity(newValue);
  };

  const selectedVariants = product.variants.find(
    v => v.size === selectedSize && v.color === selectedColor
  );

  return (
    <div>
      <div>
        <main>
          <div className="mb-md-1 pb-md-3" />
          <section className="product-single container px-[55px]">
            <div className="row">
              <div className="col-lg-7">
                <div className="flex flex-col gap-5 lg:flex-row">
                  {/* Thumbnails section */}
                  <div className="flex sm:flex-row md:flex-row lg:flex-col">
                    <img
                      alt="Main Product"
                      className="h-20 w-28 cursor-pointer rounded-lg border border-white object-cover p-1 hover:border-black hover:opacity-75"
                      src={product.image}
                      onClick={() => setCurrentImage(product.image)}
                      onMouseEnter={() => setCurrentImage(product.image)}
                    />
                    {product.gallery &&
                      product.gallery.map((img, index) => (
                        <img
                          key={index}
                          alt={`Thumbnail ${index + 1}`}
                          className="h-20 w-28 cursor-pointer rounded-lg border border-white object-cover p-1 hover:border-black hover:opacity-75"
                          src={img}
                          onClick={() => setCurrentImage(img)}
                          onMouseEnter={() => setCurrentImage(img)}
                        />
                      ))}
                  </div>
                  {/* Main product image */}
                  <div className="">
                    <div className="mb-4">
                      <img
                        src={currentImage || product.image}
                        width={600}
                        height={300}
                        alt="Product"
                        className="rounded-lg bg-slate-400 object-cover shadow-lg"
                      />
                    </div>
                  </div>
                </div>
              </div>
              <div className="col-lg-5">
                <div className="d-flex justify-content-between pb-md-2 mb-4">
                  <div className="breadcrumb d-none d-md-block flex-grow-1 mb-0">
                    <a
                      href="#"
                      className="menu-link menu-link_us-s text-uppercase fw-medium"
                    >
                      Trang Chủ
                    </a>
                    <span className="breadcrumb-separator menu-link fw-medium pe-1 ps-1">
                      /
                    </span>
                    <a
                      href="#"
                      className="menu-link menu-link_us-s text-uppercase fw-medium"
                    >
                      Chi tiết
                    </a>
                  </div>
                  {/* /.breadcrumb */}
                  <div className="product-single__prev-next d-flex align-items-center justify-content-between justify-content-md-end flex-grow-1">
                    <a href="#" className="text-uppercase fw-medium disabled">
                      <svg
                        className="mb-1px"
                        width={10}
                        height={10}
                        viewBox="0 0 25 25"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <use href="#icon_prev_md" />
                      </svg>
                      <span className="menu-link menu-link_us-s">Quay lại</span>
                    </a>
                    <a
                      href="product2_variable.html"
                      className="text-uppercase fw-medium"
                    >
                      <span className="menu-link menu-link_us-s">TIếp</span>
                      <svg
                        className="mb-1px"
                        width={10}
                        height={10}
                        viewBox="0 0 25 25"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <use href="#icon_next_md" />
                      </svg>
                    </a>
                  </div>
                  {/* /.shop-acs */}
                </div>
                <h1 className="product-single__name">{product.name}</h1>
                <div className="product-single__rating flex gap-2">
                  <div className="reviews-group d-flex gap-1">
                    {[...Array(5)].map((_, index) => (
                      <StarSolid
                        key={index}
                        className={`h-5 w-5 ${index < Math.floor(averageRating) ? 'text-yellow-400' : 'text-gray-300'}`}
                      />
                    ))}
                    <span className="font-semibold">
                      {averageRating.toFixed(1)} trên tổng {comments.length}{' '}
                      Bình luận
                    </span>
                  </div>
                </div>
                {/* test */}
                <div className="product-single__price">
                  <CurrencyVND
                    amount={
                      selectedVariants ? selectedVariants.price : product.price
                    }
                  />
                  <div className="flex text-[13px] font-normal">
                    <EyeMini />{' '}
                    <span className="mr-1 font-medium">
                      {product.viewCount}
                    </span>{' '}
                    người đang xem sản phẩm này
                  </div>
                </div>

                <div className="product-single__short-desc">
                  <p>{product.description}</p>
                </div>
                <form name="" method="" onSubmit={e => e.preventDefault()}>
                  <div className="product-single__swatches">
                    <div className="product-swatch text-swatches">
                      <label>Kích cỡ</label>
                      <div className="swatch-list">
                        {uniqueSizes.map(size => (
                          <button
                            key={size}
                            type="button"
                            onClick={() => handleSizeChange(size)}
                            className={`rounded-xl border px-3 py-2 transition-all duration-200 ${
                              selectedSize === size
                                ? 'border-black bg-black text-white'
                                : 'border-gray-300 bg-white text-gray-700 hover:border-black'
                            }`}
                            style={{
                              borderColor:
                                selectedSize === size ? 'black' : undefined,
                            }}
                          >
                            {size}
                          </button>
                        ))}
                      </div>
                      <a
                        className="sizeguide-link"
                        data-bs-toggle="modal"
                        data-bs-target="#sizeGuide"
                        onClick={e => {
                          e.preventDefault();
                          sendMessageToAdmin();
                        }}
                      >
                        Hướng dẫn kích cỡ
                      </a>
                    </div>

                    <div className="product-swatch color-swatches h-10">
                      <label>Màu</label>
                      <div className="swatch-list">
                        {availableColors.map(color => (
                          <button
                            key={color}
                            type="button"
                            onClick={() => setSelectedColor(color)}
                            className={`h-8 w-8 rounded-full border focus:outline-none ${
                              selectedColor === color
                                ? 'border-black ring-1 ring-black'
                                : 'border-gray-700'
                            }`}
                            style={{
                              backgroundColor: color,
                              // boxShadow:
                              //   selectedColor === color
                              //     ? '0 0 10px rgba(0, 0, 0, 0.8)'
                              //     : 'none',
                            }}
                            disabled={!selectedSize}
                          ></button>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="product-single__addtocart">
                    <p>Số lượng</p>
                    <div className="qty-control position-relative">
                      <input
                        type="number"
                        name="quantity"
                        min={1}
                        max={countInStock}
                        value={quantity}
                        onChange={handleInputChange}
                        className="qty-control__number text-center"
                      />
                      <div
                        className="qty-control__reduce"
                        onClick={() =>
                          setQuantity(prev => Math.max(1, prev - 1))
                        }
                        style={{
                          opacity: quantity > 1 ? 1 : 0.5,
                          pointerEvents: quantity > 1 ? 'auto' : 'none',
                        }}
                      >
                        -
                      </div>
                      <div
                        className="qty-control__increase"
                        onClick={() =>
                          setQuantity(prev => Math.min(countInStock, prev + 1))
                        }
                        style={{
                          opacity: quantity < countInStock ? 1 : 0.5,
                          pointerEvents:
                            quantity < countInStock ? 'auto' : 'none',
                        }}
                      >
                        +
                      </div>
                    </div>

                    {selectedSize && selectedColor && (
                      <div className="meta-item flex items-center gap-2">
                        <div className="flex gap-2 text-[17px] font-normal">
                          {countInStock}
                        </div>
                        <label>Sản phẩm có sẵn</label>
                      </div>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={e => {
                      e.preventDefault(); // Ngừng hành động mặc định của form
                      handleAddToCart(); // Gọi hàm thêm sản phẩm vào giỏ hàng
                    }}
                    disabled={addItemToCart.isLoading}
                    className="btn btn-primary btn-addtocart js-open-aside mb-4 flex gap-4"
                    data-aside="cartDrawer"
                  >
                    <ShoppingCart />
                    {addItemToCart.isLoading
                      ? 'Đang thêm...'
                      : 'Thêm vào giỏ hàng'}
                  </button>
                </form>
                {/*test   */}
                <div className="product-single__addtolinks">
                  <a
                    href="#"
                    className="menu-link menu-link_us-s add-to-wishlist"
                  >
                    <svg
                      width={16}
                      height={16}
                      viewBox="0 0 20 20"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <use href="#icon_heart" />
                    </svg>
                    <span className="mt-2">Danh sách yêu thích</span>
                  </a>
                  <share-button className="share-button">
                    <button className="menu-link menu-link_us-s to-share d-flex align-items-center border-0 bg-transparent">
                      <svg
                        width={16}
                        height={19}
                        viewBox="0 0 16 19"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <use href="#icon_sharing" />
                      </svg>
                      <span>Chia sẻ</span>
                    </button>
                    <details
                      id="Details-share-template__main"
                      className="m-1 xl:m-1.5"
                      hidden
                    >
                      <summary className="btn-solid m-1 px-5 pb-3 pt-3.5 xl:m-1.5">
                        +
                      </summary>
                      <div
                        id="Article-share-template__main"
                        className="share-button__fallback bg-container shadow-theme absolute left-0 top-full z-10 flex w-full items-center border-t px-2 py-4"
                      >
                        <div className="field mr-4 grow">
                          <label className="field__label sr-only" htmlFor="url">
                            Link
                          </label>
                          <input
                            type="text"
                            className="field__input w-full"
                            id="url"
                            defaultValue="https://uomo-crystal.myshopify.com/blogs/news/go-to-wellness-tips-for-mental-health"
                            placeholder="Link"
                            onclick="this.select();"
                            readOnly
                          />
                        </div>
                        <button className="share-button__copy no-js-hidden">
                          <svg
                            className="icon icon-clipboard mr-1 inline-block"
                            width={11}
                            height={13}
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                            aria-hidden="true"
                            focusable="false"
                            viewBox="0 0 11 13"
                          >
                            <path
                              fillRule="evenodd"
                              clipRule="evenodd"
                              d="M2 1a1 1 0 011-1h7a1 1 0 011 1v9a1 1 0 01-1 1V1H2zM1 2a1 1 0 00-1 1v9a1 1 0 001 1h7a1 1 0 001-1V3a1 1 0 00-1-1H1zm0 10V3h7v9H1z"
                              fill="currentColor"
                            />
                          </svg>
                          <span className="sr-only">Copy link</span>
                        </button>
                      </div>
                    </details>
                  </share-button>
                </div>
                <div className="product-single__meta-info">
                  <div className="meta-item">
                    <label>SKU:</label>
                    <span>N/A</span>
                  </div>
                  <div className="meta-item flex items-center gap-2">
                    <label>Danh mục:</label>
                    <div className="flex gap-2">
                      {/* {categories?.map(
                        (category: { _id: string; name: string }) => (
                          <div
                            key={category._id}  
                            onClick={e => {
                              e.preventDefault();
                              setSelectedCategory(category._id); // Gọi hàm để cập nhật danh mục
                            }}
                            className={`${selectedCategory === category._id ? 'border-b-2' : ''}`}
                          >
                            <a href="#" className="menu-link menu-link_us-s">
                              {category.name}
                            </a>
                          </div>
                        )
                      )} */}
                      {category?.name || 'Không có danh mục'}
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="product-single__details-tab">
              <ul className="nav nav-tabs" id="myTab" role="tablist">
                <li className="nav-item" role="presentation">
                  <a
                    className="nav-link nav-link_underscore active"
                    id="tab-description-tab"
                    data-bs-toggle="tab"
                    href="#tab-description"
                    role="tab"
                    aria-controls="tab-description"
                    aria-selected="true"
                  >
                    Mô tả chi tiết
                  </a>
                </li>
                <li className="nav-item" role="presentation">
                  <a
                    className="nav-link nav-link_underscore"
                    id="tab-additional-info-tab"
                    data-bs-toggle="tab"
                    href="#tab-additional-info"
                    role="tab"
                    aria-controls="tab-additional-info"
                    aria-selected="false"
                  >
                    Hướng dẫn kích thước
                  </a>
                </li>
                <li className="nav-item" role="presentation">
                  <a
                    className="nav-link nav-link_underscore"
                    id="tab-reviews-tab"
                    data-bs-toggle="tab"
                    href="#tab-reviews"
                    role="tab"
                    aria-controls="tab-reviews"
                    aria-selected="false"
                  >
                    Đánh Giá ({comments.length} )
                  </a>
                </li>
              </ul>
              <div className="tab-content">
                <div
                  className="tab-pane fade show active"
                  id="tab-description"
                  role="tabpanel"
                  aria-labelledby="tab-description-tab"
                >
                  <div className="product-single__description">
                    <div
                      className="mt-5"
                      dangerouslySetInnerHTML={{
                        __html: product.detaildescription,
                      }}
                    />
                  </div>
                </div>
                <div
                  className="tab-pane fade"
                  id="tab-additional-info"
                  role="tabpanel"
                  aria-labelledby="tab-additional-info-tab"
                >
                  <div className="product-single__addtional-info">
                    <div className="item">
                      <label className="h6">Cân nặng</label>
                      <span>1.25 kg</span>
                    </div>
                    <div className="item">
                      <label className="h6">Kích thước</label>
                      <span>90 x 60 x 90 cm</span>
                    </div>
                    <div className="item">
                      <label className="h6">Kích cỡ</label>
                      {uniqueSizes.map(size => (
                        <span className="p-2">{size}</span>
                      ))}
                    </div>
                    <div className="item flex gap-2">
                      <label className="h6">Màu</label>
                      {[
                        ...new Set(
                          product.variants.map(variant => variant.color)
                        ),
                      ].map((color, index) => (
                        <div key={index}>{color}</div>
                      ))}
                    </div>
                  </div>
                </div>
                <div
                  className="tab-pane fade"
                  id="tab-reviews"
                  role="tabpanel"
                  aria-labelledby="tab-reviews-tab"
                >
                  <h2 className="product-single__reviews-title">
                    Đánh giá sản phẩm (
                    {comments.length > 0 ? comments.length : 0})
                  </h2>
                  <div className="product-single__reviews-list">
                    {comments.length > 0 ? (
                      comments.map(comment => (
                        <div className="product-single__reviews-item">
                          <div className="customer-avatar">
                            <img loading="lazy" src="/admin.jpg" />
                          </div>
                          <div className="customer-review w-full">
                            <div className="flex justify-between">
                              <div className="customer-name">
                                <h6>{comment.userId?.username}</h6>
                                <div className="reviews-group d-flex">
                                  {[1, 2, 3, 4, 5].map(star => (
                                    <div key={star}>
                                      {comment.rating >= star ? (
                                        <StarSolid className="text-orange-300" />
                                      ) : (
                                        <StarSolid className="text-orange-200" />
                                      )}
                                    </div>
                                  ))}
                                </div>
                              </div>
                              <DropdownMenu>
                                <DropdownMenu.Trigger asChild>
                                  <IconButton>
                                    <EllipsisHorizontal />
                                  </IconButton>
                                </DropdownMenu.Trigger>
                                <DropdownMenu.Content>
                                  <DropdownMenu.Separator />
                                  <DropdownMenu.Item
                                    className="gap-x-2"
                                    onClick={() =>
                                      handleDeleteComment(comment._id)
                                    }
                                  >
                                    <Trash className="text-ui-fg-subtle" />
                                    Xóa bình luận
                                  </DropdownMenu.Item>
                                </DropdownMenu.Content>
                              </DropdownMenu>
                            </div>

                            <div className="review-date">
                              {new Date(comment.createdAt).toLocaleString(
                                'vi-VN',
                                {
                                  year: 'numeric',
                                  month: '2-digit',
                                  day: '2-digit',
                                  hour: '2-digit',
                                  minute: '2-digit',
                                }
                              )}
                            </div>
                            <div className="review-text">
                              <p>{comment.commentText}</p>
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p>Chưa có bình luận nào</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </section>
        </main>
        <div className="pb-xl-5 mb-5" />
      </div>
      <FeaturedProducts />
    </div>
  );
}

export default DetailProduct;
