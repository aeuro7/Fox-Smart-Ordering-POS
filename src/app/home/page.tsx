"use client";

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '../components/Nav';

const HomePage = () => {
  const router = useRouter();
  const [username, setUsername] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('user_token');
    if (!token) {
      router.replace('/login');
    }
    // ดึงชื่อผู้ใช้จาก localStorage เฉพาะชื่อหน้า
    const name = localStorage.getItem('user_username') || '';
    const firstName = name.split(' ')[0] || '';
    setUsername(firstName);
  }, [router]);

  const handleOrderClick = () => {
    router.push('/order');
  };

  const handleSettingsClick = () => {
    router.push('/user');
  };

  const handleLogout = () => {
    // TODO: เพิ่ม logic การออกจากระบบ
    if (confirm('คุณต้องการออกจากระบบหรือไม่?')) {
      alert('ออกจากระบบสำเร็จ');
      router.push('/login');
    }
  };

  return (
    <div>
      {/* Navbar */}
      <Navbar />
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4 flex  justify-center">
        <div className="max-w-md w-full">
          
          {/* Main Home Card */}
          <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
            
            {/* Header Section */}
            <div className="text-center mb-8">
              <div className="text-6xl mb-4">🦊</div>
              <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-2">
                {`สวัสดี${username ? ' ' + username : ' ลูกค้า'}`}
              </h1>
              <p className="text-gray-600">เลือกบริการที่คุณต้องการใช้งาน</p>
            </div>

            {/* Main Action Buttons */}
            <div className="space-y-4">
              
              {/* Order Button */}
              <button
                onClick={handleOrderClick}
                className="w-full py-6 px-6 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-semibold text-lg rounded-2xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-300 flex items-center justify-center gap-3"
              >
                <span className="text-2xl">🛒</span>
                <span>สั่งออเดอร์</span>
              </button>

              {/* History Button */}
              <button
                onClick={() => router.push('/myhistory')}
                className="w-full py-6 px-6 bg-gradient-to-r from-yellow-600 to-yellow-700 hover:from-yellow-700 hover:to-yellow-800 text-white font-semibold text-lg rounded-2xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-300 flex items-center justify-center gap-3"
              >
                <span className="text-2xl">📄</span>
                <span>ประวัติการสั่งซื้อ</span>
              </button>

              {/* Settings Button */}
              <button
                onClick={handleSettingsClick}
                className="w-full py-6 px-6 bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 text-white font-semibold text-lg rounded-2xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-300 flex items-center justify-center gap-3"
              >
                <span className="text-2xl">⚙️</span>
                <span>ตั้งค่าบัญชี</span>
              </button>

            </div>

            {/* Logout Button */}
            <div className="mt-6">
              <button
                onClick={handleLogout}
                className="w-full py-3 px-4 bg-red-50 hover:bg-red-100 text-red-600 font-medium text-sm rounded-xl border-2 border-red-200 hover:border-red-300 transition-all duration-200"
              >
                🚪 ออกจากระบบ
              </button>
            </div>

          </div>

          {/* Welcome Message */}
          <div className="mt-6 text-center">
            <p className="text-gray-600 text-sm">
              🎉 ยินดีต้อนรับเข้าสู่ระบบ Foxy9<br/>
              เริ่มต้นการจัดการสินค้าของคุณได้เลย!
            </p>
          </div>

        </div>
      </div>
    </div>
  );
};

export default HomePage;
