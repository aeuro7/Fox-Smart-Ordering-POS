"use client";

import React, { useState } from 'react';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';
import { app } from '../firebase/config';
import { useRouter } from 'next/navigation';
import { getFirestore, doc, getDoc } from 'firebase/firestore';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('กรุณากรอกอีเมลและรหัสผ่าน');
      return;
    }
    setError('');
    setIsSubmitting(true);
    try {
      const auth = getAuth(app);
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      const idToken = await user.getIdToken();
      const db = getFirestore(app);
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      if (userDoc.exists()) {
        const userData = userDoc.data();
        localStorage.setItem('user_token', idToken);
        localStorage.setItem('user_email', userData.email || '');
        localStorage.setItem('user_username', userData.username || '');
        localStorage.setItem('user_phone', userData.phone || '');
        localStorage.setItem('user_address', userData.address || '');
        localStorage.setItem('user_doc_id', user.uid);
      } else {
        localStorage.setItem('user_token', idToken);
        localStorage.setItem('user_email', user.email || '');
        localStorage.setItem('user_doc_id', user.uid);
      }
      router.push('/home');
    } catch (err: any) {
      let msg = 'เกิดข้อผิดพลาดในการเข้าสู่ระบบ';
      if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password') {
        msg = 'อีเมลหรือรหัสผ่านไม่ถูกต้อง';
      } else if (err.code === 'auth/invalid-email') {
        msg = 'รูปแบบอีเมลไม่ถูกต้อง';
      }
      setError(msg);
    } finally {
      setIsSubmitting(false);
    }
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
                className="w-full py-3 px-4 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-medium rounded-full shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-300 flex items-center justify-center gap-2"
                disabled={isSubmitting}
              >
                {isSubmitting && (
                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
                  </svg>
                )}
                {isSubmitting ? 'กำลังเข้าสู่ระบบ...' : 'เข้าสู่ระบบ'}
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