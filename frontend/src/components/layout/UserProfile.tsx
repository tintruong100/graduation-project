"use client";

import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUserCircle, faKey, faRightFromBracket, faXmark, faChevronDown } from '@fortawesome/free-solid-svg-icons';
import { useChangePassword } from "@/hooks/useAuth";
import { changePasswordSchema, type ChangePasswordFormValues } from "@/validations/changePassword.schema";

// Khai báo Props nhận từ Layout truyền vào
interface UserProfileProps {
    userName: string;
    onLogout: () => void;
}

export default function UserProfile({ userName, onLogout }: UserProfileProps) {
    const dropdownRef = useRef<HTMLDivElement>(null);
    const changePassword = useChangePassword();

    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors, isSubmitting },
    } = useForm<ChangePasswordFormValues>({
        resolver: zodResolver(changePasswordSchema),
    });

    useEffect(() => {
        // Chỉ còn giữ lại sự kiện click ra ngoài để đóng menu dropdown
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsDropdownOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // Xử lý Đổi mật khẩu
    const onPasswordSubmit = (values: ChangePasswordFormValues) => {
        changePassword.mutate(
            { old_password: values.oldPassword, new_password: values.newPassword },
            { onSuccess: () => setIsModalOpen(false) }
        );
    };

    return (
        <div className="relative" ref={dropdownRef}>
            {/* NÚT PROFILE TRÊN HEADER */}
            <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="flex items-center gap-2 hover:bg-gray-100 p-2 rounded-xl transition-colors focus:outline-none"
            >
                <div className="w-9 h-9 bg-blue-600 text-white rounded-full flex items-center justify-center shadow-sm">
                    <FontAwesomeIcon icon={faUserCircle} size="lg" />
                </div>
                <div className="hidden md:block text-left">
                    <p className="text-sm font-bold text-gray-800 leading-tight">{userName}</p>
                </div>
                <FontAwesomeIcon icon={faChevronDown} className={`text-gray-400 text-xs transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            {/* MENU DROPDOWN XỔ XUỐNG */}
            {isDropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                    <div className="py-1">
                        <button
                            onClick={() => {
                                setIsDropdownOpen(false);
                                reset();
                                setIsModalOpen(true);
                            }}
                            className="w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700 transition-colors flex items-center gap-3 font-medium"
                        >
                            <FontAwesomeIcon icon={faKey} className="text-gray-400 w-4" /> Đổi mật khẩu
                        </button>
                        <div className="h-px bg-gray-100 mx-2"></div>
                        <button
                            onClick={() => {
                                setIsDropdownOpen(false);
                                onLogout(); // GỌI HÀM TỪ PROPS TRUYỀN VÀO
                            }}
                            className="w-full text-left px-4 py-3 text-sm text-red-600 hover:bg-red-50 transition-colors flex items-center gap-3 font-medium"
                        >
                            <FontAwesomeIcon icon={faRightFromBracket} className="w-4" /> Đăng xuất
                        </button>
                    </div>
                </div>
            )}

            {/* MODAL ĐỔI MẬT KHẨU — rendered via portal to escape header stacking context */}
            {isModalOpen && typeof document !== "undefined" && createPortal(
                <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => !isSubmitting && setIsModalOpen(false)}></div>
                    <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md animate-in fade-in zoom-in-95 duration-200">
                        <div className="p-6">
                            <div className="flex justify-between items-center mb-6 border-b border-gray-100 pb-3">
                                <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                                    <FontAwesomeIcon icon={faKey} className="text-blue-600" />
                                    Đổi mật khẩu
                                </h2>
                                <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-red-500 transition-colors">
                                    <FontAwesomeIcon icon={faXmark} size="lg" />
                                </button>
                            </div>

                            <form onSubmit={handleSubmit(onPasswordSubmit)} className="space-y-4">
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Mật khẩu hiện tại</label>
                                    <input
                                        type="password"
                                        {...register("oldPassword")}
                                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                                        placeholder="Nhập mật khẩu đang dùng"
                                    />
                                    {errors.oldPassword && <p className="text-red-500 text-xs mt-1">{errors.oldPassword.message}</p>}
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Mật khẩu mới</label>
                                    <input
                                        type="password"
                                        {...register("newPassword")}
                                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                                        placeholder="Tối thiểu 6 ký tự"
                                    />
                                    {errors.newPassword && <p className="text-red-500 text-xs mt-1">{errors.newPassword.message}</p>}
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Xác nhận mật khẩu mới</label>
                                    <input
                                        type="password"
                                        {...register("confirmPassword")}
                                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                                        placeholder="Nhập lại mật khẩu mới"
                                    />
                                    {errors.confirmPassword && <p className="text-red-500 text-xs mt-1">{errors.confirmPassword.message}</p>}
                                </div>

                                <div className="flex justify-end gap-3 pt-4">
                                    <button
                                        type="button"
                                        onClick={() => setIsModalOpen(false)}
                                        className="px-5 py-2 text-gray-600 hover:bg-gray-100 rounded-lg font-semibold transition-colors"
                                        disabled={isSubmitting || changePassword.isPending}
                                    >
                                        Hủy
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={isSubmitting || changePassword.isPending}
                                        className={`px-6 py-2 rounded-lg font-bold text-white shadow-md transition-all active:scale-95 flex items-center justify-center min-w-[120px] 
                                            ${isSubmitting || changePassword.isPending ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'}`}
                                    >
                                        {isSubmitting || changePassword.isPending ? (
                                            <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                                        ) : "Cập nhật"}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>,
                document.body
            )}
        </div>
    );
}