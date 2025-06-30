// components/Navbar.jsx
"use client";

import React from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { 
  AiOutlineHome, 
  AiOutlineShoppingCart, 
  AiOutlineUser, 
  AiOutlineLogout 
} from 'react-icons/ai';
import { RiTBoxLine } from 'react-icons/ri';
import { auth } from '../firebase/config';
import { signOut } from 'firebase/auth';
import Swal from 'sweetalert2';

const Navbar = () => {
  const router = useRouter();
  const pathname = usePathname();

  const handleLogout = async () => {
    const result = await Swal.fire({
      title: 'ออกจากระบบ',
      text: 'คุณต้องการออกจากระบบหรือไม่?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'ใช่, ออกจากระบบ',
      cancelButtonText: 'ยกเลิก',
      customClass: {
        popup: 'rounded-2xl',
        confirmButton: 'swal2-theme-confirm',
        cancelButton: 'swal2-theme-cancel',
        title: 'text-blue-700',
        icon: 'text-blue-500'
      },
      buttonsStyling: false
    });
    if (result.isConfirmed) {
      try {
        await signOut(auth);
      } catch (e) {}
      localStorage.clear();
      sessionStorage.clear();
      await Swal.fire({
        title: 'ออกจากระบบสำเร็จ',
        text: 'คุณได้ออกจากระบบเรียบร้อย',
        icon: 'success',
        confirmButtonText: 'ไปหน้าเข้าสู่ระบบ',
        customClass: {
          popup: 'rounded-2xl',
          confirmButton: 'swal2-theme-confirm',
          title: 'text-indigo-700',
          icon: 'text-indigo-500'
        },
        buttonsStyling: false
      });
      router.push('/login');
    }
  };

  const navItems = [
    { path: '/home', label: 'หน้าแรก', icon: AiOutlineHome },
    { path: '/order', label: 'ออเดอร์', icon: AiOutlineShoppingCart },
    { path: '/user', label: 'บัญชี', icon: AiOutlineUser },
  ];

  return (
    <nav className="bg-white shadow-md border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          
          {/* Logo/Brand */}
          <div 
            onClick={() => router.push('/')}
            className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity"
          >
            <RiTBoxLine className="text-2xl text-orange-500" />
            <span className="text-xl font-bold text-gray-800">Foxy9</span>
          </div>

          {/* Navigation Items */}
          <div className="hidden md:flex items-center gap-6">
            {navItems.map((item) => {
              const IconComponent = item.icon;
              return (
                <button
                  key={item.path}
                  onClick={() => router.push(item.path)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg font-medium transition-all duration-200 ${
                    pathname === item.path
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-600 hover:text-blue-600 hover:bg-gray-50'
                  }`}
                >
                  <IconComponent className="text-lg" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>

          {/* Logout Button */}
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg font-medium transition-all duration-200"
          >
            <AiOutlineLogout className="text-lg" />
            <span className="hidden sm:inline">ออกจากระบบ</span>
          </button>

        </div>

        {/* Mobile Navigation */}
        <div className="md:hidden pb-4">
          <div className="flex justify-around">
            {navItems.map((item) => {
              const IconComponent = item.icon;
              return (
                <button
                  key={item.path}
                  onClick={() => router.push(item.path)}
                  className={`flex flex-col items-center gap-1 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    pathname === item.path
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-600 hover:text-blue-600'
                  }`}
                >
                  <IconComponent className="text-xl" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>
        </div>

      </div>
    </nav>
  );
};

export default Navbar;
