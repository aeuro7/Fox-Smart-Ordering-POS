'use client';
import React, { useEffect, useState } from 'react';
import { collection, getDocs, updateDoc, doc } from 'firebase/firestore';
import { db } from '../firebase/config';
import { FaCheckCircle, FaTimesCircle } from 'react-icons/fa';
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
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
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
      setLoading(false);
    };
    fetchOrders();
  }, []);

  const updateDeliveryStatus = async (orderId: string, status: string) => {
    const orderRef = doc(db, 'orders', orderId);
    await updateDoc(orderRef, { deliveryStatus: status });
    setOrders((prev) =>
      prev.map((order) => (order.id === orderId ? { ...order, deliveryStatus: status } : order))
    );
    Swal.fire({
      title: 'สถานะจัดส่งถูกอัปเดต',
      text: `สถานะจัดส่งของออเดอร์ ${orderId} ถูกเปลี่ยนเป็น ${status}`,
      icon: 'success',
      confirmButtonText: 'ตกลง',
      customClass: {
        popup: 'rounded-2xl',
        confirmButton: 'swal2-theme-confirm',
      },
    });
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

          {/* Orders Table */}
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">รหัสออเดอร์</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">ชื่อผู้รับ</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">สถานะจัดส่ง</th>
                    <th className="px-6 py-4 text-right text-sm font-semibold text-gray-600">ราคารวม</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {orders.map((order) => (
                    <tr key={order.id} className="hover:bg-gray-50 transition-colors duration-200">
                      <td className="px-6 py-4 text-sm text-gray-600">{order.my_order_id || '-'}</td>
                      <td className="px-6 py-4 text-sm font-medium text-gray-800 whitespace-nowrap overflow-hidden text-ellipsis max-w-xs">
                        {order.deliveryInfo?.customerName}
                      </td>
                      <td className="px-6 py-4 text-sm text-center">
                        <div className="flex justify-center gap-2">
                          <button
                            onClick={() => updateDeliveryStatus(order.id, 'done')}
                            className={`flex items-center px-3 py-1 rounded-lg border ${order.deliveryStatus === 'done' ? 'bg-green-500 text-white' : 'bg-white text-green-600 border-green-600 hover:bg-green-100'}`}
                          >
                            <FaCheckCircle className="mr-1" />
                            จัดส่งแล้ว
                          </button>
                          <button
                            onClick={() => updateDeliveryStatus(order.id, 'pending')}
                            className={`flex items-center px-3 py-1 rounded-lg border ${order.deliveryStatus === 'pending' ? 'bg-red-500 text-white' : 'bg-white text-red-600 border-red-600 hover:bg-red-100'}`}
                          >
                            <FaTimesCircle className="mr-1" />
                            ยังไม่จัดส่ง
                          </button>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-right font-medium text-gray-800">
                        ฿{order.orderSummary?.totalPrice?.toLocaleString()}
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
