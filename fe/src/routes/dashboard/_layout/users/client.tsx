import { useGetCustomers } from '@/data/auth/useGetCustomers';
import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useMemo, useState } from 'react';
import Header from '@/components/layoutAdmin/header/header'; // Import Header tương tự CouponList
import CurrencyVND from '@/components/config/vnd'; // Import CurrencyVND để định dạng tiền
import { Button, Input, Table } from '@medusajs/ui'; // Import các thành phần từ Medusa UI
import { Plus } from '@medusajs/icons'; // Icon Plus để tạo khách hàng mới

const pageSize = 5; // Đặt pageSize giống như trong hình ảnh (5 khách hàng/trang)

export const Route = createFileRoute('/dashboard/_layout/users/client')({
  component: CustomerList,
});

function CustomerList() {
  const [currentPage, setCurrentPage] = useState<number>(0); // Sử dụng currentPage bắt đầu từ 0
  const [searchQuery, setSearchQuery] = useState<string>(''); // State để tìm kiếm
  const navigate = useNavigate();

  const { data, isLoading, isError, error, isFetching } = useGetCustomers({
    page: currentPage + 1,
    limit: pageSize,
  });

  console.log('data', data);

  const pageCount = useMemo(() => {
    return data?.pagination?.totalCustomers
      ? Math.ceil(data.pagination.totalCustomers / pageSize)
      : 0;
  }, [data]);

  const canNextPage = useMemo(
    () => currentPage < pageCount - 1,
    [currentPage, pageCount]
  );
  const canPreviousPage = useMemo(() => currentPage > 0, [currentPage]);

  const nextPage = () => {
    if (canNextPage) {
      setCurrentPage(prev => prev + 1);
    }
  };

  const previousPage = () => {
    if (canPreviousPage) {
      setCurrentPage(prev => prev - 1);
    }
  };

  const filteredCustomers = useMemo(() => {
    return Array.isArray(data?.customers)
      ? data.customers.filter((customer: any) =>
          customer.name.toLowerCase().includes(searchQuery.toLowerCase())
        )
      : [];
  }, [data, searchQuery]);

  if (isLoading) {
    return <div>Đang tải danh sách khách hàng...</div>;
  }

  if (isError) {
    return <div>Lỗi: {(error as Error).message}</div>;
  }

  return (
    <div className="h-screen overflow-y-auto">
      <Header title="Danh sách khách hàng" />

      <div className="relative flex justify-between px-6 py-4">
        <div className="relative w-80">
          <Input
            className="bg-ui-bg-base"
            placeholder="Tìm kiếm"
            id="search-input"
            size="small"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <div className="mx-6 flex flex-col gap-1 rounded-lg border border-gray-200 bg-ui-bg-base px-6 py-4">
        <Table>
          <thead>
            <Table.Row className="bg-ui-bg-base-hover">
              <Table.HeaderCell className="font-semibold text-ui-fg-base">
                Tên khách hàng
              </Table.HeaderCell>
              <Table.HeaderCell className="font-semibold text-ui-fg-base">
                Avatar
              </Table.HeaderCell>
              <Table.HeaderCell className="font-semibold text-ui-fg-base">
                Số đơn hàng
              </Table.HeaderCell>
              <Table.HeaderCell className="font-semibold text-ui-fg-base">
                Số đơn hủy hàng
              </Table.HeaderCell>
              <Table.HeaderCell className="font-semibold text-ui-fg-base">
                Số đơn hàng thành công
              </Table.HeaderCell>
              <Table.HeaderCell className="font-semibold text-ui-fg-base">
                Số tiền hàng
              </Table.HeaderCell>
              <Table.HeaderCell className="font-semibold text-ui-fg-base">
                Xếp hạng
              </Table.HeaderCell>
            </Table.Row>
          </thead>
          <tbody>
            {filteredCustomers.length > 0 ? (
              filteredCustomers.map((customer: any) => (
                <Table.Row
                  key={customer._id}
                  className="[&_td:last-child]:w-[10%] [&_td:last-child]:whitespace-nowrap"
                >
                  <Table.Cell className="font-semibold text-ui-fg-base">
                    {customer.name || 'Unknown'}
                  </Table.Cell>
                  <Table.Cell className="font-semibold text-ui-fg-base">
                    <img
                      className="object-cover"
                      src={customer.avatar}
                      alt={customer.name}
                      style={{
                        width: '40px',
                        height: '40px',
                        borderRadius: '50%',
                      }}
                    />
                  </Table.Cell>
                  <Table.Cell className="font-semibold text-ui-fg-base">
                    {customer.totalOrders}
                  </Table.Cell>
                  <Table.Cell className="font-semibold text-ui-fg-base">
                    {customer.canceledOrders}
                  </Table.Cell>
                  <Table.Cell className="font-semibold text-ui-fg-base">
                    {customer.successfulOrders}
                  </Table.Cell>
                  <Table.Cell className="font-semibold text-ui-fg-base">
                    <CurrencyVND amount={customer.totalAmount} />
                  </Table.Cell>
                  <Table.Cell className="font-semibold text-ui-fg-base">
                    {customer.rank}
                  </Table.Cell>
                </Table.Row>
              ))
            ) : (
              <Table.Row>
                <Table.Cell className="text-center">
                  Không có khách hàng nào
                </Table.Cell>
              </Table.Row>
            )}
          </tbody>
        </Table>

        {/* Phân trang */}
        <Table.Pagination
          count={data?.pagination?.totalCustomers ?? 0}
          pageSize={pageSize}
          pageIndex={currentPage}
          pageCount={pageCount}
          canPreviousPage={canPreviousPage}
          canNextPage={canNextPage}
          previousPage={previousPage}
          nextPage={nextPage}
        />
      </div>

      {/* Hiển thị trạng thái fetching nếu đang tải thêm */}
      {isFetching && <div className="py-2 text-center">Đang tải...</div>}
    </div>
  );
}

export default CustomerList;
