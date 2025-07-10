'use client';
import React, { useEffect, useState } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { Calendar, Package, MapPin, Phone, ChevronLeft, ChevronRight, DollarSign, TrendingUp } from 'lucide-react';
import AdminNav from '../../components/AdminNav';
import PDFDownloader from '../../components/PDFDownloader';
import { useRouter } from 'next/navigation';
import Swal from 'sweetalert2';


interface Order {
  id: string;
  my_order_id?: string;
  deliveryInfo: {
    address: string;
    customerName: string;
    deliveryDate: string;
    phoneNumber: string;
    deliveryTime?: string; // Added deliveryTime
  };
  orderSummary: {
    items: Array<{
      name: string;
      quantity: number;
      total: number;
    }>;
    totalPrice: number;
  };
}

const DeliverySchedulePage = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const router = useRouter();

  // Format date to YYYY-MM-DD
  const formatDate = (date: Date) => {
    return date.toISOString().split('T')[0];
  };

  // Format date for display in Thai
  const formatThaiDate = (date: Date) => {
    return date.toLocaleDateString('th-TH', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      weekday: 'long',
    });
  };

  const changeDate = (days: number) => {
    const newDate = new Date(selectedDate);
    newDate.setDate(selectedDate.getDate() + days);
    setSelectedDate(newDate);
  };

  const resetToToday = () => {
    setSelectedDate(new Date());
  };

  const getTotalRevenue = () => {
    return orders.reduce((sum, order) => sum + order.orderSummary.totalPrice, 0);
  };

  const getTotalItems = () => {
    return orders.reduce((sum, order) => 
      sum + order.orderSummary.items.reduce((itemSum, item) => itemSum + item.quantity, 0)
    , 0);
  };

  // เช็ค user role ที่จุดเริ่มต้น ก่อนเรียก API
  useEffect(() => {
    const checkAdminRole = () => {
      const userRole = localStorage.getItem('user_role');
      const userToken = localStorage.getItem('user_token');
      
      // ถ้าไม่มี token หรือ role ไม่ใช่ admin
      if (!userToken || userRole !== 'admin') {
        // เคลียร์ข้อมูลทั้งหมด
        localStorage.clear();
        sessionStorage.clear();
        
        // แสดงข้อความแจ้งเตือน
        Swal.fire({
          title: 'ไม่มีสิทธิ์เข้าถึง',
          text: 'คุณไม่มีสิทธิ์เข้าถึงหน้านี้ กรุณาเข้าสู่ระบบด้วยบัญชีผู้ดูแลระบบ',
          icon: 'error',
          confirmButtonText: 'ไปหน้าเข้าสู่ระบบ',
          customClass: {
            popup: 'rounded-2xl',
            confirmButton: 'swal2-theme-confirm',
            title: 'text-red-700',
            icon: 'text-red-500'
          },
          buttonsStyling: false
        }).then(() => {
          router.push('/login');
        });
        return false;
      }
      return true;
    };

    // เช็ค role ก่อน
    checkAdminRole();
  }, [router]);

  useEffect(() => {
    const fetchOrders = async () => {
      // เช็ค role อีกครั้งก่อนเรียก API
      const userRole = localStorage.getItem('user_role');
      const userToken = localStorage.getItem('user_token');
      
      if (!userToken || userRole !== 'admin') {
        return; // ไม่เรียก API ถ้าไม่ใช่ admin
      }

      setLoading(true);
      const querySnapshot = await getDocs(collection(db, 'orders'));
      const data: Order[] = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        my_order_id: (doc.data() as any).my_order_id,
        ...doc.data()
      } as Order));

      // Filter orders for selected date
      const filteredOrders = data.filter(order => 
        order.deliveryInfo.deliveryDate === formatDate(selectedDate)
      );

      // Sort orders by creation date (using order ID which is usually a timestamp)
      const sortedOrders = filteredOrders.sort((a, b) => {
        // ลองแปลง my_order_id เป็น timestamp ถ้าเป็นไปได้
        const getTimestamp = (order: Order) => {
          if (order.my_order_id) {
            // ถ้า my_order_id เป็น timestamp (เช่น 20250705152333)
            if (/^\d{14}$/.test(order.my_order_id)) {
              return parseInt(order.my_order_id);
            }
            // ถ้าเป็นรูปแบบอื่น ให้ลองแปลงเป็นตัวเลข
            const num = parseInt(order.my_order_id);
            if (!isNaN(num)) {
              return num;
            }
          }
          // ใช้ order ID เป็น fallback
          return order.id;
        };

        const timestampA = getTimestamp(a);
        const timestampB = getTimestamp(b);

        // เรียงจากเก่าสุดไปใหม่สุด (ออเดอร์เก่าขึ้นก่อน)
        if (typeof timestampA === 'number' && typeof timestampB === 'number') {
          return timestampA - timestampB;
        }
        
        // ถ้าไม่ใช่ตัวเลข ให้เรียงตาม string
        return String(timestampA).localeCompare(String(timestampB));
      });

      setOrders(sortedOrders);
      setLoading(false);
    };

    fetchOrders();
  }, [selectedDate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div>
      <AdminNav />
    
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4 md:p-6">
      <div className="max-w-5xl mx-auto">
        {/* Date Selector */}
        <div className="bg-white rounded-xl shadow-lg p-4 mb-6 text-black">
          <div className="flex items-center justify-between">
            <button
              onClick={() => changeDate(-1)}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ChevronLeft size={24} />
            </button>
            
            <div className="flex flex-col items-center gap-2">
              <div className="flex items-center gap-2">
                <Calendar className="text-blue-500" />
                <input
                  type="date"
                  value={formatDate(selectedDate)}
                  onChange={(e) => setSelectedDate(new Date(e.target.value))}
                  className="border-0 text-lg font-medium focus:ring-0 cursor-pointer"
                />
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-500">{formatThaiDate(selectedDate)}</span>
                <button
                  onClick={resetToToday}
                  className="flex items-center gap-1 px-4 py-1.5 text-base font-semibold bg-blue-600 text-white rounded-full shadow-lg border-2 border-blue-700 hover:bg-blue-700 hover:scale-105 transition-all duration-150"
                >
                  <Calendar className="w-4 h-4" />
                  คลิ้กเพื่อแสดงรายการสำหรับวันนี้
                </button>
              </div>
            </div>

            <button
              onClick={() => changeDate(1)}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ChevronRight size={24} />
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="bg-white rounded-xl shadow-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-gray-600 text-sm">ยอดขายรวม</h3>
              <DollarSign className="text-blue-500" size={20} />
            </div>
            <p className="text-2xl font-bold text-gray-800">฿{getTotalRevenue().toLocaleString()}</p>
          </div>
          
          <div className="bg-white rounded-xl shadow-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-gray-600 text-sm">จำนวนออเดอร์</h3>
              <Package className="text-blue-500" size={20} />
            </div>
            <p className="text-2xl font-bold text-gray-800">{orders.length} รายการ</p>
          </div>
          
          <div className="bg-white rounded-xl shadow-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-gray-600 text-sm">จำนวนสินค้ารวม</h3>
              <TrendingUp className="text-blue-500" size={20} />
            </div>
            <p className="text-2xl font-bold text-gray-800">{getTotalItems()} ชิ้น</p>
          </div>
        </div>

        {/* Download PDF Button */}
        <div className="flex justify-center mb-6">
          <PDFDownloader orders={orders} selectedDate={selectedDate} />
        </div>

        {/* Orders List */}
        <div className="space-y-4">
          {orders.length === 0 ? (
            <div className="bg-white rounded-xl shadow-lg p-6 text-center">
              <Package className="mx-auto text-gray-400 mb-2" size={32} />
              <p className="text-gray-600">ไม่มีรายการจัดส่งในวันที่เลือก</p>
            </div>
          ) : (
            orders.map((order) => (
              <div key={order.id} className="bg-white rounded-xl shadow-lg p-4">
                <div className="flex flex-col gap-3">
                  {/* Customer Name */}
                  <div className="border-b pb-3">
                    <h3 className="text-lg font-medium text-gray-800">
                      {order.deliveryInfo.customerName}
                    </h3>
                    <div className="text-xs text-gray-400 mt-1">my_order_id: {order.my_order_id || '-'}</div>
                  </div>

                  {/* Contact Info */}
                  <div className="flex flex-col gap-2 text-sm">
                    <div className="flex items-start gap-2">
                      <MapPin className="text-gray-400 mt-1" size={16} />
                      <span className="text-gray-600">{order.deliveryInfo.address}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone className="text-gray-400" size={16} />
                      <span className="text-gray-600">{order.deliveryInfo.phoneNumber}</span>
                    </div>
                    {order.deliveryInfo.deliveryDate && (
                      <div className="flex items-center gap-2">
                        <Calendar className="text-gray-400" size={16} />
                        <span className="text-gray-600">
                          {new Date(order.deliveryInfo.deliveryDate).toLocaleDateString('th-TH', {
                            day: '2-digit',
                            month: '2-digit',
                            year: 'numeric'
                          })}
                          {order.deliveryInfo.deliveryTime && (
                            <span className="ml-2 text-blue-600">เวลา {order.deliveryInfo.deliveryTime}</span>
                          )}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Order Items */}
                  <div className="bg-gray-50 rounded-lg p-3 mt-2">
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b border-gray-300">
                            <th className="text-left py-2 px-2 font-medium text-gray-700">สินค้า</th>
                            <th className="text-center py-2 px-2 font-medium text-gray-700">จำนวน</th>
                            <th className="text-center py-2 px-2 font-medium text-gray-700">ราคาต่อหน่วย</th>
                            <th className="text-right py-2 px-2 font-medium text-gray-700">ราคาทั้งหมด</th>
                          </tr>
                        </thead>
                        <tbody>
                          {order.orderSummary.items.map((item, idx) => (
                            <tr key={idx} className="border-b border-gray-200">
                              <td className="py-2 px-2 text-gray-600">{item.name}</td>
                              <td className="py-2 px-2 text-center font-medium text-gray-800">{item.quantity} ชิ้น</td>
                              <td className="py-2 px-2 text-center font-medium text-gray-800">
                                ฿{(item.total / item.quantity).toLocaleString()}
                              </td>
                              <td className="py-2 px-2 text-right font-medium text-blue-600">
                                ฿{item.total.toLocaleString()}
                              </td>
                            </tr>
                          ))}
                          <tr className="bg-gray-100">
                            <td className="py-2 px-2 font-medium text-gray-700" colSpan={3}>รวมทั้งหมด</td>
                            <td className="py-2 px-2 text-right font-medium text-green-600">
                              ฿{order.orderSummary.totalPrice.toLocaleString()}
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>


                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
    </div>
  );
};

export default DeliverySchedulePage;
