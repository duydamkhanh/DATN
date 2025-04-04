import Footer from '@/components/footer';
import Header from '@/components/header';
import useRegisterMutation from '@/data/auth/useRegisterMutation';
import { createFileRoute } from '@tanstack/react-router';
import { useState, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { Eye, EyeSlash } from '@medusajs/icons';
import { useUploadAvatar } from '@/data/cart/useUploadAvatar';

export const Route = createFileRoute('/register')({
  component: Register,
});

// Định nghĩa interface Iuser
interface Iuser {
  username: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
  avatar?: string;
}

function Register() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null); // Thêm state cho preview
  const [registerError, setRegisterError] = useState<string | null>(null);
  const [registerSuccess, setRegisterSuccess] = useState<string | null>(null);
  const [avatarUrl, setAvatarUrl] = useState<string>('');

  const fileInputRef = useRef<HTMLInputElement>(null);

  const { mutate: uploadAvatar, isPending: isUploading } = useUploadAvatar();
  const { registerMutation } = useRegisterMutation();

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
    watch,
  } = useForm<Iuser>({
    defaultValues: {
      username: '',
      email: '',
      phone: '',
      password: '',
      confirmPassword: '',
      avatar: '',
    },
  });

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0] || null;
    console.log('File được chọn:', selectedFile);
    setFile(selectedFile);

    // Tạo URL preview từ file đã chọn
    if (selectedFile) {
      const url = URL.createObjectURL(selectedFile);
      setPreviewUrl(url);
    } else {
      setPreviewUrl(null);
    }

    setAvatarUrl(''); // Reset avatarUrl khi chọn file mới
  };

  const handleUpload = async (): Promise<string> => {
    if (!file) {
      setRegisterError('Vui lòng chọn một file để upload.');
      throw new Error('No file selected');
    }

    const formData = new FormData();
    formData.append('file', file);

    return new Promise((resolve, reject) => {
      uploadAvatar(formData, {
        onSuccess: data => {
          if (typeof data !== 'string') {
            setRegisterError('URL của ảnh không hợp lệ từ server.');
            reject(new Error('Invalid URL from server'));
            return;
          }
          setAvatarUrl(data);
          setRegisterSuccess('Upload ảnh thành công!');
          setFile(null);
          setPreviewUrl(null); // Reset preview sau khi upload thành công
          if (fileInputRef.current) {
            fileInputRef.current.value = ''; // Reset input file
          }
          resolve(data);
        },
        onError: error => {
          const errorMessage =
            error.response?.data?.message ||
            error.message ||
            'Lỗi không xác định';
          setRegisterError('Upload ảnh thất bại: ' + errorMessage);
          reject(error);
        },
      });
    });
  };

  const onSubmit = async (data: Iuser) => {
    setRegisterError(null);
    setRegisterSuccess(null);

    let finalAvatarUrl = avatarUrl;

    if (file && !avatarUrl) {
      try {
        finalAvatarUrl = await handleUpload();
      } catch (error) {
        console.error('Upload thất bại:', error);
        return;
      }
    }

    if (!finalAvatarUrl) {
      setRegisterError('Vui lòng upload ảnh trước khi đăng ký.');
      return;
    }

    const userData = { ...data, avatar: finalAvatarUrl };
    console.log('Dữ liệu gửi đi đăng ký:', userData);

    try {
      await registerMutation.mutateAsync(userData, {
        onSuccess: () => {
          setRegisterSuccess(
            'Đăng ký thành công! Chào mừng bạn đến với Fashion Zone'
          );
        },
        onError: (error: any) => {
          if (error.response) {
            const { data } = error.response;
            if (data?.field && data?.message) {
              setError(data.field as keyof Iuser, {
                type: 'manual',
                message: data.message,
              });
            } else if (data?.message) {
              setRegisterError('Đăng ký thất bại: ' + data.message);
            } else {
              setRegisterError(
                'Đăng ký thất bại: ' +
                  (error.message || 'Lỗi không xác định từ server')
              );
            }
          } else {
            setRegisterError(
              'Đăng ký thất bại: ' +
                (error.message || 'Không thể kết nối đến server')
            );
          }
        },
      });
    } catch (error) {
      console.error('Lỗi khi gọi registerMutation:', error);
      setRegisterError(
        'Đăng ký thất bại: ' + (error.message || 'Lỗi không xác định')
      );
    }
  };

  const password = watch('password');
  const usernameNoAccentRegex = /^[a-zA-Z0-9_]+$/;

  return (
    <div>
      <Header />
      <main>
        <div className="mb-4" />
        <section className="login-register container max-w-3xl">
          <ul className="nav nav-tabs mb-5" id="login_register" role="tablist">
            <li className="nav-item" role="presentation">
              <a
                className="nav-link nav-link_underscore active"
                id="register-tab"
                data-bs-toggle="tab"
                href="#tab-item-register"
                role="tab"
                aria-controls="tab-item-register"
                aria-selected="true"
              >
                Đăng Ký
              </a>
            </li>
          </ul>
          <div className="tab-content pt-2" id="login_register_tab_content">
            <div
              className="tab-pane fade show active"
              id="tab-item-register"
              role="tabpanel"
              aria-labelledby="register-tab"
            >
              <div className="form-container">
                {registerSuccess && (
                  <p className="mb-3 text-center text-green-500">
                    {registerSuccess}
                  </p>
                )}
                {registerError && (
                  <p className="mb-3 text-center text-red-500">
                    {registerError}
                  </p>
                )}

                <form
                  name="register-form"
                  className="needs-validation"
                  onSubmit={handleSubmit(onSubmit)}
                  noValidate
                >
                  {/* Upload Avatar */}
                  <div className="flex items-center gap-3 p-4">
                    <div className="flex items-center space-x-4">
                      <label className="text-sm font-medium text-gray-900">
                        <span className="text-red-500">*</span> Upload Ảnh Đại
                        Diện
                      </label>
                      <label
                        htmlFor="upload"
                        className="flex cursor-pointer items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-900 transition-colors duration-200 hover:bg-gray-50"
                      >
                        <svg
                          className="mr-2 h-5 w-5 text-gray-500"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M7 16V4m0 0L3 8m4-4l4 4m6 4v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6m12 0h6m-6 0l-4 4m4-4l-4-4"
                          />
                        </svg>
                        <span>
                          {isUploading ? 'Đang upload...' : 'Tải lên ảnh'}
                        </span>
                      </label>
                      <input
                        id="upload"
                        type="file"
                        onChange={handleFileChange}
                        accept="image/*"
                        ref={fileInputRef}
                        className="hidden"
                      />
                    </div>

                    {/* Hiển thị preview hoặc avatar đã upload */}
                    {avatarUrl ? (
                      <div className="flex-shrink-0">
                        <img
                          src={avatarUrl}
                          alt="Uploaded Avatar"
                          className="h-12 w-12 rounded-md border border-gray-200 object-cover"
                          onError={e => {
                            console.error('Lỗi khi tải ảnh:', avatarUrl);
                            e.currentTarget.src =
                              'https://via.placeholder.com/48';
                          }}
                        />
                      </div>
                    ) : previewUrl ? (
                      <div className="flex-shrink-0">
                        <img
                          src={previewUrl}
                          alt="Preview Avatar"
                          className="h-12 w-12 rounded-md border border-gray-200 object-cover"
                        />
                      </div>
                    ) : (
                      <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-md border border-gray-200 bg-gray-100 text-xs text-gray-500">
                        Chưa có ảnh
                      </div>
                    )}
                  </div>

                  {/* Username */}
                  <div className="form-floating mb-3">
                    <input
                      {...register('username', {
                        required: 'Tên người dùng là bắt buộc',
                        validate: {
                          noWhitespace: value =>
                            !/\s/.test(value) ||
                            'Tên người dùng không được chứa khoảng trắng',
                          noAccents: value =>
                            usernameNoAccentRegex.test(value) ||
                            'Tên người dùng chỉ được chứa chữ cái, số và dấu gạch dưới',
                        },
                      })}
                      type="text"
                      className="form-control"
                      id="username"
                    />
                    {errors.username && (
                      <p className="text-red-500">{errors.username.message}</p>
                    )}
                    <label htmlFor="username">Tên người dùng *</label>
                  </div>

                  {/* Email */}
                  <div className="form-floating mb-3">
                    <input
                      {...register('email', {
                        required: 'Email là bắt buộc',
                        pattern: {
                          value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                          message: 'Email không hợp lệ',
                        },
                      })}
                      type="email"
                      className="form-control"
                      id="email"
                    />
                    {errors.email && (
                      <p className="text-red-500">{errors.email.message}</p>
                    )}
                    <label htmlFor="email">Email *</label>
                  </div>

                  {/* Phone */}
                  <div className="form-floating mb-3">
                    <input
                      {...register('phone', {
                        required: 'Số điện thoại là bắt buộc',
                        pattern: {
                          value: /^[0-9]{10,11}$/,
                          message: 'Số điện thoại không hợp lệ!',
                        },
                      })}
                      type="text"
                      className="form-control"
                      id="phone"
                    />
                    {errors.phone && (
                      <p className="text-red-500">{errors.phone.message}</p>
                    )}
                    <label htmlFor="phone">Số điện thoại *</label>
                  </div>

                  {/* Password */}
                  <div className="form-floating relative mb-3">
                    <input
                      {...register('password', {
                        required: 'Mật khẩu là bắt buộc',
                        minLength: {
                          value: 6,
                          message: 'Mật khẩu ít nhất 6 ký tự',
                        },
                      })}
                      type={showPassword ? 'text' : 'password'}
                      className="form-control"
                      id="password"
                    />
                    {errors.password && (
                      <p className="text-red-500">{errors.password.message}</p>
                    )}
                    <label htmlFor="password">Mật khẩu *</label>
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-2 text-gray-500 hover:text-gray-800"
                    >
                      {showPassword ? (
                        <EyeSlash className="h-5 w-5" />
                      ) : (
                        <Eye className="h-5 w-5" />
                      )}
                    </button>
                  </div>

                  {/* Confirm Password */}
                  <div className="form-floating relative mb-3">
                    <input
                      {...register('confirmPassword', {
                        required: 'Xác nhận mật khẩu là bắt buộc',
                        validate: value =>
                          value === password || 'Mật khẩu không khớp',
                      })}
                      type={showConfirmPassword ? 'text' : 'password'}
                      className="form-control"
                      id="confirmPassword"
                    />
                    {errors.confirmPassword && (
                      <p className="text-red-500">
                        {errors.confirmPassword.message}
                      </p>
                    )}
                    <label htmlFor="confirmPassword">Xác nhận mật khẩu *</label>
                    <button
                      type="button"
                      onClick={() =>
                        setShowConfirmPassword(!showConfirmPassword)
                      }
                      className="absolute right-3 top-2 text-gray-500 hover:text-gray-800"
                    >
                      {showConfirmPassword ? (
                        <EyeSlash className="h-5 w-5" />
                      ) : (
                        <Eye className="h-5 w-5" />
                      )}
                    </button>
                  </div>

                  {/* Submit Button */}
                  <button className="btn btn-primary w-100" type="submit">
                    Đăng Ký
                  </button>
                </form>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}

export default Register;
