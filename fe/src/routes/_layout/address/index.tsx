import instance from '@/api/axiosIntance';
import ModalCreateCustomInfor from '@/components/custom-infor/modal-create-custom-infor';
import ModalUpdateCustomInfor from '@/components/custom-infor/modal-edit-custom-infor';
import CustomUser from '@/components/useroder/custom-menu';
import useCustomerMutation from '@/data/address/useAddressMutation';
import { useFetchAddress } from '@/data/address/useFetchAddress';
import { queryClient } from '@/main';
import { ChevronRightMini, Plus } from '@medusajs/icons';
import { Badge, Button, toast, usePrompt } from '@medusajs/ui';
import { createFileRoute, Link } from '@tanstack/react-router';
import { useEffect, useState } from 'react';

export const Route = createFileRoute('/_layout/address/')({
  component: Address,
});

function Address() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false); // Thêm trạng thái cho modal cập nhật
  const [userId, setUserId] = useState<string>('');
  const [currentAddress, setCurrentAddress] = useState<Address>();
  const { createCustomer, deleteCustomer } = useCustomerMutation();

  useEffect(() => {
    const storedUserId = localStorage.getItem('userId');
    if (storedUserId) {
      setUserId(storedUserId);
    }
  }, []);

  const { data, isLoading, refetch } = useFetchAddress(userId);

  const openCreateModal = () => {
    setCurrentAddress(null);
    setIsModalOpen(true);
  };

  const closeCreateModal = () => {
    setIsModalOpen(false);
    refetch();
  };

  const openUpdateModal = (address: Address) => {
    setCurrentAddress(address);
    setIsUpdateModalOpen(true);
  };

  const closeUpdateModal = () => {
    setIsUpdateModalOpen(false);
    refetch();
  };

  const dialog = usePrompt();

  const deleteEntity = async (id: string) => {
    const userHasConfirmed = await dialog({
      title: 'Xoá Địa Chỉ',
      description: 'Bạn có chắc chắn muốn xoá địa chỉ này ?',
    });
    if (userHasConfirmed) {
      await deleteCustomer.mutate({ id });
      queryClient.invalidateQueries(['customers']);
    }
  };

  const sortedAddresses = data?.data.sort(
    (a: { isDefault: boolean }, b: { isDefault: boolean }) =>
      a.isDefault ? -1 : b.isDefault ? 1 : 0
  );

  const updateIsDefault = async (addressId: string | undefined) => {
    if (!addressId) {
      console.error('Không tìm thấy addressId:', addressId);
      toast.error('Không tìm thấy addressId!');
      return;
    }

    if (!userId) {
      console.error('Không tìm thấy userId:', userId);
      toast.error('Không tìm thấy userId!');
      return;
    }

    try {
      const selectedAddress = data?.data.find(
        (address: { _id: string }) => address._id === addressId
      );
      if (!selectedAddress) {
        toast.error('Địa chỉ không tồn tại!');
        return;
      }

      if (selectedAddress.isDefault) {
        console.log('Địa chỉ đã là mặc định:', addressId);
        toast.info('Địa chỉ này đã là mặc định!');
        return;
      }

      const response = await instance.put(
        `/editcustomer/${addressId}/${userId}`,
        {
          isDefault: true,
        }
      );

      if (response?.data?.success) {
        console.log('Cập nhật thành công cho địa chỉ ID:', addressId);
        toast.success('Cập nhật địa chỉ mặc định thành công!');
        refetch();
      } else {
        console.error(
          'Không thể cập nhật địa chỉ mặc định, phản hồi server:',
          response?.data
        );
        toast.error('Không thể cập nhật địa chỉ mặc định!');
      }
    } catch (error: any) {
      console.error('Lỗi khi cập nhật địa chỉ mặc định:', error);
      toast.error('Cập nhật địa chỉ mặc định thất bại!');
    }
  };

  return (
    <div className="bg-gray-50">
      <div className="bg-white">
        <div className="main-content flex h-48 w-full flex-col items-center justify-center">
          <div className="text-content">
            <div className="text-center text-4xl font-semibold">Địa Chỉ</div>
            <div className="link caption1 mt-3 flex items-center justify-center gap-1">
              <div className="flex items-center justify-center">
                <Link to="/">Trang chủ</Link>
                <ChevronRightMini />
              </div>
              <div className="capitalize text-gray-500">
                <Link to="/address">Địa Chỉ</Link>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="mx-auto flex max-w-7xl bg-gray-50 py-10 pt-10">
        <CustomUser />
        <div className="ml-6 w-3/4">
          <div className="mb-2 flex justify-between">
            <h1 className="text-xl">Địa chỉ của bạn</h1>
            <Button onClick={openCreateModal}>
              <Plus />
              Thêm địa chỉ
            </Button>
            <ModalCreateCustomInfor
              isOpen={isModalOpen}
              onClose={closeCreateModal}
            />
            {currentAddress && (
              <ModalUpdateCustomInfor
                isOpen={isUpdateModalOpen}
                onClose={closeUpdateModal}
                address={currentAddress}
              />
            )}
          </div>
          {isLoading ? (
            <div>Bạn chưa có địa chỉ nào !</div>
          ) : (
            <div>
              {sortedAddresses?.map((address: Address) => (
                <div
                  key={address.id}
                  className="mb-2 justify-start rounded-lg border-b bg-white shadow sm:space-x-0"
                >
                  <div className="flex justify-between p-7">
                    <div>
                      <h1 className="mt-1 text-lg">
                        {address.name}, {address.phone}
                      </h1>
                      <h1 className="mt-2 text-sm">{address.address}</h1>
                      <h1 className="mb-2">
                        {address.ward}, {address.district}, {address.city}
                      </h1>
                      {address.isDefault && (
                        <>
                          <div className="w-[80px] border-[1px] border-[#ee4d2d] px-2 py-1 text-center text-sm text-[#ee4d2d]">
                            Mặc định
                          </div>
                        </>
                      )}
                    </div>
                    <div className="mt-2 flex flex-col items-center">
                      <div className="flex gap-2">
                        <p
                          className="cursor-pointer text-blue-400"
                          onClick={() => openUpdateModal(address)}
                        >
                          Cập Nhật
                        </p>
                        <p
                          className="cursor-pointer text-red-500"
                          onClick={() => deleteEntity(address._id)}
                        >
                          Xoá
                        </p>
                      </div>
                      <div className="mt-2 flex flex-col items-center">
                        {!address.isDefault && (
                          <p
                            className="mt-3 cursor-pointer border p-2 text-black"
                            onClick={() => updateIsDefault(address._id)}
                          >
                            Thiết Lập Là Mặc Định
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
