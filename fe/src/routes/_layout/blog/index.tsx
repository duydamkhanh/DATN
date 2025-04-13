import { createFileRoute, Link } from '@tanstack/react-router';
import blog_banner from '../../../assets/images/blog_title_bg.jpg';
import { useFetchPosts } from '@/data/blog/useBlogList';
export const Route = createFileRoute('/_layout/blog/')({
  component: Blog,
});

function Blog() {
  const params = {
    page: 1,
    limit: 4,
    search: '',
  };
  const { data: listBlog, isLoading } = useFetchPosts(params);

  if (isLoading) return <div>Bài viết trống!</div>;

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
            {listBlog?.data.map(blog => (
              <div className="blog-grid__item">
                <div className="blog-grid__item-image">
                  <img
                    loading="lazy"
                    className="h-auto"
                    src={blog.thumbnail}
                    width={690}
                    height={500}
                  />
                </div>
                <div className="blog-grid__item-detail">
                  <div className="blog-grid__item-meta">
                    <span className="blog-grid__item-meta__author">
                      Bởi {blog.author}
                    </span>
                    <span className="blog-grid__item-meta__date">
                      Ngày{' '}
                      {new Date(blog.createdAt).toLocaleDateString('vi-VN')}
                    </span>
                  </div>
                  <div className="blog-grid__item-title">
                    <Link to={`/blog/${blog.slug}`}>{blog.title}</Link>
                  </div>
                  <div className="blog-grid__item-content">
                    <p>{blog.description}</p>
                    <a href="blog/text" className="readmore-link">
                      Tiếp tục đọc
                    </a>
                  </div>
                </div>
              </div>
            ))}
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
