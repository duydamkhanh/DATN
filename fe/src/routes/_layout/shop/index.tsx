import instance from '@/api/axiosIntance';
import CurrencyVND from '@/components/config/vnd';
import FilterBar from '@/components/FilterBar';
import useCartMutation from '@/data/cart/useCartMutation';
import {
  useFetchCategory,
  useFetchProductAll,
} from '@/data/products/useProductList';
import { ChevronLeft, ChevronRight } from '@medusajs/icons';
import { createFileRoute, Link } from '@tanstack/react-router';
import { useEffect, useMemo, useState } from 'react';
import anhbanershop from '../../../assets/images/shop/shop_banner_character1.png';
import useProductComments from '@/data/Comment/useCommentList';
import RatingStars from '@/components/ui/rating-stars';
export const Route = createFileRoute('/_layout/shop/')({
  component: Shop,
});

function Shop() {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null); // Thêm trạng thái để theo dõi danh mục được chọn
  const [showFilter, setShowFilter] = useState<boolean>(false);
  const [showSearch, setShowSearch] = useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const { addItemToCart } = useCartMutation();
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [averageRating, setAverageRating] = useState(0);
  const [comments, setComments] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;
  const [product, setProduct] = useState(null);
  const [listSold, setListSold] = useState([]);

  const toggleFilter = () => {
    setShowFilter(!showFilter);
    if (!showFilter) {
      setShowSearch(false); // Tắt Search khi Filter bật
    }
  };

  const toggleSearch = () => {
    setShowSearch(!showSearch);
    if (!showSearch) {
      setShowFilter(false); // Tắt Filter khi Search bật
    }
  };
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

  const { data: categories } = useFetchCategory(); // Lấy danh mục từ API

  const handleAddToCart = (product: Product) => {
    const userId = localStorage.getItem('userId') ?? ''; // Xử lý userId có thể là null
    if (!userId) {
      console.error('User ID is missing');
      return; // Ngăn hành động nếu không có userId
    }

    addItemToCart.mutate({
      userId: userId,
      products: [
        {
          productId: product._id,
          variantId: product.variantId ?? '',
          quantity: 1,
        },
      ], // variantId được thêm nếu có
    });
  };
  useEffect(() => {
    const filterProducts = () => {
      let filtered = listProduct;

      // Lọc theo danh mục nếu có
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
    filteredProducts.length > 0 ? filteredProducts : listProduct;

  const handleFilterChange = (filtered: Product[]) => {
    setFilteredProducts(filtered);
  };

  const totalPages = Math.ceil(displayedProducts.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const ordersToDisplay = displayedProducts.slice(
    startIndex,
    startIndex + itemsPerPage
  );
  const handlePageChange = (newPage: number) => {
    if (newPage > 0 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  return (
    <div>
      <main>
        <div>
          <section className="full-width_padding">
            <div
              className="full-width_border border-2"
              style={{ borderColor: '#eeeeee' }}
            >
              <div className="shop-banner position-relative">
                <div
                  className="background-img"
                  style={{ backgroundColor: '#eeeeee' }}
                >
                  <img
                    loading="lazy"
                    src={anhbanershop}
                    width={1759}
                    height={420}
                    alt="Pattern"
                    className="slideshow-bg__img object-fit-cover"
                  />
                </div>
                <div className="shop-banner__content position-absolute start-50 top-50 translate-middle container">
                  <h2 className="stroke-text h1 smooth-16 text-uppercase fw-bold mb-xl-4 mb-xl-5 mb-3">
                    Thời trang &amp; giá rẻ
                  </h2>
                  <ul className="d-flex list-unstyled text-uppercase h6 flex-wrap">
                    <li
                      onClick={() => setSelectedCategory(null)}
                      className="me-xl-4 me-3 pe-1"
                    >
                      <a className="menu-link menu-link_us-s menu-link_active">
                        Tất Cả
                      </a>
                    </li>
                    {categories?.map(
                      (category: { _id: string; name: string }) => (
                        <li
                          key={category._id}
                          onClick={e => {
                            e.preventDefault();
                            setSelectedCategory(category._id); // Gọi hàm để cập nhật danh mục
                          }}
                          className={`me-xl-4 me-3 pe-1${selectedCategory === category._id ? 'border-b-2' : ''}`}
                        >
                          <a href="#" className="menu-link menu-link_us-s">
                            {category.name}
                          </a>
                        </li>
                      )
                    )}
                  </ul>
                </div>
                {/* /.shop-banner__content */}
              </div>
              {/* /.shop-banner position-relative */}
            </div>
            {/* /.full-width_border */}
          </section>
          {/* /.full-width_padding*/}
          <div className="pb-lg-3 mb-4" />
        </div>

        <section className="shop-main d-flex container px-[55px]">
          <div className="shop-sidebar side-sticky bg-body" id="shopFilter">
            <div className="accordion" id="categories-list">
              <div className="accordion-item mb-4 pb-3">
                <h5 className="accordion-header" id="accordion-heading-11">
                  <button
                    className="accordion-button fs-5 text-uppercase border-0 p-0"
                    type="button"
                    data-bs-toggle="collapse"
                    data-bs-target="#accordion-filter-1"
                    aria-expanded="true"
                    aria-controls="accordion-filter-1"
                  >
                    Danh Mục sản phẩm
                    <svg
                      className="accordion-button__icon type2"
                      viewBox="0 0 10 6"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <g aria-hidden="true" stroke="none" fillRule="evenodd">
                        <path d="M5.35668 0.159286C5.16235 -0.053094 4.83769 -0.0530941 4.64287 0.159286L0.147611 5.05963C-0.0492049 5.27473 -0.049205 5.62357 0.147611 5.83813C0.344427 6.05323 0.664108 6.05323 0.860924 5.83813L5 1.32706L9.13858 5.83867C9.33589 6.05378 9.65507 6.05378 9.85239 5.83867C10.0492 5.62357 10.0492 5.27473 9.85239 5.06018L5.35668 0.159286Z" />
                      </g>
                    </svg>
                  </button>
                </h5>
                <div
                  id="accordion-filter-1"
                  className="accordion-collapse show border-0"
                  aria-labelledby="accordion-heading-11"
                  data-bs-parent="#categories-list"
                >
                  <div className="accordion-body px-0 pb-0 pt-3">
                    <ul className="list list-inline mb-0">
                      <li className="list-item">
                        {categories?.map(
                          (category: { _id: string; name: string }) => (
                            <li
                              key={category._id}
                              onClick={e => {
                                e.preventDefault();
                                setSelectedCategory(category._id); // Gọi hàm để cập nhật danh mục
                              }}
                              className={`me-xl-4 me-3 pe-1${selectedCategory === category._id ? 'border-b-2' : ''}`}
                            >
                              <a href="#" className="menu-link menu-link_us-s">
                                {category.name}
                              </a>
                            </li>
                          )
                        )}
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
              {/* /.accordion-item */}
            </div>
            {/* /.accordion-item */}
            <FilterBar onFilterChange={handleFilterChange} />
            {/* /.accordion */}
          </div>
          {/* /.shop-sidebar */}
          <div className="shop-list flex-grow-1">
            <div className="d-flex justify-content-between pb-md-2 mb-4">
              <div className="breadcrumb d-none d-md-block flex-grow-1 mb-0">
                <a
                  href="#"
                  className="menu-link menu-link_us-s text-uppercase fw-medium"
                >
                  Trang chủ
                </a>
                <span className="breadcrumb-separator menu-link fw-medium pe-1 ps-1">
                  /
                </span>
                <a
                  href="#"
                  className="menu-link menu-link_us-s text-uppercase fw-medium"
                >
                  Cửa hàng
                </a>
              </div>
              {/* /.breadcrumb */}
              {/* /.shop-acs */}
            </div>
            {/* /.d-flex justify-content-between */}
            <div
              className="products-grid row row-cols-2 row-cols-md-3"
              id="products-grid"
            >
              {ordersToDisplay.map((product: Product) => {
                // Tìm dữ liệu số lượng đã bán từ listSold theo product._id
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
                  <div
                    key={product._id}
                    className="col-12 col-md-6 col-lg-4 mb-4"
                  >
                    <div className="product-card-wrapper rounded-lg border bg-white shadow-2xl">
                      <div className="product-card">
                        <div className="pc__img-wrapper">
                          <div className="">
                            <Link
                              to={`/${product.slug ? product.slug : product._id}/quickviewProduct`}
                            >
                              <img
                                loading="lazy"
                                src={product.image}
                                width={330}
                                height={400}
                                alt="Cropped Faux leather Jacket"
                                className="pc__img"
                              />
                              <img
                                loading="lazy"
                                src={product.gallery[0]} // Dùng ảnh đầu tiên từ gallery
                                width={330}
                                height={400}
                                alt="Cropped Faux leather Jacket"
                                className="pc__img pc__img-second"
                              />
                            </Link>
                          </div>
                          {/* <Link
                                to={`/${product.slug ? product.slug : product._id}/quickviewProduct`}
                              >
                                <button
                                  className="pc__atc btn btn-sm anim_appear-bottom btn position-absolute text-uppercase fw-medium border-0"
                                  data-aside="cartDrawer"
                                  title="Chi Tiết"
                                >
                                  Chi Tiết
                                </button>
                              </Link> */}
                        </div>
                        <div className="pc__info position-relative px-3">
                          <h6 className="cart-drawer-item__title fw-normal flex justify-between text-black">
                            <RatingStars rating={averageRating} />
                            <div className="mt-0.5">
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
                  </div>
                );
              })}
            </div>
            {/* /.products-grid row */}
            <div className="mt-8 flex items-center justify-center space-x-2">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                className="rounded-md border px-2 py-1.5 text-gray-400"
                disabled={currentPage === 1}
              >
                <ChevronLeft />
              </button>

              <p className="mx-2 rounded-lg border-[1px] border-blue-400 px-3 py-1.5 text-blue-400">
                {currentPage}
              </p>

              <button
                onClick={() => handlePageChange(currentPage + 1)}
                className="rounded-md border px-2 py-1.5 text-gray-400"
                disabled={currentPage === totalPages}
              >
                <ChevronRight />
              </button>
            </div>
          </div>
        </section>
        {/* /.shop-main container */}
      </main>
      <div className="pb-xl-5 mb-5" />
    </div>
  );
}
