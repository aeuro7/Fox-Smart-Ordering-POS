'use client';

import React, { useEffect, useState } from 'react';
import { db } from '@/app/firebase/config';
import { doc, updateDoc, deleteDoc } from 'firebase/firestore';
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
  deliveryInfo: {
    address: string;
    customerName: string;
    deliveryDate: string;
    phoneNumber: string;
    deliveryTime?: string;
  };
  orderSummary: {
    items: OrderItem[];
    totalItems: number;
    totalPrice: number;
  };
}

// แก้ไขตรงนี้ - เปลี่ยน params ให้เป็น Promise
type EditOrderPageProps = {
  params: Promise<{ orderId: string }>
}

export default function EditOrderPage({ params }: EditOrderPageProps) {
  const [order, setOrder] = useState<Order | null>(null);
  const [formData, setFormData] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [orderId, setOrderId] = useState<string>(''); // เพิ่ม state สำหรับเก็บ orderId
  const router = useRouter();

  // สินค้าทั้งหมดที่เลือกเพิ่มได้
  const products = [
    { id: 1, name: 'บุหรี่พวง', category: 'อื่นๆ', price: 150 },
    { id: 2, name: 'บุหรี่ถุง(10กิโล)', category: 'อื่นๆ', price: 300 },
    { id: 3, name: 'พวงหนังยาง', category: 'อื่นๆ', price: 50 },
    { id: 4, name: 'ปลาร้าบดถ้วย(1กิโล)', category: 'อื่นๆ', price: 50 },
    { id: 5, name: 'ปลาร้าตัวถ้วย(1กิโล)', category: 'อื่นๆ', price: 50 },
    { id: 6, name: 'ปลาร้าปิ้บ(22กิโล)', category: 'อื่นๆ', price: 600 },
  ];

  // state สำหรับ popup เพิ่มสินค้า
  const [showAddProduct, setShowAddProduct] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState<number>(products[0].id);
  const [selectedQty, setSelectedQty] = useState<number>(1);

  // เพิ่ม useEffect เพื่อ resolve params
  useEffect(() => {
    const getOrderId = async () => {
      try {
        const resolvedParams = await params;
        setOrderId(resolvedParams.orderId);
      } catch (error) {
        console.error('Error resolving params:', error);
      }
    };
    getOrderId();
  }, [params]);

  useEffect(() => {
    const fetchOrder = async () => {
      if (typeof window !== 'undefined') {
        const data = localStorage.getItem('edit_order_data');
        if (data) {
          const parsed: Order = JSON.parse(data);
          setOrder(parsed);
          setFormData(parsed);
        }
        setLoading(false);
      }
    };
    fetchOrder();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    if (!formData) return;
    const { name, value } = e.target;
    setFormData({
      ...formData,
      deliveryInfo: {
        ...formData.deliveryInfo,
        [name]: value,
      },
    });
  };

  const handleItemChange = (idx: number, value: number) => {
    if (!formData) return;
    const items = formData.orderSummary.items.map((item, i) =>
      i === idx
        ? { ...item, quantity: value, total: value * item.price }
        : item
    );
    const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
    const totalPrice = items.reduce((sum, item) => sum + item.total, 0);
    setFormData({
      ...formData,
      orderSummary: {
        ...formData.orderSummary,
        items,
        totalItems,
        totalPrice,
      },
    });
  };

  const handleRemoveItem = (idx: number) => {
    if (!formData) return;
    const items = formData.orderSummary.items.filter((_, i) => i !== idx);
    const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
    const totalPrice = items.reduce((sum, item) => sum + item.total, 0);
    setFormData({
      ...formData,
      orderSummary: {
        ...formData.orderSummary,
        items,
        totalItems,
        totalPrice,
      },
    });
  };

  const handleAddProduct = () => {
    if (!formData) return;
    const product = products.find(p => p.id === selectedProductId);
    if (!product) return;

    let found = false;
    const newItems = formData.orderSummary.items.map(item => {
      if (item.id === product.id) {
        found = true;
        const newQty = item.quantity + selectedQty;
        return { ...item, quantity: newQty, total: newQty * item.price };
      }
      return item;
    });

    let items = newItems;
    if (!found) {
      items = [
        ...formData.orderSummary.items,
        {
          id: product.id,
          name: product.name,
          price: product.price,
          quantity: selectedQty,
          total: product.price * selectedQty,
        },
      ];
    }

    const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
    const totalPrice = items.reduce((sum, item) => sum + item.total, 0);
    setFormData({
      ...formData,
      orderSummary: {
        ...formData.orderSummary,
        items,
        totalItems,
        totalPrice,
      },
    });
    setShowAddProduct(false);
    setSelectedProductId(products[0].id);
    setSelectedQty(1);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData) return;
    setSaving(true);
    try {
      await updateDoc(doc(db, 'orders', formData.id), {
        deliveryInfo: formData.deliveryInfo,
        orderSummary: formData.orderSummary,
      });
      localStorage.setItem('edit_order_data', JSON.stringify(formData));
      setOrder(formData);
      Swal.fire({
        title: 'บันทึกข้อมูลสำเร็จ',
        icon: 'success',
        confirmButtonText: 'ตกลง',
      });
      router.push('/Admin');
    } catch (err) {
      Swal.fire({
        title: 'เกิดข้อผิดพลาด',
        text: 'ไม่สามารถบันทึกข้อมูลได้',
        icon: 'error',
        confirmButtonText: 'ตกลง',
      });
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteOrder = async () => {
    if (!formData) return;
    const result = await Swal.fire({
      title: 'ยืนยันการลบออเดอร์นี้?',
      text: 'หากลบแล้วจะไม่สามารถกู้คืนได้',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'ลบ',
      cancelButtonText: 'ยกเลิก',
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
    });
    if (result.isConfirmed) {
      try {
        await deleteDoc(doc(db, 'orders', formData.id));
        Swal.fire({
          title: 'ลบออเดอร์สำเร็จ',
          icon: 'success',
          confirmButtonText: 'ตกลง',
        });
        router.push('/Admin');
      } catch (err) {
        Swal.fire({
          title: 'เกิดข้อผิดพลาด',
          text: 'ไม่สามารถลบออเดอร์ได้',
          icon: 'error',
          confirmButtonText: 'ตกลง',
        });
        console.error(err);
      }
    }
  };

  if (loading || !formData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-200 border-t-blue-600"></div>
          <p className="text-blue-600 font-medium">กำลังโหลดข้อมูล...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-blue-100 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-3 bg-white px-6 py-3 rounded-full shadow-lg">
            <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse"></div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              แก้ไขออเดอร์
            </h1>
          </div>
          <p className="text-gray-600 mt-3">จัดการและแก้ไขข้อมูลออเดอร์ของคุณ</p>
        </div>

        <form onSubmit={handleSave} className="space-y-8">
          <div className="grid lg:grid-cols-2 gap-8">
            {/* ข้อมูลผู้รับ */}
            <div className="bg-white rounded-2xl shadow-xl p-8 border border-blue-100">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <h2 className="text-xl font-bold text-gray-800">ข้อมูลผู้รับ</h2>
              </div>
              
              <div className="space-y-5">
                <div className="relative">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">ชื่อผู้รับ</label>
                  <input
                    type="text"
                    name="customerName"
                    value={formData.deliveryInfo.customerName}
                    onChange={handleChange}
                    className="w-full p-4 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all duration-200 text-gray-800"
                    placeholder="กรอกชื่อผู้รับ"
                    required
                  />
                </div>
                
                <div className="relative">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">เบอร์โทรศัพท์</label>
                  <input
                    type="tel"
                    name="phoneNumber"
                    value={formData.deliveryInfo.phoneNumber}
                    onChange={handleChange}
                    className="w-full p-4 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all duration-200 text-gray-800"
                    placeholder="กรอกเบอร์โทรศัพท์"
                    required
                  />
                </div>
                
                <div className="relative">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">ที่อยู่จัดส่ง</label>
                  <textarea
                    name="address"
                    value={formData.deliveryInfo.address}
                    onChange={handleChange}
                    rows={4}
                    className="w-full p-4 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all duration-200 resize-none text-gray-800"
                    placeholder="กรอกที่อยู่สำหรับจัดส่ง"
                    required
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">วันที่จัดส่ง</label>
                    <input
                      type="date"
                      name="deliveryDate"
                      value={formData.deliveryInfo.deliveryDate}
                      onChange={handleChange}
                      className="w-full p-4 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all duration-200 text-gray-800"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">เวลาจัดส่ง</label>
                    <input
                      type="time"
                      name="deliveryTime"
                      value={formData.deliveryInfo.deliveryTime || ''}
                      onChange={handleChange}
                      className="w-full p-4 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all duration-200 text-gray-800"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* รายการสินค้า */}
            <div className="bg-white rounded-2xl shadow-xl p-8 border border-blue-100">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                  </div>
                  <h2 className="text-xl font-bold text-gray-800">รายการสินค้า</h2>
                </div>
                <button
                  type="button"
                  className="inline-flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 font-semibold"
                  onClick={() => setShowAddProduct(true)}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  เพิ่มสินค้า
                </button>
              </div>
              
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {formData.orderSummary.items.length === 0 ? (
                  <div className="text-center py-12 text-gray-500">
                    <svg className="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                    </svg>
                    <p className="text-lg font-medium">ยังไม่มีสินค้าในรายการ</p>
                    <p className="text-sm">คลิกปุ่ม "เพิ่มสินค้า" เพื่อเริ่มต้น</p>
                  </div>
                ) : (
                  formData.orderSummary.items.map((item, idx) => (
                    <div key={item.id} className="bg-gray-50 rounded-xl p-4 border-2 border-gray-100 hover:border-blue-200 transition-all duration-200">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-800 mb-1">{item.name}</h3>
                          <p className="text-sm text-gray-600">฿{item.price.toLocaleString()} ต่อหน่วย</p>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="flex items-center gap-2">
                            <label className="text-sm font-medium text-gray-600">จำนวน:</label>
                            <input
                              type="number"
                              min={1}
                              value={item.quantity}
                              onChange={(e) => handleItemChange(idx, Math.max(1, Number(e.target.value)))}
                              className="w-20 p-2 text-amber-500 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all duration-200 text-center font-semibold"
                            />
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-blue-600">฿{item.total.toLocaleString()}</p>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleRemoveItem(idx)}
                            className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-all duration-200"
                            title="ลบสินค้า"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
              
              {formData.orderSummary.items.length > 0 && (
                <div className="mt-6 pt-6 border-t-2 border-gray-100">
                  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="text-gray-600">จำนวนสินค้าทั้งหมด</p>
                        <p className="text-2xl font-bold text-gray-800">{formData.orderSummary.totalItems} ชิ้น</p>
                      </div>
                      <div className="text-right">
                        <p className="text-gray-600">ยอดรวมทั้งหมด</p>
                        <p className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                          ฿{formData.orderSummary.totalPrice.toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* ปุ่มบันทึก */}
          <div className="flex justify-center pt-6">
            <div className="flex gap-4">
              <button
                type="button"
                onClick={() => router.push('/Admin')}
                className="px-8 py-4 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 font-semibold"
              >
                ยกเลิก
              </button>
              <button
                type="button"
                onClick={handleDeleteOrder}
                className="px-8 py-4 bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 font-semibold"
                disabled={saving}
              >
                ลบออเดอร์นี้
              </button>
              <button
                type="submit"
                className="px-8 py-4 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                disabled={saving}
              >
                {saving ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                    กำลังบันทึก...
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    บันทึกข้อมูล
                  </>
                )}
              </button>
            </div>
          </div>
        </form>

        {/* Popup เพิ่มสินค้า */}
        {showAddProduct && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md relative animate-in zoom-in duration-200">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-2xl font-bold text-gray-800">เพิ่มสินค้าใหม่</h3>
                  <button
                    type="button"
                    onClick={() => setShowAddProduct(false)}
                    className="p-2 hover:bg-gray-100 rounded-full transition-all duration-200"
                  >
                    <svg className="w-6 h-6 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                
                <div className="space-y-5">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">เลือกสินค้า</label>
                    <select
                      className="w-full p-4 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all duration-200 text-gray-800"
                      value={selectedProductId}
                      onChange={e => setSelectedProductId(Number(e.target.value))}
                    >
                      {products.map(p => (
                        <option key={p.id} value={p.id}>
                          {p.name} - ฿{p.price.toLocaleString()}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">จำนวน</label>
                    <input
                      type="number"
                      min={1}
                      className="w-full p-4 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all duration-200 text-gray-800"
                      value={selectedQty}
                      onChange={e => setSelectedQty(Math.max(1, Number(e.target.value)))}
                    />
                  </div>
                  
                  <div className="bg-blue-50 rounded-xl p-4">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">ราคารวม:</span>
                      <span className="text-xl font-bold text-blue-600">
                        ฿{((products.find(p => p.id === selectedProductId)?.price || 0) * selectedQty).toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="flex gap-3 mt-8">
                  <button
                    type="button"
                    className="flex-1 py-3 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-xl font-semibold transition-all duration-200"
                    onClick={() => setShowAddProduct(false)}
                  >
                    ยกเลิก
                  </button>
                  <button
                    type="button"
                    className="flex-1 py-3 bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white rounded-xl font-semibold transition-all duration-200"
                    onClick={handleAddProduct}
                  >
                    เพิ่มสินค้า
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
