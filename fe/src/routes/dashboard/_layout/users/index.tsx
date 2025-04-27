import instance from '@/api/axiosIntance';
import Header from '@/components/layoutAdmin/header/header';
import { useToggleUserStatus } from '@/data/auth/useToggleUserStatus';
import { useFetchUsers } from '@/data/auth/useUserList';
import { Adjustments } from '@medusajs/icons';
import { Button, Input, StatusBadge, Table, Tabs } from '@medusajs/ui';
import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useMemo, useState } from 'react';

export const Route = createFileRoute('/dashboard/_layout/users/')({
  component: UserList,
});

function UserList() {
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState(0);
  const pageSize = 5;
  const [activeTab, setActiveTab] = useState('active');

  const { data, error, isLoading, refetch } = useFetchUsers({
    page: currentPage + 1,
    limit: pageSize,
  });

  const { toggleUserStatus } = useToggleUserStatus();
  const users = data?.users || [];

  const pageCount = useMemo(() => {
    return data?.meta?.totalPages ?? 1;
  }, [data?.meta]);

  const canPreviousPage = useMemo(() => currentPage > 0, [currentPage]);

  const canNextPage = useMemo(
    () => currentPage < pageCount - 1,
    [currentPage, pageCount]
  );

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

  const activeUsers = useMemo(() => {
    return Array.isArray(users)
      ? users.filter(user => user.status === 'ACTIVE')
      : [];
  }, [users]);

  const blockedUsers = useMemo(() => {
    return Array.isArray(users)
      ? users.filter(user => user.status !== 'ACTIVE')
      : [];
  }, [users]);

  // Hàm xử lý khi nhấn nút Khóa/Mở khóa
  const handleToggleUserStatus = async (userId, currentStatus) => {
    try {
      await toggleUserStatus(userId, currentStatus);

      await refetch();
    } catch (error) {
      console.error('Error toggling user status:', error);
    }
  };

  const renderUserTable = userList => (
    <>
      {userList.length > 0 ? (
        <>
          <Table className="w-full">
            <Table.Row className="bg-gray-200 font-semibold text-gray-700">
              <Table.HeaderCell className="px-4 py-3">
                <input type="checkbox" />
              </Table.HeaderCell>
              <Table.HeaderCell className="px-4 py-3">Tên</Table.HeaderCell>
              <Table.HeaderCell className="px-4 py-3">Email</Table.HeaderCell>
              <Table.HeaderCell className="px-4 py-3">Ảnh</Table.HeaderCell>
              <Table.HeaderCell className="px-4 py-3">
                Ngày tạo
              </Table.HeaderCell>
              <Table.HeaderCell className="px-4 py-3">Quyền</Table.HeaderCell>
              <Table.HeaderCell className="px-4 py-3">
                Trạng thái
              </Table.HeaderCell>
              <Table.HeaderCell className="px-4 py-3 text-center">
                Hành động
              </Table.HeaderCell>
            </Table.Row>
            <Table.Body>
              {userList.map(user => (
                <Table.Row
                  key={user._id}
                  className="transition-colors hover:bg-gray-100"
                >
                  <Table.Cell className="px-4 py-3">
                    <input type="checkbox" />
                  </Table.Cell>
                  <Table.Cell className="px-4 py-3 text-gray-900">
                    {user.username}
                  </Table.Cell>
                  <Table.Cell className="px-4 py-3 text-gray-600">
                    {user.email}
                  </Table.Cell>
                  <Table.Cell className="px-4 py-3">
                    <img
                      src={user.avatar}
                      alt={user.username}
                      className="h-12 w-12 rounded-full object-cover"
                    />
                  </Table.Cell>
                  <Table.Cell className="px-4 py-3 text-gray-600">
                    {new Date(user.createdAt).toLocaleDateString('vi-VN')}
                  </Table.Cell>
                  <Table.Cell className="px-4 py-3 text-gray-600">
                    {user.role}
                  </Table.Cell>
                  <Table.Cell className="px-4 py-3">
                    <StatusBadge
                      color={user.status === 'ACTIVE' ? 'green' : 'red'}
                    >
                      {user.status === 'ACTIVE' ? 'Hoạt động' : 'Bị cấm'}
                    </StatusBadge>
                  </Table.Cell>
                  <Table.Cell className="px-4 py-3 text-center">
                    <Button
                      variant={user.status === 'ACTIVE' ? 'danger' : 'success'}
                      className={`text-xs ${
                        user.status === 'ACTIVE'
                          ? 'bg-red-500 hover:bg-red-600'
                          : 'bg-green-500 hover:bg-green-600'
                      }`}
                      onClick={() =>
                        handleToggleUserStatus(user._id, user.status)
                      }
                    >
                      {user.status === 'ACTIVE' ? 'Khóa' : 'Mở khóa'}
                    </Button>
                  </Table.Cell>
                </Table.Row>
              ))}
            </Table.Body>
          </Table>
        </>
      ) : (
        <p className="py-6 text-center text-gray-500">
          Không có người dùng trong danh sách này
        </p>
      )}
    </>
  );

  return (
    <div className="h-screen overflow-y-auto bg-gray-50">
      <Header title="Danh sách người dùng" />

      <div className="mx-6 mt-10 flex flex-col gap-6 rounded-lg border border-gray-200 bg-ui-bg-base px-6 py-4">
        {isLoading && (
          <p className="py-6 text-center text-gray-500">
            Đang tải người dùng...
          </p>
        )}
        {error && (
          <p className="py-6 text-center text-red-500">
            Lỗi khi tải người dùng
          </p>
        )}

        {/* Tabs để chuyển đổi giữa người dùng hoạt động và bị cấm */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <Tabs.List className="mb-3 flex justify-between">
            <Tabs.Trigger
              className="w-full rounded-sm py-3 data-[state=active]:border-b-4 data-[state=active]:border-blue-500"
              value="active"
            >
              Người dùng hoạt động
            </Tabs.Trigger>
            <Tabs.Trigger
              className="w-full rounded-sm py-3 data-[state=active]:border-b-4 data-[state=active]:border-blue-500"
              value="blocked"
            >
              Người dùng bị cấm
            </Tabs.Trigger>
          </Tabs.List>

          <Tabs.Content value="active">
            {renderUserTable(activeUsers)}
          </Tabs.Content>

          <Tabs.Content value="blocked">
            {renderUserTable(blockedUsers)}
          </Tabs.Content>
        </Tabs>

        {/* Phân trang */}
        <div className="mt-4">
          <Table.Pagination
            count={data?.meta?.totalItems ?? 0}
            pageSize={pageSize}
            pageIndex={currentPage}
            pageCount={pageCount}
            canPreviousPage={currentPage > 0}
            canNextPage={currentPage < pageCount - 1}
            previousPage={previousPage}
            nextPage={nextPage}
          />
        </div>
      </div>
    </div>
  );
}

export default UserList;
