'use client';
import React, { useEffect, useState } from 'react';
import { useOrderContext } from '../OrderContext';
import { ShoppingCartIcon, XIcon, CheckIcon } from '../../components/IconComponents';
import { useRouter } from 'next/navigation';
import { db } from '../../firebase/config';
import { addDoc, collection, Timestamp } from 'firebase/firestore';

const OrderSummaryPage = () => {
  const { orderSummary } = useOrderContext();
  const router = useRouter();
  
  const [deliveryInfo, setDeliveryInfo] = useState({
    customerName: '',
    phoneNumber: '',
    address: '',
    deliveryDate: ''
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!orderSummary) {
      router.replace('/order');
    }
  }, [orderSummary, router]);

  // useEffect สำหรับ localStorage โดยเฉพาะ (key แบบ user)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedCustomerName = localStorage.getItem('user_username') || '';
      const savedPhoneNumber = localStorage.getItem('user_phone') || '';
      const savedAddress = localStorage.getItem('user_address') || '';
      setDeliveryInfo({
        customerName: savedCustomerName,
        phoneNumber: savedPhoneNumber,
        address: savedAddress,
        deliveryDate: ''
      });
    }
  }, []);

  const handleInputChange = (field: string, value: string) => {
    setDeliveryInfo(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleConfirmOrder = async () => {
    if (!deliveryInfo.customerName.trim()) {
      alert('กรุณากรอกชื่อผู้สั่ง');
      return;
    }
    if (!deliveryInfo.phoneNumber.trim()) {
      alert('กรุณากรอกเบอร์โทรศัพท์');
      return;
    }
    if (!deliveryInfo.address.trim()) {
      alert('กรุณากรอกที่อยู่');
      return;
    }
    if (!deliveryInfo.deliveryDate) {
      alert('กรุณาเลือกวันจัดส่ง');
      return;
    }

    setIsSubmitting(true);
    
    // ดึง user_doc_id จาก localStorage
    let userDocId = '';
    if (typeof window !== 'undefined') {
      userDocId = localStorage.getItem('user_doc_id') || '';
    }

    try {
      // เพิ่มข้อมูลลง Firestore
      await addDoc(collection(db, 'orders'), {
        user_doc_id: userDocId,
        deliveryInfo: { ...deliveryInfo },
        orderSummary: { ...orderSummary },
        createdAt: Timestamp.now(),
      });

      const finalOrderSummary = `
🎉 สั่งซื้อสำเร็จ!
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📋 ข้อมูลการจัดส่ง:
👤 ชื่อผู้สั่ง: ${deliveryInfo.customerName}
📞 เบอร์โทร: ${deliveryInfo.phoneNumber}
📍 ที่อยู่: ${deliveryInfo.address}
🗓️ วันจัดส่ง: ${deliveryInfo.deliveryDate}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🛒 รายการสินค้า:
${orderSummary?.items.map(item =>
      `${item.emoji} ${item.name}: ${item.quantity} ชิ้น × ${item.price}฿ = ${item.total}฿`
    ).join('\n')}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📦 จำนวนทั้งหมด: ${orderSummary?.totalItems} ชิ้น
💰 ราคารวม: ${orderSummary?.totalPrice.toLocaleString()}฿

ขอบคุณที่ใช้บริการ! 🙏
เราจะติดต่อกลับไปยังเบอร์ ${deliveryInfo.phoneNumber} เร็วๆ นี้
      `;

      alert(finalOrderSummary);
      setIsSubmitting(false);
      router.push('/order');
    } catch (error) {
      alert('เกิดข้อผิดพลาดในการบันทึกข้อมูล กรุณาลองใหม่อีกครั้ง');
      setIsSubmitting(false);
    }
  };

  if (!orderSummary) {
    return null;
  }

  const StoreIcon = ({ className }: { className?: string }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
    </svg>
  );

  const PhoneIcon = ({ className }: { className?: string }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
    </svg>
  );

  const LocationIcon = ({ className }: { className?: string }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md">
        
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <ShoppingCartIcon className="w-7 h-7 text-blue-600" />
              สรุปคำสั่งซื้อ
            </h2>
            <button
              onClick={() => router.push('/order')}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors touch-manipulation"
            >
              <XIcon className="w-6 h-6 text-gray-500" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Order Summary */}
          <div className="space-y-4">
            <h3 className="font-semibold text-gray-800 mb-3">รายการสินค้าที่สั่งซื้อ:</h3>
            {orderSummary.items.map((item) => (
              <div key={item.id} className="flex justify-between items-center py-3 px-4 bg-gray-50 rounded-xl">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{item.emoji}</span>
                  <div>
                    <p className="font-medium text-gray-800">{item.name}</p>
                    <p className="text-sm text-gray-600">{item.quantity} ชิ้น × {item.price}฿</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-green-600">{item.total.toLocaleString()}฿</p>
                </div>
              </div>
            ))}
            <div className="border-t border-gray-200 pt-4 mt-6">
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-gray-700">จำนวนทั้งหมด:</span>
                  <span className="font-bold text-gray-900">{orderSummary.totalItems} ชิ้น</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-lg font-semibold text-gray-700">ราคารวมทั้งสิ้น:</span>
                  <span className="text-2xl font-bold text-green-600">{orderSummary.totalPrice.toLocaleString()}฿</span>
                </div>
              </div>
            </div>
          </div>

          {/* Delivery Information */}
          <div className="mt-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <LocationIcon className="w-6 h-6 text-blue-600" />
              ข้อมูลการจัดส่ง
            </h3>
            
            <div className="space-y-4">
              {/* ชื่อผู้สั่ง */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <StoreIcon className="w-4 h-4 inline mr-1" />
                  ชื่อผู้สั่ง <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={deliveryInfo.customerName}
                  onChange={(e) => handleInputChange('customerName', e.target.value)}
                  placeholder="กรอกชื่อผู้สั่งของคุณ"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-400 focus:ring-4 focus:ring-blue-100 transition-all duration-200 text-gray-900 placeholder-gray-500 touch-manipulation"
                  maxLength={50}
                />
              </div>

              {/* เบอร์โทรศัพท์ */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <PhoneIcon className="w-4 h-4 inline mr-1" />
                  เบอร์โทรศัพท์ <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  value={deliveryInfo.phoneNumber}
                  onChange={(e) => handleInputChange('phoneNumber', e.target.value)}
                  placeholder="08X-XXX-XXXX"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-400 focus:ring-4 focus:ring-blue-100 transition-all duration-200 text-gray-900 placeholder-gray-500 touch-manipulation"
                  maxLength={15}
                />
              </div>

              {/* ที่อยู่ */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <LocationIcon className="w-4 h-4 inline mr-1" />
                  ที่อยู่จัดส่ง <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={deliveryInfo.address}
                  onChange={(e) => handleInputChange('address', e.target.value)}
                  placeholder="กรอกที่อยู่สำหรับจัดส่งสินค้า เช่น บ้านเลขที่ ซอย ถนน แขวง เขต จังหวัด รหัสไปรษณีย์"
                  rows={4}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-400 focus:ring-4 focus:ring-blue-100 transition-all duration-200 text-gray-900 placeholder-gray-500 resize-none touch-manipulation"
                  maxLength={200}
                />
                <div className="text-right mt-1">
                  <span className="text-xs text-gray-400">{deliveryInfo.address.length}/200</span>
                </div>
              </div>

              {/* วันจัดส่ง */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <span className="inline-block mr-1">🗓️</span>
                  วันที่ต้องการจัดส่ง <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  value={deliveryInfo.deliveryDate}
                  onChange={e => handleInputChange('deliveryDate', e.target.value)}
                  min={(() => {
                    const tomorrow = new Date();
                    tomorrow.setDate(tomorrow.getDate() + 1);
                    return tomorrow.toISOString().split('T')[0];
                  })()}
                  max={(() => {
                    const maxDate = new Date();
                    maxDate.setDate(maxDate.getDate() + 7);
                    return maxDate.toISOString().split('T')[0];
                  })()}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-400 focus:ring-4 focus:ring-blue-100 transition-all duration-200 text-gray-900 placeholder-gray-500 touch-manipulation"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="p-6 border-t border-gray-200">
          <div className="flex gap-3">
            <button
              onClick={() => router.push('/order')}
              className="flex-1 py-3 px-4 bg-gray-200 hover:bg-gray-300 active:bg-gray-400 text-gray-800 rounded-xl font-medium transition-colors touch-manipulation"
            >
              กลับไปแก้ไข
            </button>
            <button
              onClick={handleConfirmOrder}
              disabled={isSubmitting}
              className={`flex-1 py-3 px-4 rounded-xl font-medium transition-all duration-200 flex items-center justify-center gap-2 touch-manipulation ${
                isSubmitting
                  ? 'bg-gray-400 cursor-not-allowed text-white'
                  : 'bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 active:from-green-700 active:to-emerald-800 text-white hover:shadow-lg'
              }`}
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  กำลังส่ง...
                </>
              ) : (
                <>
                  <CheckIcon className="w-5 h-5" />
                  ยืนยันสั่งซื้อ
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderSummaryPage;
