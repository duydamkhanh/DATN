import { useFetchProductAll } from '@/data/products/useProductList';
import { toast } from '@medusajs/ui';
import { useEffect, useMemo, useState } from 'react';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import { Autoplay, Navigation, Pagination } from 'swiper/modules';
import { Swiper, SwiperSlide } from 'swiper/react';
import CurrencyVND from '@/components/config/vnd';
import { Link } from '@tanstack/react-router';
import instance from '@/api/axiosIntance';
import useProductComments from '@/data/Comment/useCommentList';
import RatingStars from './ui/rating-stars';

const FeaturedProducts = () => {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [listSold, setListSold] = useState([]);

  const { listProduct, loading, error } = useFetchProductAll();

  const productIds = useMemo(() => {
    return listProduct?.map(product => product._id) || [];
  }, [listProduct]);

  const { data: listComment } = useProductComments(productIds);
  const soldProductIds = useMemo(() => {
    return listProduct?.map(product => product._id) || [];
  }, [listProduct]);

  useEffect(() => {
    if (soldProductIds.length > 0) {
      Promise.all(
        soldProductIds.map(id =>
          instance.get(`/order/sold/${id}`).then(res => res.data)
        )
      ).then(data => setListSold(data));
    }
  }, [soldProductIds]);

  useEffect(() => {
    const filterProducts = () => {
      let filtered = listProduct;

      if (selectedCategory) {
        filtered = filtered.filter(
          product => product?.category?._id === selectedCategory
        );
      }

      if (searchTerm) {
        filtered = filtered.filter(product =>
          product.name.toLowerCase().includes(searchTerm.toLowerCase())
        );
      }

      setFilteredProducts(filtered);
    };

    filterProducts();
  }, [selectedCategory, searchTerm, listProduct]);

  const displayedProducts =
    filteredProducts.length > 0
      ? filteredProducts.slice(0, 8)
      : listProduct.slice(0, 8);

  const handleFilterChange = (filtered: Product[]) => {
    setFilteredProducts(filtered);
    if (filtered.length > 0) {
      toast.success('Sản phẩm đã được lọc thành công!');
    } else {
      toast.error('Không tìm thấy sản phẩm phù hợp!');
    }
  };

  return (
    <div>
      <section className="products-carousel container px-[55px]">
        <h2 className="section-title text-uppercase pb-xl-2 mb-xl-4 mb-4 text-center">
          Phiên bản <strong>Giới Hạn</strong>
        </h2>
        <Swiper
          modules={[Navigation, Pagination, Autoplay]} // Import đúng modules
          autoplay={{
            delay: 1000, // Thời gian giữa mỗi lần chuyển slide (1 giây)
            disableOnInteraction: false, // Tiếp tục chạy ngay cả khi người dùng tương tác
          }}
          slidesPerView={4}
          spaceBetween={30}
          breakpoints={{
            320: { slidesPerView: 2, spaceBetween: 14 },
            768: { slidesPerView: 3, spaceBetween: 24 },
            992: { slidesPerView: 4, spaceBetween: 30 },
          }}
          loop={true}
        >
          {displayedProducts.length > 0 ? (
            <div className="row">
              {displayedProducts.slice(0, 8).map(product => {
                const soldData = listSold?.find(
                  item => item.productId === product._id
                );

                const comments = listComment?.[product._id] || []; // Lấy danh sách bình luận của sản phẩm

                const validRatings = comments
                  .filter(
                    comment =>
                      comment.rating !== undefined && comment.rating !== null
                  )
                  .map(comment => comment.rating);

                const averageRating =
                  validRatings.length > 0
                    ? validRatings.reduce((sum, rating) => sum + rating, 0) /
                      validRatings.length
                    : 0;

                return (
                  <SwiperSlide
                    key={product._id}
                    className="swiper-slide product-card"
                  >
                    <div className="product-card-wrapper">
                      <div className="product-card rounded-lg border bg-white shadow-2xl">
                        <div className="pc__img-wrapper">
                          <Link
                            to={`/${product.slug ? product.slug : product._id}/quickviewProduct`}
                          >
                            <img
                              loading="lazy"
                              src={product.image}
                              width={330}
                              height={400}
                              alt={product.name}
                              className="pc__img"
                            />
                            {product.gallery?.[0] && (
                              <img
                                loading="lazy"
                                src={product.gallery[0]}
                                width={330}
                                height={400}
                                alt={product.name}
                                className="pc__img pc__img-second"
                              />
                            )}
                          </Link>
                        </div>
                        <div className="pc__info position-relative px-3">
                          <h6 className="cart-drawer-item__title fw-normal flex justify-between text-black">
                            <RatingStars rating={averageRating} />
                            <div className="mt-1">
                              <span>Đã bán</span>
                              <span className="ml-1">
                                {' '}
                                {soldData
                                  ? `${soldData.soldQuantity}`
                                  : 'Chưa bán'}
                              </span>
                            </div>
                          </h6>
                          <Link
                            className="text-xl"
                            to={`/${product.slug ? product.slug : product._id}/quickviewProduct`}
                          >
                            {product.name.length > 30
                              ? product.name.slice(0, 20) + '...'
                              : product.name}
                          </Link>
                          <div className="product-card__price d-flex">
                            <span className="money price flex gap-2 font-semibold text-red-500">
                              <CurrencyVND amount={product.price} />
                              <p className="mt-0.5 text-[12px] font-normal text-gray-400 line-through">
                                <CurrencyVND amount={product.originalPrice} />
                              </p>
                            </span>
                          </div>
                          <div className="mb-3 flex justify-between">
                            <div className="mt-2 flex items-center">
                              {[
                                ...new Set(
                                  product.variants.map(variant => variant.color)
                                ), // Loại bỏ màu trùng
                              ]
                                .slice(0, 4) // Giới hạn 4 màu hiển thị
                                .map((color, index) => (
                                  <div
                                    key={index}
                                    className="h-4 w-4 cursor-pointer rounded-full border border-gray-300"
                                    style={{ backgroundColor: color }}
                                  ></div>
                                ))}

                              {new Set(
                                product.variants.map(variant => variant.color)
                              ).size > 4 && (
                                <span className="text-sm font-semibold text-gray-600">
                                  +
                                  {new Set(
                                    product.variants.map(
                                      variant => variant.color
                                    )
                                  ).size - 4}
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-1">
                              {[
                                ...new Set(
                                  product.variants.map(variant => variant.size)
                                ), // Loại bỏ size trùng
                              ]
                                .slice(0, 3) // Giới hạn 3 size
                                .map((size, index) => (
                                  <div
                                    key={index}
                                    className="cursor-pointer rounded-sm border border-gray-300 px-[4px] py-[1px] text-xs"
                                  >
                                    {size}
                                  </div>
                                ))}

                              {new Set(
                                product.variants.map(variant => variant.size)
                              ).size > 3 && (
                                <span className="ml-1 text-sm font-semibold text-gray-600">
                                  +
                                  {new Set(
                                    product.variants.map(
                                      variant => variant.size
                                    )
                                  ).size - 3}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </SwiperSlide>
                );
              })}
            </div>
          ) : (
            !loading && <p>Không tìm thấy sản phẩm nào.</p>
          )}
        </Swiper>
      </section>
      <div className="mb-xl-5 pb-xl-5 mb-3 pb-1" />
    </div>
  );
};

export default FeaturedProducts;
