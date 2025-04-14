import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/_layout/contact/')({
  component: ContactPage,
});
function ContactPage() {
  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <div className="flex w-full max-w-6xl flex-col items-center justify-between rounded-lg p-6 md:flex-row">
        {/* Left Section: Contact Info and Form */}
        <div className="w-full p-4 md:w-1/2">
          {/* Contact Info */}
          <div className="space-y-3">
            <div className="flex items-center">
              <span className="mr-2 text-yellow-500">📍</span>
              <p className="text-gray-700">Trinh Văn Bô, Nam Từ Liêm, Hà Nội</p>
            </div>
            <div className="flex items-center">
              <span className="mr-2 text-yellow-500">📞</span>
              <p className="text-gray-700">19001007</p>
            </div>
            <div className="flex items-center">
              <span className="mr-2 text-yellow-500">📧</span>
              <p className="text-gray-700">baya@gmail.com</p>
            </div>
          </div>

          {/* Contact Form */}
          <div className="mt-6">
            <h2 className="mb-4 text-xl font-semibold text-gray-800">
              Liên hệ với chúng tôi
            </h2>
            <form className="space-y-4">
              <div>
                <input
                  type="text"
                  placeholder="Họ và tên"
                  className="w-full rounded-lg border border-gray-300 p-3 focus:outline-none focus:ring-2 focus:ring-yellow-500"
                />
              </div>
              <div>
                <input
                  type="email"
                  placeholder="Email"
                  className="w-full rounded-lg border border-gray-300 p-3 focus:outline-none focus:ring-2 focus:ring-yellow-500"
                />
              </div>
              <div>
                <textarea
                  placeholder="Nội dung"
                  className="h-32 w-full resize-none rounded-lg border border-gray-300 p-3 focus:outline-none focus:ring-2 focus:ring-yellow-500"
                ></textarea>
              </div>
              <button
                type="submit"
                className="w-30% rounded-lg bg-yellow-500 px-2 py-2 text-white transition duration-300 hover:bg-yellow-600"
              >
                Gửi liên hệ
              </button>
            </form>
          </div>
        </div>

        <div className="flex w-full items-center justify-center p-4 md:w-1/2">
          <div className="flex h-[500px] w-[500px] items-center justify-center rounded-full bg-gradient-to-br from-blue-100 to-purple-100">
            <h1 className="text-6xl font-bold text-black">BY</h1>
          </div>
        </div>
      </div>
    </div>
  );
}
