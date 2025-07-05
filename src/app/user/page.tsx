"use client";

import React, { useState, useEffect } from 'react';
import Navbar from '../components/Nav';
import { db } from '../firebase/config';
import { doc, getDoc, updateDoc, setDoc } from "firebase/firestore";

const USER_STORAGE_KEYS = {
  username: 'user_username',
  email: 'user_email',
  phone: 'user_phone',
  address: 'user_address',
};

const UserProfilePage = () => {
  // สถานะสำหรับโหมดการแก้ไข
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  
  // ข้อมูลผู้ใช้
  const [userData, setUserData] = useState({
    username: '',
    email: '',
    phone: '',
    address: ''
  });

  // สถานะชั่วคราวสำหรับการแก้ไข
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    phone: '',
    address: ''
  });
  
  // โหลดข้อมูลจาก localStorage ตอน mount
  useEffect(() => {
    const storedData = {
      username: localStorage.getItem(USER_STORAGE_KEYS.username) || '',
      email: localStorage.getItem(USER_STORAGE_KEYS.email) || '',
      phone: localStorage.getItem(USER_STORAGE_KEYS.phone) || '',
      address: localStorage.getItem(USER_STORAGE_KEYS.address) || '',
    };
    setUserData(storedData);
    setFormData(storedData);
  }, []);

  useEffect(() => {
    const token = localStorage.getItem('user_token');
    if (!token) {
      window.location.replace('/login');
    }
  }, []);

  // จัดการการเปลี่ยนแปลงข้อมูลในฟอร์ม
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // ดึง doc id จาก localStorage เพื่อใช้เป็น doc id
  const getUserDocId = () => {
    return localStorage.getItem('user_doc_id') || '';
  };

  // บันทึกข้อมูลที่แก้ไขและเซฟลง localStorage + Firestore
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData) return;
    setUserData({ ...formData });
    setIsEditing(false);
    // เซฟลง localStorage
    localStorage.setItem(USER_STORAGE_KEYS.username, formData.username);
    // localStorage.setItem(USER_STORAGE_KEYS.email, formData.email); // ไม่ให้แก้ไข email
    localStorage.setItem(USER_STORAGE_KEYS.phone, formData.phone);
    localStorage.setItem(USER_STORAGE_KEYS.address, formData.address);
    // อัปเดต Firestore โดยใช้ doc id
    const userDocId = getUserDocId();
    if (userDocId) {
      try {
        await updateDoc(doc(db, 'users', userDocId), {
          username: formData.username,
          phone: formData.phone,
          address: formData.address,
        });
      } catch (err) {
        alert('เกิดข้อผิดพลาดในการอัปเดตข้อมูลในฐานข้อมูล');
        console.error('Firestore update error:', err);
      }
    }
  };

  // ยกเลิกการแก้ไข
  const handleCancel = () => {
    setFormData({...userData});
    setIsEditing(false);
  };

  if (!userData || !formData) {
    return (
      <div>
        <Navbar />
        <div className="flex justify-center items-center min-h-screen">
          <div>กำลังโหลดข้อมูล...</div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <Navbar />
      
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4 flex items-center justify-center">
      
      
      <div className="max-w-md w-full">
        {/* Main Profile Card */}
        <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
          
          {/* Header Section */}
          <div className="text-center mb-8">
            <div className="text-6xl mb-4">👤</div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2">
              โปรไฟล์ของคุณ
            </h1>
            <p className="text-gray-600">จัดการข้อมูลส่วนตัวของคุณ</p>
          </div>

          {/* Edit Button */}
          {!isEditing && (
            <div className="flex justify-end mb-6">
              <button 
                onClick={() => setIsEditing(true)}
                className="px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-medium rounded-full shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-300 flex items-center gap-2"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                </svg>
                แก้ไขข้อมูล
              </button>
            </div>
          )}

          {/* Profile Information Display */}
          {!isEditing ? (
            <div className="space-y-6">
              {/* Username */}
              <div className="bg-blue-50 rounded-xl p-4 border-2 border-blue-200">
                <div className="flex items-start gap-3">
                  <div className="text-blue-500 mt-1">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                      <circle cx="12" cy="7" r="4"></circle>
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-gray-500">ชื่อผู้ใช้</h3>
                    <p className="text-lg font-medium text-gray-800">{userData.username}</p>
                  </div>
                </div>
              </div>
              
              {/* Email */}
              <div className="bg-blue-50 rounded-xl p-4 border-2 border-blue-200">
                <div className="flex items-start gap-3">
                  <div className="text-blue-500 mt-1">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                      <polyline points="22,6 12,13 2,6"></polyline>
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-gray-500">อีเมล</h3>
                    <p className="text-lg font-medium text-gray-800">{userData.email}</p>
                  </div>
                </div>
              </div>
              
              {/* Phone */}
              <div className="bg-blue-50 rounded-xl p-4 border-2 border-blue-200">
                <div className="flex items-start gap-3">
                  <div className="text-blue-500 mt-1">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-gray-500">เบอร์โทร</h3>
                    <p className="text-lg font-medium text-gray-800">{userData.phone}</p>
                  </div>
                </div>
              </div>
              
              {/* Address */}
              <div className="bg-blue-50 rounded-xl p-4 border-2 border-blue-200">
                <div className="flex items-start gap-3">
                  <div className="text-blue-500 mt-1">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                      <polyline points="9 22 9 12 15 12 15 22"></polyline>
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-gray-500">ที่อยู่</h3>
                    <p className="text-lg font-medium text-gray-800">{userData.address}</p>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <form id="profile-form" onSubmit={handleSubmit} className="space-y-6">
              {/* Username Input */}
              <div className="space-y-2">
                <label htmlFor="username" className="block text-gray-700 font-semibold text-sm flex items-center gap-2">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                    <circle cx="12" cy="7" r="4"></circle>
                  </svg>
                  ชื่อผู้ใช้
                </label>
                <input
                  type="text"
                  id="username"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border-2 border-blue-200 rounded-xl focus:border-blue-400 focus:ring-4 focus:ring-blue-100 transition-all duration-200 font-medium text-black bg-blue-50 placeholder-gray-500"
                  required
                />
              </div>
              
              {/* Email Input */}
              <div className="space-y-2">
                <label htmlFor="email" className="block text-gray-700 font-semibold text-sm flex items-center gap-2">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                    <polyline points="22,6 12,13 2,6"></polyline>
                  </svg>
                  อีเมล
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border-2 border-blue-200 rounded-xl focus:border-blue-400 focus:ring-4 focus:ring-blue-100 transition-all duration-200 font-medium text-black bg-blue-50 placeholder-gray-500"
                  required
                  disabled
                />
              </div>
              
              {/* Phone Input */}
              <div className="space-y-2">
                <label htmlFor="phone" className="block text-gray-700 font-semibold text-sm flex items-center gap-2">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
                  </svg>
                  เบอร์โทร
                </label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border-2 border-blue-200 rounded-xl focus:border-blue-400 focus:ring-4 focus:ring-blue-100 transition-all duration-200 font-medium text-black bg-blue-50 placeholder-gray-500"
                  required
                />
              </div>
              
              {/* Address Input */}
              <div className="space-y-2">
                <label htmlFor="address" className="block text-gray-700 font-semibold text-sm flex items-center gap-2">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                    <polyline points="9 22 9 12 15 12 15 22"></polyline>
                  </svg>
                  ที่อยู่
                </label>
                <textarea
                  id="address"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  rows={3}
                  className="w-full px-4 py-3 border-2 border-blue-200 rounded-xl focus:border-blue-400 focus:ring-4 focus:ring-blue-100 transition-all duration-200 font-medium text-black bg-blue-50 placeholder-gray-500"
                  required
                />
              </div>

              {/* Action Buttons */}
              <div className="pt-4 flex gap-4">
                <button
                  type="button"
                  onClick={handleCancel}
                  className="w-1/2 py-3 px-4 bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium rounded-full shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-300"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  className="w-1/2 py-3 px-4 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-medium rounded-full shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-300"
                >
                  บันทึกข้อมูล
                </button>
              </div>
            </form>
          )}

        </div>

        {/* Preview Panel (only shown when editing) */}
        {isEditing && (
          <div className="mt-6 bg-white/70 backdrop-blur-sm rounded-2xl p-6">
            <div className="text-center mb-4">
              <div className="text-2xl mb-2">👁️</div>
              <h3 className="font-semibold text-gray-800">ตัวอย่างข้อมูล</h3>
            </div>
            <div className="bg-blue-50 rounded-xl p-4 border-2 border-blue-200">
              <p className="text-gray-700 mb-2">👤 ชื่อผู้ใช้: {formData.username}</p>
              <p className="text-gray-700 mb-2">📧 อีเมล: {formData.email}</p>
              <p className="text-gray-700 mb-2">📱 เบอร์โทร: {formData.phone}</p>
              <p className="text-gray-700">🏠 ที่อยู่: {formData.address}</p>
            </div>
          </div>
        )}

        {/* Additional Info Card */}
        <div className="mt-6 bg-white/70 backdrop-blur-sm rounded-2xl p-6 text-center">
          <div className="text-2xl mb-2">🔒</div>
          <p className="text-gray-600 text-sm">
            ข้อมูลของคุณได้รับการปกป้องด้วยระบบความปลอดภัยขั้นสูง<br/>
            เราให้ความสำคัญกับความเป็นส่วนตัวของคุณ
          </p>
        </div>
      </div>
    </div>
    </div>
  );
};

export default UserProfilePage;