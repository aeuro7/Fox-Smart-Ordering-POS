'use client';
import React, { useState, useEffect } from 'react';
import { doc, updateDoc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../firebase/config';
import Swal from 'sweetalert2';
import AdminNav from '../components/AdminNav';

interface OrderInfo {
  customerName?: string;
  deliveryStatus?: string;
  totalPrice?: number;
}

const UpdateOrderStatus = () => {
  const [orderId, setOrderId] = useState('');
  const [status, setStatus] = useState<'done' | 'pending'>('pending');
  const [loading, setLoading] = useState(false);
  const [orderInfo, setOrderInfo] = useState<OrderInfo | null>(null);
  const [searchLoading, setSearchLoading] = useState(false);
  const [fullOrder, setFullOrder] = useState<any | null>(null);
  const [showFullDetails, setShowFullDetails] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  // debug: log รายการสินค้าเมื่อ fullOrder.items เปลี่ยน
  useEffect(() => {
    if (fullOrder?.items) {
      console.log('fullOrder.items', fullOrder.items);
    }
  }, [fullOrder?.items]);

  // ค้นหาข้อมูลออเดอร์เมื่อกรอก ID
  const searchOrder = async () => {
    setHasSearched(true);
    if (!orderId) {
      setOrderInfo(null);
      setFullOrder(null);
      return;
    }

    setSearchLoading(true);
    try {
      const q = query(collection(db, 'orders'), where('my_order_id', '==', orderId));
      const querySnapshot = await getDocs(q);
      if (!querySnapshot.empty) {
        const orderDoc = querySnapshot.docs[0];
        const data = orderDoc.data();
        setOrderInfo({
          customerName: data.deliveryInfo?.customerName,
          deliveryStatus: data.deliveryStatus || 'pending',
          totalPrice: data.orderSummary?.totalPrice
        });
        setStatus(data.deliveryStatus || 'pending');
        setFullOrder(data);
      } else {
        setOrderInfo(null);
        setFullOrder(null);
      }
    } catch (error) {
      console.error('Error fetching order:', error);
      setOrderInfo(null);
      setFullOrder(null);
    } finally {
      setSearchLoading(false);
    }
  };

  useEffect(() => {
    // ลบ auto-search ออก (ไม่ต้องทำอะไร)
    // เดิมยิง searchOrder อัตโนมัติเมื่อ orderId เปลี่ยน
    // ตอนนี้จะค้นหาเมื่อกดปุ่มเท่านั้น
  }, []);

  const updateDeliveryStatus = async () => {
    if (!orderId || !fullOrder) {
      Swal.fire({
        title: 'กรุณากรอกรหัสออเดอร์',
        icon: 'warning',
        confirmButtonText: 'ตกลง',
        confirmButtonColor: '#3b82f6',
        customClass: {
          popup: 'rounded-2xl',
        },
      });
      return;
    }

    setLoading(true);
    try {
      // ค้นหา document ID จาก my_order_id
      const q = query(collection(db, 'orders'), where('my_order_id', '==', orderId));
      const querySnapshot = await getDocs(q);
      
      if (!querySnapshot.empty) {
        const orderDoc = querySnapshot.docs[0];
        const orderRef = doc(db, 'orders', orderDoc.id);
        await updateDoc(orderRef, { deliveryStatus: status });
        
        Swal.fire({
          title: 'อัปเดตสำเร็จ!',
          html: `
            <div class="text-center">
              <div class="mb-4">
                <div class="w-16 h-16 mx-auto bg-green-100 rounded-full flex items-center justify-center">
                  <svg class="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                  </svg>
                </div>
              </div>
              <p class="text-gray-600">สถานะจัดส่งของออเดอร์ <span class="font-semibold">${orderId}</span></p>
              <p class="text-lg">ถูกเปลี่ยนเป็น <span class="font-bold ${status === 'done' ? 'text-green-600' : 'text-amber-600'}">${status === 'done' ? 'จัดส่งแล้ว' : 'ยังไม่จัดส่ง'}</span></p>
            </div>
          `,
          confirmButtonText: 'ตกลง',
          confirmButtonColor: '#3b82f6',
          customClass: {
            popup: 'rounded-2xl',
          },
        });
        setOrderId('');
        setOrderInfo(null);
        setFullOrder(null);
        setShowFullDetails(false);
      }
    } catch (error) {
      Swal.fire({
        title: 'เกิดข้อผิดพลาด',
        text: 'ไม่สามารถอัปเดตสถานะได้',
        icon: 'error',
        confirmButtonText: 'ตกลง',
        confirmButtonColor: '#3b82f6',
        customClass: {
          popup: 'rounded-2xl',
        },
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-blue-100">
      <AdminNav />
      <div className="p-4 sm:p-6 lg:p-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-3 bg-white px-6 py-3 rounded-full shadow-lg mb-4">
              <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse"></div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                อัปเดตสถานะการจัดส่ง
              </h1>
            </div>
            <p className="text-gray-600">ค้นหาออเดอร์และอัปเดตสถานะการจัดส่ง</p>
          </div>

          {/* Main Card */}
          <div className="bg-white rounded-2xl shadow-xl border border-blue-100 overflow-hidden">
            {/* Search Section */}
            <div className="p-8 border-b border-gray-100">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <h2 className="text-xl font-bold text-gray-800">ค้นหาออเดอร์</h2>
              </div>
              
              <div className="relative">
                <input
                  type="text"
                  placeholder="กรอกรหัสออเดอร์..."
                  value={orderId}
                  onChange={(e) => setOrderId(e.target.value)}
                  className="w-full p-4 pr-32 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all duration-200 text-gray-800 text-lg"
                />
                <button
                  type="button"
                  onClick={searchOrder}
                  disabled={searchLoading || !orderId}
                  className="absolute right-2 top-1/2 -translate-y-1/2 px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white rounded-lg font-semibold shadow disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {searchLoading ? 'ค้นหา...' : 'ค้นหา'}
                </button>
                {searchLoading && (
                  <div className="absolute right-4 top-1/2 -translate-y-1/2">
                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-blue-500 border-t-transparent"></div>
                  </div>
                )}
              </div>

              {/* Order Info Display */}
              {orderInfo && fullOrder && (
                <div className="mt-6 space-y-4">
                  {/* Summary Card */}
                  <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600 mb-1">ชื่อลูกค้า</p>
                        <p className="font-semibold text-gray-800">{orderInfo.customerName}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-600 mb-1">ยอดรวม</p>
                        <p className="font-bold text-blue-600">฿{orderInfo.totalPrice?.toLocaleString()}</p>
                      </div>
                    </div>
                    <div className="mt-3 pt-3 border-t border-blue-200 flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600 mb-1">สถานะปัจจุบัน</p>
                        <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${
                          orderInfo.deliveryStatus === 'done' 
                            ? 'bg-green-100 text-green-700' 
                            : 'bg-amber-100 text-amber-700'
                        }`}>
                          <div className={`w-2 h-2 rounded-full ${
                            orderInfo.deliveryStatus === 'done' ? 'bg-green-500' : 'bg-amber-500'
                          }`}></div>
                          {orderInfo.deliveryStatus === 'done' ? 'จัดส่งแล้ว' : 'ยังไม่จัดส่ง'}
                        </span>
                      </div>
                      <button
                        onClick={() => setShowFullDetails(!showFullDetails)}
                        className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1"
                      >
                        {showFullDetails ? 'ซ่อนรายละเอียด' : 'ดูรายละเอียดเพิ่มเติม'}
                        <svg className={`w-4 h-4 transition-transform ${showFullDetails ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </button>
                    </div>
                  </div>

                  {/* Full Details */}
                  {showFullDetails && (
                    <div className="space-y-4 animate-fadeIn text-gray-900">
                      {/* Customer Info */}
                      <div className="bg-white rounded-xl border border-gray-200 p-4">
                        <h3 className="font-semibold text-blue-600 mb-3 flex items-center gap-2">
                          <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                          ข้อมูลลูกค้า
                        </h3>
                        <div className="grid grid-cols-2 gap-3 text-sm">
                          <div>
                            <p className="text-blue-600">ชื่อ</p>
                            <p className="font-medium text-gray-800">{fullOrder.deliveryInfo?.customerName}</p>
                          </div>
                          <div>
                            <p className="text-blue-600">เบอร์โทร</p>
                            <p className="font-medium text-gray-800">{fullOrder.deliveryInfo?.phoneNumber}</p>
                          </div>
                          <div className="col-span-2">
                            <p className="text-blue-600">ที่อยู่</p>
                            <p className="font-medium text-gray-800">{fullOrder.deliveryInfo?.address}</p>
                          </div>
                          <div>
                            <p className="text-blue-600">วันที่จัดส่ง</p>
                            <p className="font-medium text-gray-800">{fullOrder.deliveryInfo?.deliveryDate}</p>
                          </div>
                          <div>
                            <p className="text-blue-600">เวลาจัดส่ง</p>
                            <p className="font-medium text-gray-800">{fullOrder.deliveryInfo?.deliveryTime}</p>
                          </div>
                        </div>
                      </div>

                      {/* Order Items */}
                      <div className="bg-white rounded-xl border border-gray-200 p-4">
                        <h3 className="font-semibold text-blue-600 mb-3 flex items-center gap-2">
                          <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                          </svg>
                          รายการสินค้า
                        </h3>
                        <div className="overflow-x-auto">
                          <table className="min-w-full text-sm text-left border border-gray-200 rounded-lg">
                            <thead className="bg-gray-50">
                              <tr>
                                <th className="px-3 py-2 border-b">ลำดับ</th>
                                <th className="px-3 py-2 border-b">ชื่อสินค้า</th>
                                <th className="px-3 py-2 border-b">จำนวน</th>
                                <th className="px-3 py-2 border-b">ราคารวม</th>
                              </tr>
                            </thead>
                            <tbody>
                              {(fullOrder.items || fullOrder.orderSummary?.items)?.map((item: any, index: number) => (
                                <tr key={index} className="border-b last:border-0">
                                  <td className="px-3 py-2">{index + 1}</td>
                                  <td className="px-3 py-2 flex items-center gap-2">
                                    {item.imageUrl && (
                                      <img src={item.imageUrl} alt={item.name} className="w-8 h-8 rounded object-cover" />
                                    )}
                                    <span>{item.name}</span>
                                  </td>
                                  <td className="px-3 py-2">{item.quantity}</td>
                                  <td className="px-3 py-2">฿{(item.total ? item.total : item.price * item.quantity).toLocaleString()}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>

                      {/* Order Summary */}
                      <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl p-4">
                        <h3 className="font-semibold text-gray-800 mb-3">สรุปยอดชำระ</h3>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between pt-2 border-t border-gray-300">
                            <span className="font-semibold">ยอดรวมทั้งหมด</span>
                            <span className="font-bold text-blue-600">฿{fullOrder.orderSummary?.totalPrice?.toLocaleString()}</span>
                          </div>
                        </div>
                      </div>

                      {/* Timestamps */}
                      <div className="bg-white rounded-xl border border-gray-200 p-4">
                        <div className="flex items-center justify-between text-sm">
                        <div>
                            <p className="text-gray-600">วันที่สั่งซื้อ</p>
                            <p className="font-medium">
                              {new Date(fullOrder.createdAt?.seconds * 1000 || fullOrder.createdAt).toLocaleDateString('en-GB')} {new Date(fullOrder.createdAt?.seconds * 1000 || fullOrder.createdAt).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {hasSearched && orderId && !orderInfo && !searchLoading && (
                <div className="mt-6 p-4 bg-red-50 rounded-xl border border-red-200">
                  <div className="flex items-center gap-3">
                    <svg className="w-5 h-5 text-red-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <p className="text-red-700">ไม่พบออเดอร์ที่ค้นหา</p>
                  </div>
                </div>
              )}
            </div>

            {/* Status Selection */}
            {orderInfo && (
              <div className="p-8 bg-gray-50">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <h2 className="text-xl font-bold text-gray-800">เลือกสถานะใหม่</h2>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-6">
                  <button
                    onClick={() => setStatus('done')}
                    className={`relative p-6 rounded-xl border-2 transition-all duration-200 ${
                      status === 'done' 
                        ? 'border-green-500 bg-gradient-to-r from-green-50 to-emerald-50' 
                        : 'border-gray-200 hover:border-green-300 bg-white'
                    }`}
                  >
                    {status === 'done' && (
                      <div className="absolute top-3 right-3">
                        <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                          <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                      </div>
                    )}
                    <div className="flex flex-col items-center gap-3">
                      <div className={`w-16 h-16 rounded-full flex items-center justify-center ${
                        status === 'done' ? 'bg-green-100' : 'bg-gray-100'
                      }`}>
                        <svg className={`w-8 h-8 ${status === 'done' ? 'text-green-600' : 'text-gray-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      <span className={`font-semibold ${status === 'done' ? 'text-green-700' : 'text-gray-700'}`}>
                        จัดส่งแล้ว
                      </span>
                    </div>
                  </button>

                  <button
                    onClick={() => setStatus('pending')}
                    className={`relative p-6 rounded-xl border-2 transition-all duration-200 ${
                      status === 'pending' 
                        ? 'border-amber-500 bg-gradient-to-r from-amber-50 to-orange-50' 
                        : 'border-gray-200 hover:border-amber-300 bg-white'
                    }`}
                  >
                    {status === 'pending' && (
                      <div className="absolute top-3 right-3">
                        <div className="w-6 h-6 bg-amber-500 rounded-full flex items-center justify-center">
                          <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                      </div>
                    )}
                    <div className="flex flex-col items-center gap-3">
                      <div className={`w-16 h-16 rounded-full flex items-center justify-center ${
                        status === 'pending' ? 'bg-amber-100' : 'bg-gray-100'
                      }`}>
                        <svg className={`w-8 h-8 ${status === 'pending' ? 'text-amber-600' : 'text-gray-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <span className={`font-semibold ${status === 'pending' ? 'text-amber-700' : 'text-gray-700'}`}>
                        ยังไม่จัดส่ง
                      </span>
                    </div>
                  </button>
                </div>

                {/* Update Button */}
                <button
                  onClick={updateDeliveryStatus}
                  disabled={loading || !orderId || !orderInfo}
                  className="w-full px-8 py-4 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                      กำลังอัปเดต...
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                      อัปเดตสถานะ
                    </>
                  )}
                </button>
              </div>
            )}
          </div>

          {/* Help Card */}
          <div className="mt-6 bg-white rounded-2xl shadow-lg border border-blue-100 p-6">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-gray-800 mb-2">วิธีใช้งาน</h3>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• กรอกรหัสออเดอร์ที่ต้องการอัปเดต</li>
                  <li>• ระบบจะแสดงข้อมูลออเดอร์อัตโนมัติ</li>
                  <li>• คลิก "ดูรายละเอียดเพิ่มเติม" เพื่อดูข้อมูลทั้งหมด</li>
                  <li>• เลือกสถานะใหม่ที่ต้องการเปลี่ยน</li>
                  <li>• คลิกปุ่มอัปเดตสถานะเพื่อบันทึก</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
      `}</style>
    </div>
  );
};

export default UpdateOrderStatus;
