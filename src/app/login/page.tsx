"use client";

import React, { useState } from 'react';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('กรุณากรอกอีเมลและรหัสผ่าน');
      return;
    }
    setError('');
    // TODO: เพิ่ม logic การเข้าสู่ระบบจริง
    alert('เข้าสู่ระบบสำเร็จ!');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4 flex items-center justify-center">
      <div className="max-w-md w-full">
        {/* Main Login Card */}
        <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
          
          {/* Header Section */}
          <div className="text-center mb-8">
            <div className="text-6xl mb-4">🦊</div>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-2">
              ยินดีต้อนรับสู่ Foxy9
            </h1>
            <p className="text-gray-600">กรุณาเข้าสู่ระบบเพื่อใช้งานระบบ</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4 text-red-600 text-center font-medium">
                {error}
              </div>
            )}

            {/* Email Input */}
            <div className="space-y-2">
              <label className="block text-gray-700 font-semibold text-sm">
                อีเมล
              </label>
              <input
                type="email"
                className="w-full px-4 py-3 border-2 border-blue-200 rounded-xl focus:border-blue-400 focus:ring-4 focus:ring-blue-100 transition-all duration-200 font-medium text-black bg-blue-50 placeholder-gray-500"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="กรอกอีเมลของคุณ"
                required
              />
            </div>

            {/* Password Input */}
            <div className="space-y-2">
              <label className="block text-gray-700 font-semibold text-sm">
                รหัสผ่าน
              </label>
              <input
                type="password"
                className="w-full px-4 py-3 border-2 border-blue-200 rounded-xl focus:border-blue-400 focus:ring-4 focus:ring-blue-100 transition-all duration-200 font-medium text-black bg-blue-50 placeholder-gray-500"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="กรอกรหัสผ่านของคุณ"
                required
              />
            </div>

            {/* Submit Button */}
            <div className="pt-4">
              <button
                type="submit"
                className="w-full py-4 px-6 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-semibold text-lg rounded-full shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-300"
              >
                🚀 เข้าสู่ระบบ
              </button>
            </div>

          </form>

          {/* Footer Links */}
          <div className="mt-8 text-center space-y-3">
            <div className="text-gray-500 text-sm">
              ยังไม่มีบัญชี? 
              <button className="text-blue-500 hover:text-blue-600 font-semibold ml-1 transition-colors duration-200">
                สมัครสมาชิก
              </button>
            </div>
            <div>
              <button className="text-blue-500 hover:text-blue-600 text-sm font-medium transition-colors duration-200">
                ลืมรหัสผ่าน?
              </button>
            </div>
          </div>

        </div>

        {/* Additional Info Card */}
        <div className="mt-6 bg-white/70 backdrop-blur-sm rounded-2xl p-6 text-center">
          <div className="text-2xl mb-2">✨</div>
          <p className="text-gray-600 text-sm">
            ระบบจัดการสินค้าที่ทันสมัย<br/>
            ใช้งานง่าย ปลอดภัย เชื่อถือได้
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;