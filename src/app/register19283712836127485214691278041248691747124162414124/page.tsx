"use client";

import React, { useState } from 'react';
import { auth, db } from '../firebase/config';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { useRouter } from 'next/navigation';
import Swal from 'sweetalert2';

const RegisterPage = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    address: ''
  });
  const [errors, setErrors] = useState<{[key: string]: string}>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors: {[key: string]: string} = {};

    // Username validation
    if (!formData.username.trim()) {
      newErrors.username = 'กรุณากรอกชื่อผู้ใช้';
    } else if (formData.username.length < 3) {
      newErrors.username = 'ชื่อผู้ใช้ต้องมีอย่างน้อย 3 ตัวอักษร';
    }

    // Email validation
    if (!formData.email.trim()) {
      newErrors.email = 'กรุณากรอกอีเมล';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'รูปแบบอีเมลไม่ถูกต้อง';
    }

    // Password validation
    if (!formData.password) {
      newErrors.password = 'กรุณากรอกรหัสผ่าน';
    } else if (formData.password.length < 6) {
      newErrors.password = 'รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร';
    }

    // Confirm password validation
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'กรุณายืนยันรหัสผ่าน';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'รหัสผ่านไม่ตรงกัน';
    }

    // Phone validation
    if (!formData.phone.trim()) {
      newErrors.phone = 'กรุณากรอกเบอร์โทรศัพท์';
    } else if (!/^[0-9]{10}$/.test(formData.phone.replace(/[-\s]/g, ''))) {
      newErrors.phone = 'เบอร์โทรศัพท์ต้องเป็นตัวเลข 10 หลัก';
    }

    // Address validation
    if (!formData.address.trim()) {
      newErrors.address = 'กรุณากรอกที่อยู่';
    } else if (formData.address.length < 10) {
      newErrors.address = 'ที่อยู่ต้องมีอย่างน้อย 10 ตัวอักษร';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    setErrors({});

    try {
      // สมัครสมาชิกกับ Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        formData.email,
        formData.password
      );
      const user = userCredential.user;

      // บันทึกข้อมูลเพิ่มเติมลง Firestore
      await setDoc(doc(db, 'users', user.uid), {
        username: formData.username,
        email: formData.email,
        phone: formData.phone,
        address: formData.address,
        createdAt: new Date()
      });

      // redirect ไปหน้า login หลังปิด popup
      await Swal.fire({
        icon: 'success',
        title: 'สมัครสมาชิกสำเร็จ!',
        html: `
          <div style="text-align:left;">
            <b>👤 ชื่อผู้ใช้:</b> ${formData.username}<br/>
            <b>📧 อีเมล:</b> ${formData.email}<br/>
            <b>📱 เบอร์โทร:</b> ${formData.phone}<br/>
            <b>🏠 ที่อยู่:</b> ${formData.address}
          </div>
          <hr/>
          <div style="margin-top:8px;">ยินดีต้อนรับสู่ Foxy9! 🦊<br/>คุณสามารถเข้าสู่ระบบได้แล้ว</div>
        `,
        confirmButtonText: 'ไปหน้าเข้าสู่ระบบ',
        customClass: {
          popup: 'rounded-2xl'
        }
      });
      router.push('/login');
    } catch (error: any) {
      // แสดง error จาก Firebase
      console.error('Registration error:', error);
      let firebaseError = {} as {[key: string]: string};
      if (error.code === 'auth/email-already-in-use') {
        firebaseError.email = 'อีเมลนี้ถูกใช้ไปแล้ว';
      } else if (error.code === 'auth/invalid-email') {
        firebaseError.email = 'อีเมลไม่ถูกต้อง';
      } else if (error.code === 'auth/weak-password') {
        firebaseError.password = 'รหัสผ่านอ่อนเกินไป';
      } else {
        firebaseError.general = error.message || 'เกิดข้อผิดพลาด กรุณาลองใหม่';
      }
      setErrors(firebaseError);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePhoneChange = (value: string) => {
    // รับเฉพาะตัวเลข
    const digits = value.replace(/\D/g, '');
    handleInputChange('phone', digits);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4 flex items-center justify-center">
      <div className="max-w-lg w-full">
        {/* Main Register Card */}
        <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
          
          {/* Header Section */}
          <div className="text-center mb-8">
            <div className="text-6xl mb-4">🦊</div>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-2">
              สมัครสมาชิก Foxy9
            </h1>
            <p className="text-gray-600">สร้างบัญชีใหม่เพื่อเริ่มต้นใช้งาน</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">

            {/* Username Input */}
            <div className="space-y-2">
              <label className="block text-gray-700 font-semibold text-sm">
                ชื่อผู้ใช้ <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-4 transition-all duration-200 font-medium text-black bg-blue-50 placeholder-gray-500 ${
                  errors.username 
                    ? 'border-red-300 focus:border-red-400 focus:ring-red-100' 
                    : 'border-blue-200 focus:border-blue-400 focus:ring-blue-100'
                }`}
                value={formData.username}
                onChange={e => handleInputChange('username', e.target.value)}
                placeholder="กรอกชื่อผู้ใช้ (อย่างน้อย 3 ตัวอักษร)"
              />
              {errors.username && (
                <p className="text-red-500 text-sm font-medium">{errors.username}</p>
              )}
            </div>

            {/* Email Input */}
            <div className="space-y-2">
              <label className="block text-gray-700 font-semibold text-sm">
                อีเมล <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-4 transition-all duration-200 font-medium text-black bg-blue-50 placeholder-gray-500 ${
                  errors.email 
                    ? 'border-red-300 focus:border-red-400 focus:ring-red-100' 
                    : 'border-blue-200 focus:border-blue-400 focus:ring-blue-100'
                }`}
                value={formData.email}
                onChange={e => handleInputChange('email', e.target.value)}
                placeholder="กรอกอีเมลของคุณ"
              />
              {errors.email && (
                <p className="text-red-500 text-sm font-medium">{errors.email}</p>
              )}
            </div>

            {/* Password Inputs Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Password Input */}
              <div className="space-y-2">
                <label className="block text-gray-700 font-semibold text-sm">
                  รหัสผ่าน <span className="text-red-500">*</span>
                </label>
                <input
                  type="password"
                  className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-4 transition-all duration-200 font-medium text-black bg-blue-50 placeholder-gray-500 ${
                    errors.password 
                      ? 'border-red-300 focus:border-red-400 focus:ring-red-100' 
                      : 'border-blue-200 focus:border-blue-400 focus:ring-blue-100'
                  }`}
                  value={formData.password}
                  onChange={e => handleInputChange('password', e.target.value)}
                  placeholder="อย่างน้อย 6 ตัวอักษร"
                />
                {errors.password && (
                  <p className="text-red-500 text-sm font-medium">{errors.password}</p>
                )}
              </div>

              {/* Confirm Password Input */}
              <div className="space-y-2">
                <label className="block text-gray-700 font-semibold text-sm">
                  ยืนยันรหัสผ่าน <span className="text-red-500">*</span>
                </label>
                <input
                  type="password"
                  className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-4 transition-all duration-200 font-medium text-black bg-blue-50 placeholder-gray-500 ${
                    errors.confirmPassword 
                      ? 'border-red-300 focus:border-red-400 focus:ring-red-100' 
                      : 'border-blue-200 focus:border-blue-400 focus:ring-blue-100'
                  }`}
                  value={formData.confirmPassword}
                  onChange={e => handleInputChange('confirmPassword', e.target.value)}
                  placeholder="กรอกรหัสผ่านอีกครั้ง"
                />
                {errors.confirmPassword && (
                  <p className="text-red-500 text-sm font-medium">{errors.confirmPassword}</p>
                )}
              </div>
            </div>

            {/* Phone Input */}
            <div className="space-y-2">
              <label className="block text-gray-700 font-semibold text-sm">
                เบอร์โทรศัพท์ <span className="text-red-500">*</span>
              </label>
              <input
                type="tel"
                className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-4 transition-all duration-200 font-medium text-black bg-blue-50 placeholder-gray-500 ${
                  errors.phone 
                    ? 'border-red-300 focus:border-red-400 focus:ring-red-100' 
                    : 'border-blue-200 focus:border-blue-400 focus:ring-blue-100'
                }`}
                value={formData.phone}
                onChange={e => handlePhoneChange(e.target.value)}
                placeholder="กรอกเบอร์โทรศัพท์ (10 หลัก)"
                maxLength={10}
              />
              {errors.phone && (
                <p className="text-red-500 text-sm font-medium">{errors.phone}</p>
              )}
            </div>

            {/* Address Input */}
            <div className="space-y-2">
              <label className="block text-gray-700 font-semibold text-sm">
                ที่อยู่ <span className="text-red-500">*</span>
              </label>
              <textarea
                rows={3}
                className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-4 transition-all duration-200 font-medium text-black bg-blue-50 placeholder-gray-500 resize-none ${
                  errors.address 
                    ? 'border-red-300 focus:border-red-400 focus:ring-red-100' 
                    : 'border-blue-200 focus:border-blue-400 focus:ring-blue-100'
                }`}
                value={formData.address}
                onChange={e => handleInputChange('address', e.target.value)}
                placeholder="กรอกที่อยู่ของคุณ (บ้านเลขที่ ซอย ถนน ตำบล อำเภอ จังหวัด รหัสไปรษณีย์)"
              />
              {errors.address && (
                <p className="text-red-500 text-sm font-medium">{errors.address}</p>
              )}
            </div>

            {/* Submit Button */}
            <div className="pt-4">
              <button
                type="submit"
                disabled={isSubmitting}
                className={`w-full py-4 px-6 font-semibold text-lg rounded-full shadow-lg transition-all duration-300 ${
                  isSubmitting
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white hover:shadow-xl transform hover:-translate-y-0.5'
                }`}
              >
                {isSubmitting ? (
                  <div className="flex items-center justify-center gap-3">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    กำลังสมัครสมาชิก...
                  </div>
                ) : (
                  '🚀 สมัครสมาชิก'
                )}
              </button>
            </div>

          </form>

          

        </div>

        {/* Additional Info Card
        <div className="mt-6 bg-white/70 backdrop-blur-sm rounded-2xl p-6 text-center">
          <div className="text-2xl mb-2">✨</div>
          <p className="text-gray-600 text-sm">
            สมัครสมาชิกวันนี้<br/>
            รับสิทธิพิเศษและโปรโมชั่นดีๆ มากมาย
          </p>
        </div> */}

        {/* แสดง error อื่น ๆ (ถ้ามี) */}
        {errors.general && (
          <p className="text-red-500 text-center text-sm font-medium">{errors.general}</p>
        )}
      </div>
    </div>
  );
};

export default RegisterPage;