import { toast, usePrompt } from '@medusajs/ui';
import instance from '@/api/axiosIntance';
import { AxiosError } from 'axios';
import {
  createFileRoute,
  useNavigate,
  useParams,
} from '@tanstack/react-router';
import { useEffect, useState } from 'react';
import CurrencyVND from '@/components/config/vnd';

export const Route = createFileRoute('/_layout/exchange/$userId/$orderId')({
  component: ExchangeRequestPage,
});

type Order = {
  status: 'delivered' | 'received' | 'pending';
  totalPrice: number;
  returnReason?: string;
  returnImages?: string[];
  items: {
    productId: string;
    name: string;
    color: string;
    size: string;
    quantity: number;
    price: number;
    image: string;
  }[];
};

function ExchangeRequestPage() {
  const { orderId } = useParams({ from: '/_layout/refund/$userId/$orderId' });
  const navigate = useNavigate();
  const dialog = usePrompt();

  const [order, setOrder] = useState<Order | null>(null);
  const [reason, setReason] = useState('');
  const [email, setEmail] = useState('');
  const [returnType] = useState('complaint');
  const [images, setImages] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
    const userId = storedUser?.user?._id;
    const userEmail = storedUser?.user?.email;

    if (userEmail) {
      setEmail(userEmail);
    }

    if (!userId || !orderId) {
      console.error('userId hoặc orderId không tồn tại');
      return;
    }

    const fetchOrder = async () => {
      setLoading(true);
      try {
        const response = await instance.get(`/orders/${userId}/${orderId}`);
        if (response.data?.data) {
          setOrder(response.data.data);
        } else {
          setOrder(null);
        }
      } catch (error) {
        console.error('Lỗi khi lấy thông tin đơn hàng:', error);
        toast.error('Không thể tải dữ liệu đơn hàng.');
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [orderId, navigate]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (images.length + files.length > 10) {
      toast.error('Bạn chỉ có thể tải lên tối đa 10 ảnh!');
      return;
    }
    setImages([...images, ...files]);
  };

  const removeImage = (index: number) => {
    setImages(images.filter((_, idx) => idx !== index));
  };

  const handleSubmit = async () => {
    if (
      !order ||
      (order.status !== 'delivered' && order.status !== 'received')
    ) {
      toast.error('Chỉ có thể hoàn trả đơn hàng đã giao hoặc đã nhận.');
      return;
    }

    if (!reason) {
      toast.error('Vui lòng nhập lý do hoàn trả!');
      return;
    }

    if (!email) {
      toast.error('Vui lòng nhập đầy đủ thông tin email.');
      return;
    }

    const isValidEmail = (email: string) =>
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

    if (!isValidEmail(email)) {
      toast.error('Vui lòng nhập email hợp lệ.');
      return;
    }

    const userHasConfirmed = await dialog({
      title: 'Khiếu nại đơn hàng',
      description: 'Bạn có chắc chắn muốn khiếu nại đơn hàng này không?',
    });

    if (!userHasConfirmed) return;

    try {
      const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
      const userId = storedUser?.user?._id;

      if (!userId || !orderId) {
        toast.error('Không tìm thấy thông tin người dùng hoặc đơn hàng.');
        return;
      }

      let imageUrls: string[] = [];

      if (images.length > 0) {
        const formData = new FormData();
        images.forEach(file => {
          formData.append('complaint', file);
        });

        try {
          const uploadRes = await instance.post(
            '/upload-gallery-complaint',
            formData,
            {
              headers: { 'Content-Type': 'multipart/form-data' },
            }
          );
          if (Array.isArray(uploadRes.data)) {
            imageUrls = uploadRes.data;
          } else if (uploadRes.data?.data?.imageUrls) {
            imageUrls = uploadRes.data.data.imageUrls;
          } else if (uploadRes.data?.imageUrls) {
            imageUrls = uploadRes.data.imageUrls;
          } else if (uploadRes.data?.images) {
            imageUrls = uploadRes.data.images;
          } else {
            console.error(
              'Cấu trúc dữ liệu trả về không đúng:',
              uploadRes.data
            );
            toast.error(
              'Dữ liệu trả về từ server không đúng định dạng. Vui lòng thử lại.'
            );
            return;
          }

          if (!Array.isArray(imageUrls) || imageUrls.length === 0) {
            console.error('imageUrls không hợp lệ:', imageUrls);
            toast.error(
              'Tải ảnh lên không thành công. Không nhận được URL ảnh.'
            );
            return;
          }
        } catch (uploadError) {
          console.error('Lỗi khi upload ảnh:', uploadError);
          toast.error('Không thể tải ảnh lên. Vui lòng thử lại.');
          return;
        }
      }

      await instance.put(`/orders/${orderId}/return`, {
        reason,
        email,
        returnType,
        images: imageUrls,
      });

      toast.success('Yêu cầu hoàn trả thành công');
      navigate({ to: '/orderuser' });
    } catch (error) {
      if (error instanceof AxiosError) {
        toast.error(
          `Lỗi: ${error.response?.data?.message || 'Có lỗi xảy ra.'}`
        );
      } else {
        toast.error(
          'Có lỗi xảy ra khi gửi yêu cầu hoàn trả. Vui lòng thử lại sau.'
        );
      }
    }
  };

  if (loading) return <div>Đang tải thông tin...</div>;
  if (!order) return <div>Không tìm thấy thông tin đơn hàng.</div>;
  if (order.items.length === 0)
    return <div className="text-center">Đơn hàng không có sản phẩm nào.</div>;

  return (
    <div className="mx-auto mb-5 mt-8 bg-white p-6 px-[200px] shadow-md">
      <h2 className="mb-4 text-xl font-semibold">Tình huống bạn đang gặp?</h2>
      <p className="mb-6 text-gray-600">
        Tôi đã nhận hàng nhưng không còn nhu cầu sử dụng hoặc sản phẩm gặp vấn
        đề (sai mẫu mã, không đúng kích thước, lỗi chất lượng, khác hình ảnh
        trên website...).
      </p>

      <div className="mb-6">
        <h3 className="mb-2 text-lg font-semibold">Sản phẩm đã chọn</h3>
        {order.items.map(item => (
          <div
            key={item.productId}
            className="mb-4 flex items-center space-x-4 border-b pb-4"
          >
            <img
              src={item.image}
              alt={item.name}
              className="h-16 w-16 rounded object-cover"
            />
            <div>
              <p className="font-semibold">{item.name}</p>
              <p className="text-gray-600">Màu: {item.color}</p>
              <p className="text-gray-600">Kích thước: {item.size}</p>
              <p className="text-gray-600">Số lượng: {item.quantity}</p>
              <p className="text-gray-600">
                Giá: <CurrencyVND amount={item.price * item.quantity} />
              </p>
            </div>
          </div>
        ))}
      </div>

      <div className="mb-6">
        <h3 className="mb-2 text-lg font-semibold">
          Nhập lý do Trả hàng và Hoàn tiền
        </h3>
        <label className="mb-2 block text-sm font-medium text-gray-700">
          Lý do:
        </label>
        <textarea
          value={reason}
          onChange={e => setReason(e.target.value)}
          className="mb-4 w-full rounded border p-2"
          placeholder="Vui lòng nhập lý do hoàn trả (ví dụ: sản phẩm bị lỗi, không đúng kích thước...)"
          rows={4}
        />
      </div>

      <div className="mb-6">
        <h3 className="mb-2 text-lg font-semibold">
          Tải ảnh liên quan (tối đa 10 ảnh)
        </h3>
        <div className="flex items-center space-x-4">
          <label className="cursor-pointer rounded-lg bg-orange-500 px-4 py-2 text-white transition-colors hover:bg-orange-600">
            <span>Chọn ảnh</span>
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={handleImageChange}
              className="hidden"
            />
          </label>
          <p className="text-sm text-gray-600">
            Đã chọn {images.length}/10 ảnh
          </p>
        </div>
        {images.length > 0 && (
          <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-5">
            {images.map((file, idx) => (
              <div
                key={idx}
                className="group relative overflow-hidden rounded-lg shadow-md"
              >
                <img
                  src={URL.createObjectURL(file)}
                  alt={`preview-${idx}`}
                  className="h-24 w-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
                <button
                  onClick={() => removeImage(idx)}
                  className="absolute right-2 top-2 rounded-full bg-red-500 p-1 text-white opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="mb-6">
        <h3 className="mb-2 text-lg font-semibold">Thông tin hoàn tiền</h3>
        <div className="mb-2 flex justify-between">
          <span>Số tiền hoàn lại:</span>
          <span>
            <CurrencyVND amount={order.totalPrice} />
          </span>
        </div>

        <label className="mb-2 block text-sm font-medium text-gray-700">
          Email:
        </label>
        <input
          type="file"
          value={email}
          onChange={e => setEmail(e.target.value)}
          className="w-full rounded border p-2"
          placeholder="Nhập địa chỉ email của bạn"
        />
      </div>

      <div className="text-right">
        <button
          onClick={() => navigate({ to: '/orderuser' })}
          className="mr-4 rounded bg-gray-500 px-6 py-2 font-semibold text-white hover:bg-gray-600"
        >
          Hủy
        </button>
        <button
          onClick={handleSubmit}
          className="rounded bg-orange-500 px-6 py-2 font-semibold text-white hover:bg-orange-600"
        >
          Hoàn thành
        </button>
      </div>
    </div>
  );
}

export default ExchangeRequestPage;
