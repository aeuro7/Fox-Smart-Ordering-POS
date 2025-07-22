'use client';
import React, { useEffect, useState } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase/config';
import { Search, Filter, Calendar, Package, DollarSign, TrendingUp, ChevronDown, ChevronUp, Pencil } from 'lucide-react';
import { FaCheckCircle, FaSpinner, FaTimesCircle } from 'react-icons/fa';
import AdminNav from '../components/AdminNav';
import { useRouter } from 'next/navigation';
import Swal from 'sweetalert2';

interface OrderItem {
  id: number;
  name: string;
  price: number;
  quantity: number;
  total: number;
}

interface Order {
  id: string;
  createdAt: any;
  deliveryInfo: {
    address: string;
    customerName: string;
    deliveryDate: string;
    phoneNumber: string;
    deliveryTime?: string; // Added deliveryTime
  };
  orderSummary: {
    items: OrderItem[];
    totalItems: number;
    totalPrice: number;
  };
  user_doc_id: string;
  my_order_id?: string;
  deliveryStatus?: string; // เพิ่ม field สถานะจัดส่ง
}

const AdminPage = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFilter, setDateFilter] = useState('all');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [openOrderId, setOpenOrderId] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<'deliveryDate' | 'createdAt'>('deliveryDate'); // เพิ่ม state สำหรับการเรียง
  const router = useRouter();

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

    // ถ้าเช็คผ่านแล้วค่อยโหลดข้อมูล
    if (checkAdminRole()) {
      const fetchOrders = async () => {
        const querySnapshot = await getDocs(collection(db, 'orders'));
        const data: Order[] = querySnapshot.docs.map((doc) => {
          const d = doc.data();
          return {
            id: doc.id,
            createdAt: d.createdAt,
            deliveryInfo: d.deliveryInfo,
            orderSummary: d.orderSummary,
            user_doc_id: d.user_doc_id,
            my_order_id: d.my_order_id,
            deliveryStatus: d.deliveryStatus, // ดึงสถานะจัดส่ง
          };
        });
        setOrders(data);
        setFilteredOrders(data);
        setLoading(false);
      };
      fetchOrders();
    }
  }, [router]);

  useEffect(() => {
    filterOrders();
  }, [searchTerm, dateFilter, startDate, endDate, orders, sortBy]); // เพิ่ม sortBy ใน dependency

  const filterOrders = () => {
    let filtered = [...orders];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(order => 
        order.deliveryInfo.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.deliveryInfo.phoneNumber.includes(searchTerm) ||
        (order.my_order_id && order.my_order_id.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    // Date filter
    const today = new Date();
    switch (dateFilter) {
      case 'today':
        filtered = filtered.filter(order => {
          const orderDate = order.createdAt.toDate();
          return orderDate.toDateString() === today.toDateString();
        });
        break;
      case 'week':
        const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
        filtered = filtered.filter(order => {
          const orderDate = order.createdAt.toDate();
          return orderDate >= weekAgo;
        });
        break;
      case 'month':
        const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
        filtered = filtered.filter(order => {
          const orderDate = order.createdAt.toDate();
          return orderDate >= monthAgo;
        });
        break;
      case 'custom':
        if (startDate && endDate) {
          const start = new Date(startDate);
          const end = new Date(endDate);
          end.setHours(23, 59, 59, 999); // Set to end of day
          filtered = filtered.filter(order => {
            const orderDate = order.createdAt.toDate();
            return orderDate >= start && orderDate <= end;
          });
        }
        break;
    }

    // Sort
    filtered.sort((a, b) => {
      if (sortBy === 'deliveryDate') {
        // ถ้าไม่มีวันส่ง ให้ถือว่าอยู่ล่างสุด
        const aDate = a.deliveryInfo?.deliveryDate ? new Date(a.deliveryInfo.deliveryDate) : new Date(8640000000000000);
        const bDate = b.deliveryInfo?.deliveryDate ? new Date(b.deliveryInfo.deliveryDate) : new Date(8640000000000000);
        return aDate.getTime() - bDate.getTime(); // วันส่งเร็วสุดอยู่บนสุด
      } else {
        // createdAt
        const aDate = a.createdAt?.toDate ? a.createdAt.toDate() : new Date(0);
        const bDate = b.createdAt?.toDate ? b.createdAt.toDate() : new Date(0);
        return bDate.getTime() - aDate.getTime(); // ใหม่สุดอยู่บนสุด
      }
    });

    setFilteredOrders(filtered);
  };

  const getTotalRevenue = () => {
    return filteredOrders.reduce((sum, order) => sum + order.orderSummary.totalPrice, 0);
  };

  const getTotalItems = () => {
    return filteredOrders.reduce((sum, order) => sum + order.orderSummary.totalItems, 0);
  };

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
      
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">

      <div className="max-w mx-10">
        {/* Header */}
        <div className="bg-white rounded-2xl p-6 shadow-lg mb-6">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">แดชบอร์ดผู้ดูแลระบบ</h1>
          <p className="text-gray-600">จัดการและติดตามคำสั่งซื้อทั้งหมด</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="bg-white rounded-2xl p-6 shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-gray-600">ยอดขายรวม</h3>
              <DollarSign className="text-blue-500" />
            </div>
            <p className="text-3xl font-bold text-gray-800">฿{getTotalRevenue().toLocaleString()}</p>
          </div>
          <div className="bg-white rounded-2xl p-6 shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-gray-600">จำนวนออเดอร์</h3>
              <Package className="text-blue-500" />
            </div>
            <p className="text-3xl font-bold text-gray-800">{filteredOrders.length}</p>
          </div>
          <div className="bg-white rounded-2xl p-6 shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-gray-600">จำนวนสินค้ารวม</h3>
              <TrendingUp className="text-blue-500" />
            </div>
            <p className="text-3xl font-bold text-gray-800">{getTotalItems()}</p>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-2xl text-black p-6 shadow-lg mb-6">
          <div className="flex flex-col gap-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="ค้นหาตามชื่อ, เบอร์โทร หรือรหัสออเดอร์..."
                    className="w-full px-4 py-3 border-2 border-blue-200 rounded-xl focus:border-blue-400 focus:ring-4 focus:ring-blue-100 transition-all duration-200 pl-12"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                  <Search className="absolute left-4 top-3.5 text-gray-400" size={20} />
                </div>
              </div>
              <div className="w-full md:w-64">
                <select
                  value={dateFilter}
                  onChange={(e) => setDateFilter(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-blue-200 rounded-xl focus:border-blue-400 focus:ring-4 focus:ring-blue-100 transition-all duration-200 bg-white"
                >
                  <option value="all">ทั้งหมด</option>
                  <option value="today">วันนี้</option>
                  <option value="week">7 วันล่าสุด</option>
                  <option value="month">30 วันล่าสุด</option>
                  <option value="custom">ช่วงวันที่</option>
                </select>
              </div>
            </div>
            {/* ปุ่มเรียงลำดับ */}
            <div className="flex gap-2 mt-2">
              <button
                className={`px-4 py-2 rounded-lg border text-sm font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-200 ${sortBy === 'deliveryDate' ? 'bg-blue-500 text-white border-blue-500' : 'bg-white text-blue-600 border-blue-200 hover:bg-blue-50'}`}
                onClick={() => setSortBy('deliveryDate')}
                type="button"
              >
                เรียงตามวันส่ง (ด่วนสุดบนสุด)
              </button>
              <button
                className={`px-4 py-2 rounded-lg border text-sm font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-200 ${sortBy === 'createdAt' ? 'bg-blue-500 text-white border-blue-500' : 'bg-white text-blue-600 border-blue-200 hover:bg-blue-50'}`}
                onClick={() => setSortBy('createdAt')}
                type="button"
              >
                เรียงตามวันที่สร้าง (ใหม่สุดบนสุด)
              </button>
            </div>
            
            {/* Custom Date Range */}
            {dateFilter === 'custom' && (
              <div className="flex flex-col md:flex-row gap-4 p-4 bg-white rounded-xl border border-blue-200">
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 mb-2">วันที่เริ่มต้น</label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full px-4 py-3 border-2 border-blue-200 rounded-xl focus:border-blue-400 focus:ring-4 focus:ring-blue-100 transition-all duration-200"
                  />
                </div>
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 mb-2">วันที่สิ้นสุด</label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full px-4 py-3 border-2 border-blue-200 rounded-xl focus:border-blue-400 focus:ring-4 focus:ring-blue-100 transition-all duration-200"
                  />
                </div>
                <div className="flex items-end">
                  <button
                    onClick={() => {
                      setStartDate('');
                      setEndDate('');
                      setDateFilter('all');
                    }}
                    className="px-6 py-3 bg-red-500 text-white rounded-xl hover:bg-red-600 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-red-200"
                  >
                    ล้าง
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Orders Table */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">รหัสออเดอร์</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">วันที่สร้าง</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">ชื่อผู้รับ</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">ที่อยู่</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">เบอร์โทร</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">วันส่ง</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">สถานะจัดส่ง</th>
                <th className="px-6 py-4 text-right text-sm font-semibold text-gray-600">ราคารวม</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">รายการสินค้า</th>
                <th className="px-6 py-4 text-center text-sm font-semibold text-gray-600">แก้ไข</th>
              </tr>
            </thead>

              <tbody className="divide-y divide-gray-200">
                {filteredOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50 transition-colors duration-200">
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {order.my_order_id || '-'}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {order.createdAt?.toDate ? order.createdAt.toDate().toLocaleString('th-TH') : ''}
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-gray-800 whitespace-nowrap overflow-hidden text-ellipsis max-w-xs">
                      {order.deliveryInfo?.customerName}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      <div className="max-w-xs overflow-hidden text-ellipsis whitespace-pre-line line-clamp-3">
                        {order.deliveryInfo?.address}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {order.deliveryInfo?.phoneNumber}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600 whitespace-nowrap">
                      {order.deliveryInfo?.deliveryDate ? (
                        <>
                          {new Date(order.deliveryInfo.deliveryDate).toLocaleDateString('th-TH', {
                            day: '2-digit',
                            month: '2-digit',
                            year: 'numeric'
                          })}
                          {order.deliveryInfo?.deliveryTime && (
                            <span className="block text-xs text-blue-600 mt-1">เวลา {order.deliveryInfo.deliveryTime}</span>
                          )}
                        </>
                      ) : '-'}
                    </td>
                    <td className="px-6 py-4 text-sm text-center">
                      {order.deliveryStatus === 'done' ? (
                        <FaCheckCircle className="inline-flex text-green-600" size={24} />
                      ) : (
                        <FaTimesCircle className="inline-flex text-yellow-500" size={24} />
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm text-right font-medium text-gray-800">
                      ฿{order.orderSummary?.totalPrice?.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      <button
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg border border-blue-200 shadow-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-200 hover:bg-blue-50 active:scale-95 ${openOrderId === order.id ? 'bg-blue-100 text-blue-700' : 'bg-white text-blue-600'}`}
                        onClick={() => setOpenOrderId(openOrderId === order.id ? null : order.id)}
                        type="button"
                      >
                        {openOrderId === order.id ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                        <span className="font-medium text-xs whitespace-nowrap">ดูรายการ</span>
                      </button>
                      <div
                        className={`overflow-hidden transition-all duration-300 ${openOrderId === order.id ? 'max-h-96 opacity-100 mt-3' : 'max-h-0 opacity-0 mt-0'}`}
                        style={{ pointerEvents: openOrderId === order.id ? 'auto' : 'none' }}
                      >
                        {openOrderId === order.id && (
                          <>
                            <ul className="space-y-1 bg-blue-50 rounded-xl p-4 shadow-inner border border-blue-100">
                              {order.orderSummary?.items?.map((item, idx) => (
                                <li key={idx} className="flex items-center gap-2 border-b last:border-b-0 py-1">
                                  <span className="text-blue-400">•</span>
                                  <span className="font-semibold">{item.name}</span>
                                  <span className="text-gray-400">x</span>
                                  <span>{item.quantity}</span>
                                  <span className="text-gray-400">(฿{item.total?.toLocaleString()})</span>
                                </li>
                              ))}
                            </ul>
                            <div className="mt-4 flex justify-center">
                              <div className="inline-flex items-center gap-2 bg-blue-100 text-blue-800 rounded-xl px-4 py-2 shadow font-semibold text-base">
                                <TrendingUp size={18} className="text-blue-500" />
                                <span>จำนวนสินค้ารวม:</span>
                                <span className="text-blue-900 font-bold">{order.orderSummary?.totalItems}</span>
                              </div>
                            </div>
                          </>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <button
                        className="inline-flex items-center justify-center p-2 rounded-full hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-blue-200"
                        onClick={() => {
                          localStorage.setItem('edit_order_data', JSON.stringify(order));
                          router.push(`/Admin/edit/${order.id}`);
                        }}
                        title="แก้ไขออเดอร์"
                        type="button"
                      >
                        <Pencil size={18} className="text-blue-500" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
    </div>
  );
};

export default AdminPage;