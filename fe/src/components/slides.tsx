import 'swiper/css';
import 'swiper/css/pagination';
import { Autoplay, EffectFade, Navigation, Pagination } from 'swiper/modules';
import { Swiper, SwiperSlide } from 'swiper/react';
import slide1 from '../assets/images/slider1.jpg';
import slide2 from '../assets/images/slider2.jpg';
import slide3 from '../assets/images/slider3.jpg';
import { Link } from '@tanstack/react-router';
const Slides = () => {
  return (
    <div className="px-[55px]">
      <section className="swiper-container slideshow full-width_padding">
        <Swiper
          modules={[Navigation, Pagination, Autoplay, EffectFade]}
          autoplay={{ delay: 5000 }}
          slidesPerView={1}
          effect="fade"
          loop={true}
          pagination={{ el: '.slideshow-pagination', clickable: true }}
          className="swiper-wrapper"
        >
          {/* Slide 1 */}
          <SwiperSlide
            className="swiper-slide full-width_border border-1"
            style={{ borderColor: '#f5e6e0' }}
          >
            <div className="position-relative h-100 overflow-hidden">
              <div
                className="slideshow-bg"
                style={{ backgroundColor: '#f5e6e0' }}
              >
                <img
                  loading="lazy"
                  src={slide1}
                  width={1761}
                  height={778}
                  alt="Pattern"
                  className="slideshow-bg__img object-fit-cover"
                />
              </div>

              <div className="slideshow-text position-absolute start-50 top-50 translate-middle container">
                <h6 className="text_dash text-uppercase text-red fs-base fw-medium animate animate_fade animate_btt animate_delay-3">
                  Xu hướng mới
                </h6>
                <h2 className="text-uppercase h1 fw-normal animate animate_fade animate_btt animate_delay-5 mb-0">
                  Giảm giá đón xuân
                </h2>
                <h2 className="text-uppercase h1 fw-bold animate animate_fade animate_btt animate_delay-5">
                  Thời trang nam nữ
                </h2>
                <Link
                  to="/shop"
                  className="btn-link btn-link_lg default-underline text-uppercase fw-medium animate animate_fade animate_btt animate_delay-7"
                >
                  Khám phá ngay
                </Link>
              </div>
            </div>
          </SwiperSlide>

          {/* Slide 2 */}
          <SwiperSlide
            className="swiper-slide full-width_border border-1"
            style={{ borderColor: '#f5e6e0' }}
          >
            <div className="position-relative h-100 overflow-hidden">
              <div
                className="slideshow-bg"
                style={{ backgroundColor: '#f5e6e0' }}
              >
                <img
                  loading="lazy"
                  src={slide2}
                  width={1761}
                  height={778}
                  alt="Pattern"
                  className="slideshow-bg__img object-fit-cover"
                />
              </div>

              <div className="slideshow-text position-absolute start-50 top-50 translate-middle container">
                <h6 className="text_dash text-uppercase text-red fs-base fw-medium animate animate_fade animate_btt animate_delay-3">
                  Năm 2025
                </h6>
                <h2 className="text-uppercase h1 fw-bold animate animate_fade animate_btt animate_delay-3">
                  Mừng năm mới
                </h2>
                <h6 className="text-uppercase animate animate_fade animate_btt animate_delay-3 mb-5">
                  Giảm giá lên đến 50% & miễn phí giao hàng
                </h6>
                <Link
                  to="/shop"
                  className="btn-link btn-link_lg default-underline text-uppercase fw-medium animate animate_fade animate_btt animate_delay-3"
                >
                  Khám phá ngay
                </Link>
              </div>
            </div>
          </SwiperSlide>
          {/* Slide 3 */}
          <SwiperSlide
            className="swiper-slide full-width_border border-1"
            style={{ borderColor: '#f5e6e0' }}
          >
            <div className="position-relative h-100 overflow-hidden">
              <div
                className="slideshow-bg"
                style={{ backgroundColor: '#f5e6e0' }}
              >
                <img
                  loading="lazy"
                  src={slide3}
                  width={1761}
                  height={778}
                  alt="Pattern"
                  className="slideshow-bg__img object-fit-cover"
                />
              </div>

              <div className="slideshow-text position-absolute start-50 top-50 translate-middle container">
                <h6 className="text_dash text-uppercase text-red fs-base fw-medium animate animate_fade animate_btt animate_delay-3">
                  Tết đến xuân về 2025
                </h6>
                <h2 className="text-uppercase h1 fw-bold animate animate_fade animate_btt animate_delay-3">
                  Mừng năm mới
                </h2>
                <h6 className="text-uppercase animate animate_fade animate_btt animate_delay-3 mb-5">
                  Giảm giá lên đến 50% & miễn phí giao hàng
                </h6>
                <Link
                  to="/shop"
                  className="btn-link btn-link_lg default-underline text-uppercase fw-medium animate animate_fade animate_btt animate_delay-3"
                >
                  Khám phá ngay
                </Link>
              </div>
            </div>
          </SwiperSlide>
        </Swiper>
      </section>
      <div className="mb-md-4 pb-md-4 mb-3 pb-3" />
      <div className="pb-1" />
      {/* Shop by collection */}
    </div>
  );
};

export default Slides;
