import CurrencyVND from '@/components/config/vnd';
import ErrorCart from '@/components/errors/error-cart';
import LoginCart from '@/components/errors/error-login-cart';
import { useCart } from '@/data/cart/useCartLogic';
import { toast } from '@medusajs/ui';
import { createFileRoute, Link, useNavigate } from '@tanstack/react-router';
import { useState } from 'react';

export const Route = createFileRoute('/_layout/cart/')({
  component: Cart,
});

function Cart() {
  const navigate = useNavigate();
  const userId = localStorage.getItem('userId');
  const [shippingMessageDisplay, setShippingMessageDisplay] = useState('');
  if (!userId) {
    return <LoginCart />;
  }

  const {
    cartData,
    isLoading,
    quantities,
    selectedProducts,
    selectAll,
    handleQuantityChange,
    incrementQuantity,
    decrementQuantity,
    productPrice,
    handleDeleteSelectedProducts,
    toggleSelectProduct,
    toggleSelectAll,
    totalSelectedPrice,
    getSelectedItems,
    listProduct,
  } = useCart(userId);

  if (isLoading) {
    return <div>Đang tải...</div>;
  }

  if (!cartData || !cartData.products || cartData.products.length === 0) {
    return <ErrorCart />;
  }

  const handleCheckout = () => {
    const selectedItems = getSelectedItems() || [];
    if (selectedItems.length === 0) {
      toast.error('Vui lòng chọn ít nhất một sản phẩm để thanh toán.');
      return;
    }
    navigate({
      to: '/checkoutNew',
      state: { selectedItems },
    });
  };

  const getImageSrc = variantId => {
    // Tìm sản phẩm chứa biến thể có sku trùng với variantId
    const productWithVariant = listProduct.find(product =>
      product.variants?.some(
        variant => String(variant.sku) === String(variantId)
      )
    );

    // Tìm chính xác biến thể trong sản phẩm đó
    const matchedVariant = productWithVariant?.variants?.find(
      variant => String(variant.sku) === String(variantId)
    );

    return matchedVariant?.imageVariant || 'path_to_default_image.jpg';
  };

  return (
    <div className="px-[40px]">
      <main>
        <div className="mb-4 pb-4" />
        <section className="shop-checkout container">
          <h2 className="page-title">Giỏ hàng</h2>
          <hr />
          <div className="shopping-cart">
            <div className="cart-table__wrapper">
              <table className="cart-table">
                <thead>
                  <tr>
                    <th>Sản Phẩm</th>
                    <th />
                    <th>Giá</th>
                    <th>Số Lượng</th>
                    <th>Tổng</th>
                    <th className="flex w-[85px] items-center justify-start gap-2">
                      <div>tất cả</div>
                      <input
                        className="h-4 w-4"
                        type="checkbox"
                        checked={selectAll}
                        onChange={toggleSelectAll}
                      />
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {cartData?.products?.map((product, index) => (
                    <tr key={product.productId}>
                      <td>
                        <div className="shopping-cart__product-item">
                          <a href="product1_simple.html">
                            <img
                              loading="lazy"
                              src={getImageSrc(product.variantId)}
                              width={120}
                              height={120}
                            />
                          </a>
                        </div>
                      </td>
                      <td>
                        <div className="shopping-cart__product-item__detail">
                          <h4>
                            <Link to="/" className="capitalize">
                              <h6 className="cart-drawer-item__title fw-normal text-black">
                                {product.name.length > 15
                                  ? product.name.slice(0, 15) + '...'
                                  : product.name}
                              </h6>
                            </Link>
                          </h4>
                          <ul className="shopping-cart__product-item__options">
                            <li>Color: {product.color || 'Không có'}</li>
                            <li>Size: {product.size || 'Không có'}</li>
                          </ul>
                        </div>
                      </td>
                      <td>
                        <span className="shopping-cart__product-price">
                          <CurrencyVND amount={productPrice(index)} />
                        </span>
                      </td>
                      <td>
                        {(() => {
                          // Lấy số lượng tồn kho của sản phẩm
                          const countInStock =
                            listProduct
                              ?.find(p =>
                                p.variants?.some(
                                  v => v.sku === product.variantId
                                )
                              )
                              ?.variants.find(v => v.sku === product.variantId)
                              ?.countInStock ?? 0;

                          // Lấy số lượng hiện tại của sản phẩm trong giỏ hàng
                          const currentQuantity =
                            quantities[index] || product.quantity;

                          return (
                            <>
                              <div className="qty-control position-relative">
                                <input
                                  type="number"
                                  name="quantity"
                                  value={currentQuantity}
                                  onChange={e =>
                                    handleQuantityChange(
                                      index,
                                      Number(e.target.value)
                                    )
                                  }
                                  min={1}
                                  max={countInStock}
                                  className="qty-control__number text-center"
                                />
                                <div
                                  className="qty-control__reduce"
                                  onClick={() =>
                                    currentQuantity > 1 &&
                                    decrementQuantity(index)
                                  }
                                  style={{
                                    opacity: currentQuantity > 1 ? 1 : 0.5,
                                    pointerEvents:
                                      currentQuantity > 1 ? 'auto' : 'none',
                                  }}
                                >
                                  -
                                </div>
                                <div
                                  className="qty-control__increase"
                                  onClick={() =>
                                    currentQuantity < countInStock &&
                                    incrementQuantity(index)
                                  }
                                  style={{
                                    opacity:
                                      currentQuantity < countInStock ? 1 : 0.5,
                                    pointerEvents:
                                      currentQuantity < countInStock
                                        ? 'auto'
                                        : 'none',
                                  }}
                                >
                                  +
                                </div>
                              </div>
                              <div className="mt-1 text-sm text-gray-500">
                                Còn lại: {countInStock ?? 'Không xác định'} sản
                                phẩm
                              </div>
                            </>
                          );
                        })()}
                      </td>

                      <td>
                        <span className="shopping-cart__subtotal w-36">
                          <CurrencyVND
                            amount={
                              (quantities[index] || product.quantity) *
                              productPrice(index)
                            }
                          />
                        </span>
                      </td>
                      <td className="px-4 py-4 text-center">
                        <input
                          className="h-4 w-4"
                          type="checkbox"
                          checked={selectedProducts[index] || false}
                          onChange={() => toggleSelectProduct(index)}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="mt-2 flex justify-end">
                <button
                  className="btn btn-light"
                  onClick={handleDeleteSelectedProducts}
                >
                  Xóa
                </button>
                {/* <button className="btn btn-light">Chọn tất cả({cartData?.products?.length || 0})</button> */}
              </div>
            </div>
            <div className="shopping-cart__totals-wrapper">
              <div className="sticky-content">
                <div className="shopping-cart__totals">
                  <h3>Tổng Giỏ Hàng</h3>
                  <table className="cart-totals">
                    <tbody>
                      <tr className="">
                        <th>Tổng thanh toán (VND): </th>
                        <div className="text-2xl">
                          <CurrencyVND amount={totalSelectedPrice || '0'} />
                        </div>
                      </tr>
                    </tbody>
                  </table>
                  <tr>
                    <li className="mt-2">
                      Phí vận chuyển được tính ở trang thanh toán
                    </li>
                  </tr>
                  <tr>
                    <li>Áp mã giảm giá ở trang thanh toán</li>
                  </tr>
                </div>
                <div className="mobile_fixed-btn_wrapper">
                  <div className="button-wrapper container">
                    <button
                      className="btn btn-primary btn-checkout text-xl font-semibold uppercase"
                      onClick={handleCheckout}
                    >
                      Thanh toán
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
      <div className="pb-xl-5 mb-5" />
    </div>
  );
}

export default Cart;
