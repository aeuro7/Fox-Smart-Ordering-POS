"use client";

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '../components/Nav';

const HomePage = () => {
  const router = useRouter();
  const [username, setUsername] = useState('');

  useEffect(() => {
    // const token = localStorage.getItem('user_token');
    // if (!token) {
    //   router.replace('/login');
    // }
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
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4 flex justify-center items-center">
        <div className="max-w-6xl w-full">

          {/* Main Home Card */}
          <div className="bg-white rounded-2xl p-8 md:p-12 shadow-lg hover:shadow-xl transition-all duration-300">

            {/* Header Section */}
            <div className="text-center mb-10">
              <div className="text-6xl mb-4">🦊</div>
              <h1 className="text-3xl md:text-5xl font-bold text-gray-800 mb-3">
                ยินดีต้อนรับสู่ Demo Smart Ordering
              </h1>
              <p className="text-gray-600 mb-3 text-lg">ระบบจัดการออเดอร์อัจฉริยะ Foxy9</p>
            </div>

            {/* Main Action Buttons - Grid Layout */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">

              {/* Order Button */}
              <button
                onClick={handleOrderClick}
                className="py-5 px-6 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-semibold text-lg rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300"
              >
                <div className="flex items-center justify-center gap-3 mb-1">
                  <span className="text-3xl">🛒</span>
                  <span>สั่งออเดอร์</span>
                </div>
                <p className="text-xs text-blue-100 font-normal">เลือกสินค้าและสั่งซื้อได้ทันที</p>
              </button>

              {/* History Button */}
              <button
                onClick={() => router.push('/myhistory')}
                className="py-5 px-6 bg-gradient-to-r from-yellow-600 to-yellow-700 hover:from-yellow-700 hover:to-yellow-800 text-white font-semibold text-lg rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300"
              >
                <div className="flex items-center justify-center gap-3 mb-1">
                  <span className="text-3xl">📄</span>
                  <span>ประวัติการสั่งซื้อ</span>
                </div>
                <p className="text-xs text-yellow-100 font-normal">ดูรายการออเดอร์ที่เคยสั่ง</p>
              </button>

              {/* Settings Button */}
              <button
                onClick={handleSettingsClick}
                className="py-5 px-6 bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 text-white font-semibold text-lg rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300"
              >
                <div className="flex items-center justify-center gap-3 mb-1">
                  <span className="text-3xl">⚙️</span>
                  <span>ตั้งค่าบัญชี</span>
                </div>
                <p className="text-xs text-gray-100 font-normal">จัดการข้อมูลส่วนตัว</p>
              </button>

              {/* Admin Demo Button */}
              <button
                onClick={() => router.push('/Admin')}
                className="py-5 px-6 bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white font-semibold text-lg rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300"
              >
                <div className="flex items-center justify-center gap-3 mb-1">
                  <span className="text-3xl">👨‍💼</span>
                  <span>Admin Demo</span>
                </div>
                <p className="text-xs text-purple-100 font-normal">ระบบจัดการสำหรับผู้ดูแล</p>
              </button>

            </div>

            {/* Logout Button */}
            <div className="flex justify-center">
              <button
                onClick={handleLogout}
                className="px-8 py-3 bg-red-50 hover:bg-red-100 text-red-600 font-medium text-base rounded-xl border-2 border-red-200 hover:border-red-300 transition-all duration-200"
              >
                🚪 ออกจากระบบ
              </button>
            </div>

          </div>

          {/* Welcome Message */}
          <div className="mt-8 bg-white/70 backdrop-blur-sm rounded-2xl p-8 shadow-md">
            <div className="text-center">
              <h3 className="text-xl font-bold text-gray-800 mb-4">เกี่ยวกับ Demo นี้</h3>
              <div className="text-gray-700 space-y-4 max-w-3xl mx-auto">
                <p className="text-base leading-relaxed">
                  สวัสดีครับ นี่คือ Demo ของระบบ Smart Ordering ที่ผมพัฒนาขึ้นมา<br />
                  เป็นระบบจัดการออเดอร์ที่ออกแบบมาให้ใช้งานง่าย ทั้งสำหรับลูกค้าและผู้ดูแลระบบ
                </p>
                <p className="text-base leading-relaxed">
                  ในส่วนของลูกค้า จะสามารถสั่งสินค้า ดูประวัติการสั่งซื้อ และจัดการข้อมูลส่วนตัวได้<br />
                  ส่วนระบบ Admin ก็มีฟีเจอร์ครบ ตั้งแต่การดูรายการออเดอร์ จัดการสถานะการจัดส่ง ไปจนถึงการดูสรุปยอดขายตามวัน
                </p>
                <p className="text-base leading-relaxed text-gray-600">
                  <strong className="text-gray-800">หมายเหตุ:</strong> Demo นี้ไม่ต้อง Login ก็เข้าใช้งานได้เลย<br />
                  และข้อมูลที่บันทึกจะไม่ถูกเก็บลง Database จริง เพื่อให้สะดวกในการทดสอบครับ
                </p>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default HomePage;
