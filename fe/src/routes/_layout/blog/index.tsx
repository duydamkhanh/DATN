import { createFileRoute } from '@tanstack/react-router';
import blog_banner from '../../../assets/images/blog_title_bg.jpg';
import blog1 from '../../../assets/images/Blog/blog-1.jpg';
import blog2 from '../../../assets/images/Blog/blog-2.jpg';
import blog3 from '../../../assets/images/Blog/blog-3.jpg';
import blog4 from '../../../assets/images/Blog/blog-4.jpg';
export const Route = createFileRoute('/_layout/blog/')({
  component: Blog,
});

function Blog() {
  return (
    <div className="px-[40px]">
      <main>
        <section className="blog-page-title mb-xl-5 mb-4">
          <div className="title-bg">
            <img loading="lazy" src={blog_banner} width={1780} height={420} />
          </div>
          <div className="container">
            <h2 className="page-title">Tin tức</h2>
            <div className="blog__filter">
              <a href="#" className="menu-link menu-link_us-s">
                Tất cả
              </a>
              <a href="#" className="menu-link menu-link_us-s">
                Công ty
              </a>
              <a href="#" className="menu-link menu-link_us-s menu-link_active">
                Thời trang
              </a>
              <a href="#" className="menu-link menu-link_us-s">
                Phong cách
              </a>
              <a href="#" className="menu-link menu-link_us-s">
                xu hướng
              </a>
              <a href="#" className="menu-link menu-link_us-s">
                sắc đẹp
              </a>
            </div>
          </div>
        </section>
        <section className="blog-page container">
          <h2 className="d-none">The Blog</h2>
          <div className="blog-grid row row-cols-1 row-cols-md-2">
            <div className="blog-grid__item">
              <div className="blog-grid__item-image">
                <img
                  loading="lazy"
                  className="h-auto"
                  src={blog1}
                  width={690}
                  height={500}
                />
              </div>
              <div className="blog-grid__item-detail">
                <div className="blog-grid__item-meta">
                  <span className="blog-grid__item-meta__author">
                    Bởi quản trị viên
                  </span>
                  <span className="blog-grid__item-meta__date">
                    Ngày 04 tháng 01 năm 2025
                  </span>
                </div>
                <div className="blog-grid__item-title">
                  <a href="blog/text">
                    Người phụ nữ có đôi giày đẹp không bao giờ là nơi xấu xí
                  </a>
                </div>
                <div className="blog-grid__item-content">
                  <p>
                    Một người phụ nữ mang đôi giày đẹp không chỉ thể hiện phong
                    cách mà còn khiến bất kỳ nơi nào cô ấy bước đến trở nên rực
                    rỡ hơn.
                  </p>
                  <a href="blog/text" className="readmore-link">
                    Tiếp tục đọc
                  </a>
                </div>
              </div>
            </div>
            <div className="blog-grid__item">
              <div className="blog-grid__item-image">
                <img
                  loading="lazy"
                  className="h-auto"
                  src={blog2}
                  width={690}
                  height={500}
                />
              </div>
              <div className="blog-grid__item-detail">
                <div className="blog-grid__item-meta">
                  <span className="blog-grid__item-meta__author">
                    Bởi quản trị viên
                  </span>
                  <span className="blog-grid__item-meta__date">
                    Ngày 04 tháng 01 năm 2025
                  </span>
                </div>
                <div className="blog-grid__item-title">
                  <a href="blog/text">
                    5 Mẹo Tăng Doanh Số Bán Hàng Trực Tuyến Của Bạn
                  </a>
                </div>
                <div className="blog-grid__item-content">
                  <p>
                    Tối ưu website, cá nhân hóa trải nghiệm, tận dụng mạng xã
                    hội, tạo ưu đãi hấp dẫn, và đầu tư vào nội dung để tăng
                    doanh số bán hàng trực tuyến.
                  </p>
                  <a href="blog/text" className="readmore-link">
                    Tiếp tục đọc
                  </a>
                </div>
              </div>
            </div>
            <div className="blog-grid__item">
              <div className="blog-grid__item-image">
                <img
                  loading="lazy"
                  className="h-auto"
                  src={blog3}
                  width={690}
                  height={500}
                />
              </div>
              <div className="blog-grid__item-detail">
                <div className="blog-grid__item-meta">
                  <span className="blog-grid__item-meta__author">
                    Bởi quản trị viên
                  </span>
                  <span className="blog-grid__item-meta__date">
                    Ngày 04 tháng 01 năm 2025
                  </span>
                </div>
                <div className="blog-grid__item-title">
                  <a href="blog/text">
                    Thế nào là phụ nữ đẹp một cách đúng nghĩa
                  </a>
                </div>
                <div className="blog-grid__item-content">
                  <p>
                    Có lẽ chữ “đẹp” luôn song hành cùng những người phụ nữ. Thế
                    nên không phải người ta tự dưng lại ưu ái gọi phụ nữ bằng
                    hai từ “phái đẹp”. Nhiều khi nhận thấy, chữ “đẹp” lại vượt
                    xa phạm vi của nó.{' '}
                  </p>
                  <a href="blog/text" className="readmore-link">
                    Tiếp tục đọc
                  </a>
                </div>
              </div>
            </div>
            <div className="blog-grid__item">
              <div className="blog-grid__item-image">
                <img
                  loading="lazy"
                  className="h-auto"
                  src={blog4}
                  width={690}
                  height={500}
                />
              </div>
              <div className="blog-grid__item-detail">
                <div className="blog-grid__item-meta">
                  <span className="blog-grid__item-meta__author">
                    Bởi quản trị viên
                  </span>
                  <span className="blog-grid__item-meta__date">
                    Ngày 04 tháng 01 năm 2025
                  </span>
                </div>
                <div className="blog-grid__item-title">
                  <a href="blog/text">Xu hướng thời trang đường phố</a>
                </div>
                <div className="blog-grid__item-content">
                  <p>
                    Chẳng bao lâu nữa sẽ bắt đầu mùa đông, chị em cũng dần sắm
                    sửa quần áo mới. Áo khoác dài chính là một trong những items
                    mà nhiều cô nàng yêu thích vì nó có thể giữ ấm toàn thân lại
                    mang đến một diện mạo thanh lịch, thời thượng và có thể phối
                    với bất cứ món đồ nào.
                  </p>
                  <a href="blog/text" className="readmore-link">
                    Tiếp tục đọc
                  </a>
                </div>
              </div>
            </div>
          </div>

          <div
            className="progress progress_uomo mb-3 me-auto ms-auto"
            style={{ width: 300 }}
          >
            <div
              className="progress-bar"
              role="progressbar"
              style={{ width: '39%' }}
              aria-valuenow={39}
              aria-valuemin={0}
              aria-valuemax={100}
            />
          </div>
          <div className="text-center">
            <a
              className="btn-link btn-link_lg text-uppercase fw-medium"
              href="#"
            >
              Hiển thị thêm
            </a>
          </div>
        </section>
      </main>
      <div className="pb-xl-5 mb-5"></div>
    </div>
  );
}
