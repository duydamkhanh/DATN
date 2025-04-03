export const getStatusIndex = (status: string) => {
    const statusList = [
      'Đã Đặt Hàng',
      'Xác nhận',
      'Đang vận chuyển',
      'Giao hàng',
      'Đã nhận hàng',
    ];
  
    return statusList.indexOf(status); // Trả về index của trạng thái
  };
  