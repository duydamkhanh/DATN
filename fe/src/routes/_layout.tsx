import { useEffect } from 'react';
import { createFileRoute, Outlet, useLocation } from '@tanstack/react-router';
import Footer from '@/components/footer';
import Header from '@/components/header';

const ScrollToTop = () => {
  const location = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location]);

  return null;
};

export const Route = createFileRoute('/_layout')({
  component: () => (
    <div>
      <ScrollToTop />
      <div>
        <Header />
        <Outlet />
      </div>
      {/* <div>
        <ChatBot />
      </div> */}
      <Footer />
    </div>
  ),
});
