import { useState } from 'react';
import { useFetchOrders } from '@/data/oder/useOderList';
import { Link } from '@tanstack/react-router';

const translateOrderStatus = status => {
  const statusTranslations = {
    pendingPayment: 'Đang chờ thanh toán',
    pending: 'Đang chờ xử lý',
    shipped: 'Đang vận chuyển',
    received: 'Giao hàng thành công',
    delivered: 'Hoàn thành đơn hàng',
    canceled: 'Đơn bị hủy',
    complaint: 'Khiếu nại chờ xử lý',
    refund_in_progress: 'Đang hoàn trả hàng',
    refund_completed: 'Hoàn trả hàng thành công',
    exchange_in_progress: 'Đang đổi trả hàng',
    exchange_completed: 'Đổi trả hàng thành công',
  };

  return statusTranslations[status] || status;
};

const ToDoList = () => {
  const [timeRange, setTimeRange] = useState('month'); // default là theo tháng

  const {
    data,
    isLoading,
    error,
    statusCounts: fetchedStatusCounts,
  } = useFetchOrders({
    status: 'pending,shipped',
    timeRange,
  });

  const handleTimeRangeChange = e => {
    setTimeRange(e.target.value);
  };

  if (isLoading) return <p>Đang tải...</p>;
  if (error) return <p>Lỗi khi tải đơn hàng: {error.message}</p>;

  const defaultStatusCounts = {
    pendingPayment: 0,
    pending: 0,
    shipped: 0,
    received: 0,
    delivered: 0,
    canceled: 0,
    complaint: 0,
    refund_in_progress: 0,
    refund_completed: 0,
    exchange_in_progress: 0,
    exchange_completed: 0,
  };

  const statusCounts = { ...defaultStatusCounts, ...fetchedStatusCounts };

  const deliveryStatuses = [
    'pendingPayment',
    'pending',
    'shipped',
    'received',
    'delivered',
    'canceled',
  ];
  const complaintStatuses = [
    'complaint',
    'refund_in_progress',
    'refund_completed',
    'exchange_in_progress',
    'exchange_completed',
  ];

  const deliveryCounts = Object.fromEntries(
    Object.entries(statusCounts).filter(([key]) =>
      deliveryStatuses.includes(key)
    )
  );

  const complaintCounts = Object.fromEntries(
    Object.entries(statusCounts).filter(([key]) =>
      complaintStatuses.includes(key)
    )
  );

  return (
    <div className="m-6 rounded-lg bg-white p-6">
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-xl font-semibold">Danh sách cần làm</h2>
        <select
          value={timeRange}
          onChange={handleTimeRangeChange}
          className="rounded border px-2 py-1"
        >
          <option value="week">Tuần này</option>
          <option value="month">Tháng này</option>
          <option value="year">Năm nay</option>
        </select>
      </div>

      {/* Nhóm Delivery */}
      <h3 className="mb-2 mt-4 text-lg font-medium">Đơn giao hàng</h3>
      <div className="grid grid-cols-4 gap-4">
        {Object.keys(deliveryCounts).map(status => (
          <div key={status} className="text-center">
            <Link
              to="/dashboard/order"
              state={{ status, selectedGroup: 'delivery' }}
            >
              <div className="text-3xl font-bold text-blue-500">
                {deliveryCounts[status]}
              </div>
              <p className="text-sm text-gray-600">
                {translateOrderStatus(status)}
              </p>
            </Link>
          </div>
        ))}
      </div>

      {/* Nhóm Complaint */}
      <h3 className="mb-2 mt-8 text-lg font-medium">Khiếu nại</h3>
      <div className="grid grid-cols-4 gap-4">
        {Object.keys(complaintCounts).map(status => (
          <div key={status} className="text-center">
            <Link
              to="/dashboard/order"
              state={{ status, selectedGroup: 'complaint' }}
            >
              <div className="text-3xl font-bold text-red-500">
                {complaintCounts[status]}
              </div>
              <p className="text-sm text-gray-600">
                {translateOrderStatus(status)}
              </p>
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ToDoList;
