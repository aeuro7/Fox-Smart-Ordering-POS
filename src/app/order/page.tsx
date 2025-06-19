'use client'

import React, { useState, useRef, useEffect } from 'react';

const ProductOrderPage = () => {
  type QuantitiesType = { [key: number]: number };
  const [quantities, setQuantities] = useState<QuantitiesType>({});
  const [openDropdown, setOpenDropdown] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const dropdownRefs = useRef<{ [key: number]: HTMLDivElement | null }>({});

  const products = [
    { id: 1, name: 'แอปเปิ้ล', emoji: '🍎', category: 'ผลไม้', price: 45 },
    { id: 2, name: 'ส้ม', emoji: '🍊', category: 'ผลไม้', price: 35 },
    { id: 3, name: 'กีวี่', emoji: '🥝', category: 'ผลไม้', price: 80 },
    { id: 4, name: 'มะเขือเทศ', emoji: '🍅', category: 'ผัก', price: 25 },
    { id: 5, name: 'แครอท', emoji: '🥕', category: 'ผัก', price: 30 },
    { id: 6, name: 'บรอกโคลี่', emoji: '🥦', category: 'ผัก', price: 40 },
    { id: 7, name: 'กล้วย', emoji: '🍌', category: 'ผลไม้', price: 20 },
    { id: 8, name: 'องุ่น', emoji: '🍇', category: 'ผลไม้', price: 120 },
    { id: 9, name: 'มะม่วง', emoji: '🥭', category: 'ผลไม้', price: 65 },
    { id: 10, name: 'อะโวคาโด', emoji: '🥑', category: 'ผลไม้', price: 85 }
  ];

  // Filter products based on search
  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Calculate totals
  const totalItems = Object.values(quantities).reduce((sum, qty) => sum + qty, 0);
  const totalPrice = products.reduce((sum, product) => {
    const qty = quantities[product.id] || 0;
    return sum + (qty * product.price);
  }, 0);

  // Get order items for confirmation
  const orderItems = products
    .filter((product) => quantities[product.id] > 0)
    .map((product) => ({
      id: product.id,
      name: product.name,
      emoji: product.emoji,
      quantity: quantities[product.id],
      price: product.price,
      total: quantities[product.id] * product.price
    }));

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        openDropdown !== null &&
        dropdownRefs.current[openDropdown] &&
        !dropdownRefs.current[openDropdown]?.contains(event.target as Node)
      ) {
        setOpenDropdown(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [openDropdown]);

  const handleQuantityChange = (productId: number, value: string) => {
    let cleaned = value.replace(/^0+(?!$)/, '');
    const numValue = Math.max(0, Math.min(100, parseInt(cleaned) || 0));
    setQuantities((prev) => ({
      ...prev,
      [productId]: numValue,
    }));
  };

  const incrementQuantity = (productId: number) => {
    const current = quantities[productId] || 0;
    if (current < 100) {
      setQuantities((prev) => ({
        ...prev,
        [productId]: current + 1,
      }));
    }
  };

  const decrementQuantity = (productId: number) => {
    const current = quantities[productId] || 0;
    if (current > 0) {
      setQuantities((prev) => ({
        ...prev,
        [productId]: current - 1,
      }));
    }
  };

  const handleDropdownSelect = (productId: number, value: number) => {
    setQuantities((prev) => ({
      ...prev,
      [productId]: value,
    }));
    setOpenDropdown(null);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (orderItems.length === 0) {
      alert('กรุณาเลือกสินค้าอย่างน้อย 1 รายการ');
      return;
    }

    setShowConfirmModal(true);
  };

  const confirmOrder = async () => {
    setIsSubmitting(true);
    setShowConfirmModal(false);

    await new Promise(resolve => setTimeout(resolve, 2000));

    const orderSummary = `
🎉 สั่งซื้อสำเร็จ!
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
${orderItems.map(item => 
`${item.emoji} ${item.name}: ${item.quantity} ชิ้น × ${item.price}฿ = ${item.total}฿`
).join('\n')}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📦 จำนวนทั้งหมด: ${totalItems} ชิ้น
💰 ราคารวม: ${totalPrice.toLocaleString()}฿

ขอบคุณที่ใช้บริการ! 🙏
    `;

    alert(orderSummary);
    setQuantities({});
    setIsSubmitting(false);
  };

  const generateOptions = () => {
    return Array.from({ length: 101 }, (_, i) => i);
  };

  const clearAll = () => {
    setQuantities({});
  };

  // Icons
  const ChevronDown = ({ className }: { className?: string }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
    </svg>
  );

  const SearchIcon = ({ className }: { className?: string }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
    </svg>
  );

  const TrashIcon = ({ className }: { className?: string }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
    </svg>
  );

  const PlusIcon = ({ className }: { className?: string }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
    </svg>
  );

  const MinusIcon = ({ className }: { className?: string }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
    </svg>
  );

  const XIcon = ({ className }: { className?: string }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
    </svg>
  );

  const CheckIcon = ({ className }: { className?: string }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
    </svg>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Header */}
      <div className="bg-white/95 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-40">
        <div className="px-4 py-4">
          <div className="text-center mb-4">
            <h1 className="text-2xl md:text-4xl font-bold text-gray-900 flex items-center justify-center gap-2">
              <span className="text-3xl md:text-4xl">🛒</span>
              <span className="hidden sm:inline">ระบบสั่งซื้อสินค้า</span>
              <span className="sm:hidden">สั่งซื้อสินค้า</span>
            </h1>
            <p className="text-gray-600 text-sm mt-1">เลือกสินค้าคุณภาพดี ราคาเป็นธรรม</p>
          </div>
          
          {/* Summary Bar */}
          <div className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-2xl p-4">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-blue-100 text-sm">จำนวนสินค้า</p>
                <p className="text-xl md:text-2xl font-bold">{totalItems} ชิ้น</p>
              </div>
              <div className="text-right">
                <p className="text-blue-100 text-sm">ราคารวม</p>
                <p className="text-xl md:text-2xl font-bold">{totalPrice.toLocaleString()}฿</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-6">
        {/* Search and Controls */}
        <div className="bg-white rounded-2xl p-4 md:p-6 shadow-lg mb-6">
          <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
            <div className="text-black relative flex-1">
              <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="ค้นหาสินค้า..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-400 focus:ring-4 focus:ring-blue-100 transition-all duration-200 text-base"
              />
            </div>

            <button
              type="button"
              onClick={clearAll}
              className="flex items-center justify-center gap-2 px-4 py-3 bg-red-500 hover:bg-red-600 text-white rounded-xl transition-all duration-200 font-medium min-w-[120px]"
            >
              <TrashIcon className="w-5 h-5" />
              <span className="hidden sm:inline">ล้างทั้งหมด</span>
              <span className="sm:hidden">ล้าง</span>
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Products Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-6">
            {filteredProducts.map((product) => (
              <div
                key={product.id}
                className="bg-white rounded-2xl p-4 md:p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="text-3xl md:text-4xl">{product.emoji}</div>
                    <div>
                      <h3 className="text-base md:text-lg font-semibold text-gray-800">
                        {product.name}
                      </h3>
                      <span className="text-xs text-blue-600 bg-blue-100 px-2 py-1 rounded-full">
                        {product.category}
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-lg md:text-2xl font-bold text-green-600">{product.price}฿</p>
                    <p className="text-xs text-gray-500">ต่อชิ้น</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-center space-x-4">
                    <button
                      type="button"
                      onClick={() => decrementQuantity(product.id)}
                      className="w-12 h-12 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center shadow-lg active:scale-95 transition-all duration-150"
                      disabled={!quantities[product.id] || quantities[product.id] === 0}
                    >
                      <MinusIcon className="w-6 h-6" />
                    </button>

                    <div className="flex-1 max-w-[120px]">
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={quantities[product.id] !== undefined ? quantities[product.id] : ''}
                        onChange={(e) => handleQuantityChange(product.id, e.target.value)}
                        className="w-full px-3 py-3 border-2 border-blue-200 rounded-xl focus:border-blue-400 focus:ring-4 focus:ring-blue-100 transition-all duration-200 text-center font-bold text-lg text-black appearance-none [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none [-moz-appearance:textfield] bg-blue-50"
                        placeholder="0"
                      />
                    </div>

                    <button
                      type="button"
                      onClick={() => incrementQuantity(product.id)}
                      className="w-12 h-12 bg-green-500 hover:bg-green-600 text-white rounded-full flex items-center justify-center shadow-lg active:scale-95 transition-all duration-150"
                      disabled={quantities[product.id] >= 100}
                    >
                      <PlusIcon className="w-6 h-6" />
                    </button>
                  </div>

                  <div className="flex justify-center">
                    <div
                      className="relative"
                      ref={(el) => {
                        dropdownRefs.current[product.id] = el;
                      }}
                    >
                      <button
                        type="button"
                        onClick={() => setOpenDropdown(openDropdown === product.id ? null : product.id)}
                        className="px-6 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-full shadow-md hover:shadow-lg transition-all duration-200 flex items-center space-x-2 text-sm"
                      >
                        <span>เลือกจำนวน</span>
                        <ChevronDown
                          className={`w-4 h-4 transition-transform duration-200 ${
                            openDropdown === product.id ? 'rotate-180' : ''
                          }`}
                        />
                      </button>

                      {openDropdown === product.id && (
                        <div className="absolute top-full mt-2 left-1/2 transform -translate-x-1/2 bg-white border border-gray-300 rounded-xl shadow-xl z-10 w-40 max-h-48 overflow-y-auto">
                          <div className="grid grid-cols-5 gap-1 p-2">
                            {generateOptions().map((option) => (
                              <button
                                key={option}
                                type="button"
                                onClick={() => handleDropdownSelect(product.id, option)}
                                className="text-black p-2 hover:bg-blue-50 text-sm transition-colors duration-150 rounded-lg font-medium"
                              >
                                {option}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {quantities[product.id] > 0 && (
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <div className="bg-green-50 rounded-xl p-3 text-center">
                      <p className="text-sm text-gray-600 mb-1">ราคารวม</p>
                      <p className="font-bold text-green-600 text-xl">
                        {((quantities[product.id] || 0) * product.price).toLocaleString()}฿
                      </p>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          {filteredProducts.length === 0 && (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">🔍</div>
              <h3 className="text-xl font-semibold text-gray-600 mb-2">ไม่พบสินค้าที่ค้นหา</h3>
              <p className="text-gray-500">ลองเปลี่ยนคำค้นหาหรือเลือกดูสินค้าทั้งหมด</p>
            </div>
          )}

          {/* Submit Button */}
          <div className="pt-4">
            <button
              type="submit"
              disabled={isSubmitting || totalItems === 0}
              className={`w-full py-4 px-6 font-semibold text-base md:text-lg rounded-full shadow-lg transition-all duration-300 ${
                isSubmitting || totalItems === 0
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white hover:shadow-xl active:scale-98'
              }`}
            >
              {isSubmitting ? (
                <div className="flex items-center justify-center gap-3">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  กำลังประมวลผล...
                </div>
              ) : (
                <>
                  <span className="hidden sm:inline">🚀 ส่งรายการสั่งซื้อ ({totalItems} ชิ้น - {totalPrice.toLocaleString()}฿)</span>
                  <span className="sm:hidden">🚀 สั่งซื้อ ({totalItems} ชิ้น - {totalPrice.toLocaleString()}฿)</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Confirmation Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                  <span className="text-3xl">🛒</span>
                  ยืนยันการสั่งซื้อ
                </h2>
                <button
                  onClick={() => setShowConfirmModal(false)}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <XIcon className="w-6 h-6 text-gray-500" />
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-6">
              <div className="space-y-4">
                <h3 className="font-semibold text-gray-800 mb-3">รายการสินค้าที่สั่งซื้อ:</h3>
                
                {orderItems.map((item) => (
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

                {/* Total Summary */}
                <div className="border-t border-gray-200 pt-4 mt-6">
                  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-gray-700">จำนวนทั้งหมด:</span>
                      <span className="font-bold text-gray-900">{totalItems} ชิ้น</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-lg font-semibold text-gray-700">ราคารวมทั้งสิ้น:</span>
                      <span className="text-2xl font-bold text-green-600">{totalPrice.toLocaleString()}฿</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-6 border-t border-gray-200">
              <div className="flex gap-3">
                <button
                  onClick={() => setShowConfirmModal(false)}
                  className="flex-1 py-3 px-4 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-xl font-medium transition-colors"
                >
                  ยกเลิก
                </button>
                <button
                  onClick={confirmOrder}
                  className="flex-1 py-3 px-4 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white rounded-xl font-medium transition-all duration-200 flex items-center justify-center gap-2"
                >
                  <CheckIcon className="w-5 h-5" />
                  ยืนยันสั่งซื้อ
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="h-6 md:hidden"></div>
    </div>
  );
};

export default ProductOrderPage;