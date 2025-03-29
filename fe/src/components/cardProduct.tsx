import useCartMutation from '@/data/cart/useCartMutation';
import {
  useFetchCategory,
  useFetchCategoryShow,
  useFetchProductAll,
} from '@/data/products/useProductList';
import { ShoppingCartSolid } from '@medusajs/icons';
import { toast } from '@medusajs/ui';
import { Link, useNavigate } from '@tanstack/react-router';
import React, { useEffect, useMemo, useState } from 'react';
import CurrencyVND from '@/components/config/vnd';
import instance from '@/api/axiosIntance';
import useProductComments from '@/data/Comment/useCommentList';
import RatingStars from './ui/rating-stars';

const CardProduct: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [listSold, setListSold] = useState([]);
  // const [listComment, setListComment] = useState([]);

  const { addItemToCart } = useCartMutation();
  const navigate = useNavigate();

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
  const { data: categories } = useFetchCategoryShow();

  const handleAddToCart = (product: Product) => {
    const userId = localStorage.getItem('userId') ?? '';
    if (!userId) {
      console.error('User ID is missing');
      return;
    }

    addItemToCart.mutate({
      userId: userId,
      products: [
        {
          productId: product._id,
          variantId: product.variantId ?? '',
          quantity: 1,
        },
      ],
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

  return (
    <div>
      <section className="products-grid container px-[55px]">
        <h2 className="section-title text-uppercase mb-md-3 pb-xl-2 mb-xl-4 mb-1 text-center">
          {' '}
          <strong>Sản phẩm </strong>
          Hợp thời trang
        </h2>
        <ul
          className="nav nav-tabs text-uppercase justify-content-center mb-3"
          id="collections-tab"
          role="tablist"
        >
          <li className="nav-item" role="presentation">
            <a
              onClick={() => setSelectedCategory(null)}
              className="nav-link nav-link_underscore active"
              id="collections-tab-1-trigger"
              data-bs-toggle="tab"
              href="#collections-tab-1"
              role="tab"
              aria-controls="collections-tab-1"
              aria-selected="true"
            >
              Tất cả
            </a>
          </li>
          {categories?.map((category: { _id: string; name: string }) => (
            <li className="nav-item" role="presentation">
              <a
                key={category._id}
                onClick={e => {
                  e.preventDefault();
                  setSelectedCategory(category._id);
                }}
                className={`nav-link nav-link_underscore ${selectedCategory === category._id}`}
                id="collections-tab-2-trigger"
                data-bs-toggle="tab"
                href="#collections-tab-2"
                role="tab"
                aria-controls="collections-tab-2"
                aria-selected="true"
              >
                {' '}
                {category.name}
              </a>
            </li>
          ))}
        </ul>

        <div className="tab-content pt-2" id="collections-tab-content">
          {/* ALL */}
          <div
            className="tab-pane fade show active"
            id="collections-tab-1"
            role="tabpanel"
            aria-labelledby="collections-tab-1-trigger"
          >
            {displayedProducts.length > 0 ? (
              <div className="row">
                {displayedProducts.slice(0, 8).map((product: Product) => {
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
                      className="col-12 col-md-6 col-lg-3 mb-4"
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
                                    product.variants.map(
                                      variant => variant.color
                                    )
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
                                    product.variants.map(
                                      variant => variant.size
                                    )
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
            ) : (
              !loading && <p>Không tìm thấy sản phẩm nào.</p>
            )}

            <div className="mt-2 text-center">
              <Link
                className="btn-link btn-link_lg default-underline text-uppercase fw-medium"
                to="/shop"
              >
                Xem thêm
              </Link>
            </div>
          </div>
          <div
            className="tab-pane fade show"
            id="collections-tab-2"
            role="tabpanel"
            aria-labelledby="collections-tab-2-trigger"
          >
            {displayedProducts.length > 0 ? (
              <div className="row">
                {displayedProducts.slice(0, 8).map((product: Product) => {
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
                      className="col-12 col-md-6 col-lg-3 mb-4"
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
                                    product.variants.map(
                                      variant => variant.color
                                    )
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
                                    product.variants.map(
                                      variant => variant.size
                                    )
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
            ) : (
              !loading && <p>Không tìm thấy sản phẩm nào.</p>
            )}
            <div className="mt-2 text-center">
              <Link
                className="btn-link btn-link_lg default-underline text-uppercase fw-medium"
                to="/shop"
              >
                Xem thêm
              </Link>
            </div>
          </div>
          {/* /.tab-pane fade show*/}
        </div>
        {/* /.tab-content pt-2 */}
      </section>
      {/* /.products-grid */}
      <div className="mb-xl-5 pb-xl-5 mb-3 pb-1" />
    </div>
  );
};

export default CardProduct;
