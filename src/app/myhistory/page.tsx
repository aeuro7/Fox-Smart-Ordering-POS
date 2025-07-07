"use client";

import React, { useEffect, useState } from "react";
import { db } from "../firebase/config";
import { collection, query, where, getDocs } from "firebase/firestore";
import Navbar from "../components/Nav";

interface OrderItem {
  name: string;
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
  };
  orderSummary: {
    items: OrderItem[];
    totalItems?: number;
    totalPrice: number;
  };
  user_doc_id: string;
  my_order_id?: string;
}

// ฟังก์ชันแปลงวันที่ yyyy-mm-dd หรือ yyyy/mm/dd เป็น dd-mm-yyyy
function formatDateToDDMMYYYY(dateStr: string): string {
  if (!dateStr) return "";
  const parts = dateStr.includes("-") ? dateStr.split("-") : dateStr.split("/");
  if (parts.length !== 3) return dateStr;
  return `${parts[2]}-${parts[1]}-${parts[0]}`;
}

// ฟังก์ชันแปลง Firestore Timestamp เป็น dd-mm-yyyy HH:MM:SS
function formatTimestampToDDMMYYYY_HHMMSS(timestamp: any): string {
  if (!timestamp || !timestamp.seconds) return "";
  const date = new Date(timestamp.seconds * 1000);
  const pad = (n: number) => n.toString().padStart(2, '0');
  const day = pad(date.getDate());
  const month = pad(date.getMonth() + 1);
  const year = date.getFullYear();
  const hour = pad(date.getHours());
  const min = pad(date.getMinutes());
  const sec = pad(date.getSeconds());
  return `${day}-${month}-${year} ${hour}:${min}:${sec}`;
}

// ฟังก์ชันแปลง Firestore Timestamp เป็น yyyy-mm-dd (สำหรับ filter)
function formatTimestampToYYYYMMDD(timestamp: any): string {
  if (!timestamp || !timestamp.seconds) return "";
  const date = new Date(timestamp.seconds * 1000);
  const pad = (n: number) => n.toString().padStart(2, '0');
  const year = date.getFullYear();
  const month = pad(date.getMonth() + 1);
  const day = pad(date.getDate());
  return `${year}-${month}-${day}`;
}

const MyHistoryPage = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
  const [filterDate, setFilterDate] = useState<string>("");

  useEffect(() => {
    const fetchOrders = async () => {
      setLoading(true);
      let userDocId = "";
      if (typeof window !== "undefined") {
        userDocId = localStorage.getItem("user_doc_id") || "";
      }
      if (!userDocId) {
        setOrders([]);
        setLoading(false);
        return;
      }
      const q = query(collection(db, "orders"), where("user_doc_id", "==", userDocId));
      const querySnapshot = await getDocs(q);
      const data: Order[] = querySnapshot.docs.map((doc) => {
        const d = doc.data();
        return {
          id: doc.id,
          createdAt: d.createdAt,
          deliveryInfo: d.deliveryInfo,
          orderSummary: d.orderSummary,
          user_doc_id: d.user_doc_id,
          my_order_id: d.my_order_id,
        };
      });
      setOrders(data);
      setFilteredOrders(data);
      setLoading(false);
    };
    fetchOrders();
  }, []);

  const handleFilterChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setFilterDate(value);
    if (value) {
      const filtered = orders.filter(order =>
        formatTimestampToYYYYMMDD(order.createdAt) === value
      );
      setFilteredOrders(filtered);
    } else {
      setFilteredOrders(orders);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100">
      <Navbar />
      <div className="max-w-2xl mx-auto p-4 sm:p-6">
        <h1 className="text-2xl font-bold mb-6 mt-5 text-center text-gray-900 ">📄 ประวัติการสั่งซื้อของฉัน</h1>
        <div className="mb-4">
          <label htmlFor="filter-date" className="block sm:inline-block text-sm font-medium text-gray-700 mr-2 mb-1 sm:mb-0">กรองตามวันที่สั่งซื้อ:</label>
          <div className="relative inline-block w-full sm:w-auto align-middle">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <svg className="w-5 h-5 text-gray-900" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2" stroke="currentColor" strokeWidth="2" fill="none"/>
                <line x1="16" y1="2" x2="16" y2="6" stroke="currentColor" strokeWidth="2"/>
                <line x1="8" y1="2" x2="8" y2="6" stroke="currentColor" strokeWidth="2"/>
                <line x1="3" y1="10" x2="21" y2="10" stroke="currentColor" strokeWidth="2"/>
              </svg>
            </span>
            <input
              type="date"
              id="filter-date"
              value={filterDate}
              onChange={handleFilterChange}
              className="pl-10 pr-4 py-2 w-full sm:w-56 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition placeholder-gray-400 text-blue-700 bg-white hover:border-blue-400 outline-none"
            />
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500"></div>
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="text-center text-gray-500">ไม่พบประวัติการสั่งซื้อ</div>
        ) : (
          <ul className="space-y-10">
            {filteredOrders.map((order) => (
              <li
                key={order.id}
                className="border border-gray-300 rounded-2xl p-4 sm:p-8 bg-white shadow-xl hover:shadow-2xl transition-transform duration-300 hover:scale-105 flex flex-col gap-4 sm:gap-6"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="text-lg font-semibold text-blue-800">
                    รหัสออเดอร์: <span className="text-gray-700">{order.my_order_id || order.id}</span>
                  </div>
                  <div className="text-sm text-gray-500">วันที่สั่งซื้อ: {formatTimestampToDDMMYYYY_HHMMSS(order.createdAt)}</div>
                </div>
                <div className="text-gray-700 space-y-2 mb-4">
                  <div className="flex items-center gap-2">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                      <circle cx="12" cy="7" r="4"></circle>
                    </svg>
                    วันที่จัดส่ง: {formatDateToDDMMYYYY(order.deliveryInfo.deliveryDate)}
                  </div>
                  <div className="flex items-center gap-2">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                      <polyline points="22,6 12,13 2,6"></polyline>
                    </svg>
                    ชื่อผู้รับ: {order.deliveryInfo.customerName}
                  </div>
                  <div className="flex items-center gap-2">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                      <polyline points="9 22 9 12 15 12 15 22"></polyline>
                    </svg>
                    ที่อยู่: {order.deliveryInfo.address}
                  </div>
                  <div className="flex items-center gap-2">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
                    </svg>
                    เบอร์โทร: {order.deliveryInfo.phoneNumber}
                  </div>
                </div>
                <div className="mt-2 mb-4">
                  <div className="font-semibold text-blue-600 mb-2 text-lg">รายการสินค้า</div>
                  <ul className="ml-6 list-disc text-gray-800 space-y-2">
                    {order.orderSummary.items.map((item, idx) => (
                      <li key={idx} className="flex justify-between items-center">
                        <span>{item.name} x {item.quantity}</span>
                        <span className="font-medium text-blue-700">฿{item.total.toLocaleString()}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="mt-2 pt-4 border-t border-gray-200 flex justify-between items-center">
                  <span className="font-bold text-xl text-green-600">รวมทั้งสิ้น:</span>
                  <span className="font-bold text-xl text-green-600">฿{order.orderSummary.totalPrice.toLocaleString()}</span>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default MyHistoryPage;
