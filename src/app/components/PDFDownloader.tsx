'use client';
import React from 'react';
import { Download, FileText } from 'lucide-react';

interface Order {
  id: string;
  my_order_id?: string;
  deliveryInfo: {
    address: string;
    customerName: string;
    deliveryDate: string;
    phoneNumber: string;
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

interface PDFDownloaderProps {
  orders: Order[];
  selectedDate: Date;
}

const PDFDownloader: React.FC<PDFDownloaderProps> = ({ orders, selectedDate }) => {
  const generatePDF = async () => {
    // สร้าง HTML content สำหรับแต่ละออเดอร์
    const createOrderHTML = (order: Order, index: number) => {
      const thaiDate = selectedDate.toLocaleDateString('th-TH', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        weekday: 'long',
      });

      return `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Sarabun:wght@400;700&display=swap');
            body {
              font-family: 'Sarabun', sans-serif;
              margin: 0;
              padding: 20px;
              background: white;
              color: #333;
              min-height: 100vh;
            }
            .header {
              text-align: center;
              margin-bottom: 30px;
              border-bottom: 2px solid #3b82f6;
              padding-bottom: 20px;
            }
            .title {
              font-size: 24px;
              font-weight: bold;
              color: #3b82f6;
              margin-bottom: 10px;
            }
            .date {
              font-size: 16px;
              color: #6b7280;
            }
            .order {
              border: 1px solid #e5e7eb;
              border-radius: 8px;
              padding: 15px;
            }
            .order-header {
              display: flex;
              justify-content: space-between;
              align-items: center;
              margin-bottom: 15px;
              padding-bottom: 10px;
              border-bottom: 1px solid #e5e7eb;
            }
            .order-number {
              font-size: 16px;
              font-weight: bold;
              color: #3b82f6;
            }
            .order-id {
              font-size: 12px;
              color: #6b7280;
            }
            .customer-info {
              margin-bottom: 15px;
            }
            .info-row {
              margin-bottom: 5px;
              font-size: 14px;
            }
            .info-label {
              font-weight: bold;
              color: #374151;
              display: inline-block;
              width: 80px;
            }
            .items-section {
              margin-bottom: 15px;
            }
            .items-title {
              font-size: 14px;
              font-weight: bold;
              color: #6b7280;
              margin-bottom: 8px;
            }
            .items-table {
              width: 100%;
              border-collapse: collapse;
              font-size: 12px;
              margin-bottom: 10px;
            }
            .items-table th {
              background-color: #f3f4f6;
              border: 1px solid #d1d5db;
              padding: 6px 8px;
              text-align: center;
              font-weight: bold;
              color: #374151;
            }
            .items-table td {
              border: 1px solid #d1d5db;
              padding: 6px 8px;
            }
            .item-name {
              text-align: left;
              color: #374151;
            }
            .item-quantity {
              text-align: center;
              color: #1f2937;
              font-weight: bold;
            }
            .item-price {
              text-align: right;
              color: #3b82f6;
              font-weight: bold;
            }
            .total-row {
              background-color: #f3f4f6;
              font-weight: bold;
            }
            .total-row td {
              color: #059669;
            }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="title">รายการส่งของประจำวัน</div>
            <div class="date">วันที่: ${thaiDate}</div>
          </div>
          
          <div class="order">
            <div class="order-header">
              <div class="order-number">ออเดอร์ที่ ${index + 1}</div>
              <div class="order-id">หมายเลข: ${order.my_order_id || order.id}</div>
            </div>
            
            <div class="customer-info">
              <div class="info-row">
                <span class="info-label">ชื่อ:</span>
                <span>${order.deliveryInfo.customerName}</span>
              </div>
              <div class="info-row">
                <span class="info-label">เบอร์โทร:</span>
                <span>${order.deliveryInfo.phoneNumber}</span>
              </div>
              <div class="info-row">
                <span class="info-label">ที่อยู่:</span>
                <span>${order.deliveryInfo.address}</span>
              </div>
            </div>
            
            <div class="items-section">
              <div class="items-title">รายการสินค้า:</div>
              <table class="items-table">
                <thead>
                  <tr>
                    <th>สินค้า</th>
                    <th>จำนวน</th>
                    <th>ราคาต่อหน่วย</th>
                    <th>ราคาทั้งหมด</th>
                  </tr>
                </thead>
                <tbody>
                  ${order.orderSummary.items.map(item => `
                    <tr>
                      <td class="item-name">${item.name}</td>
                      <td class="item-quantity">${item.quantity} ชิ้น</td>
                      <td class="item-quantity">฿${(item.total / item.quantity).toLocaleString()}</td>
                      <td class="item-price">฿${item.total.toLocaleString()}</td>
                    </tr>
                  `).join('')}
                  <tr class="total-row">
                    <td colspan="3">รวมทั้งหมด</td>
                    <td class="item-price">฿${order.orderSummary.totalPrice.toLocaleString()}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </body>
        </html>
      `;
    };

    try {
      const { jsPDF } = await import('jspdf');
      const html2canvas = (await import('html2canvas')).default;
      
      // สร้าง PDF ใหม่
      const pdf = new jsPDF('p', 'mm', 'a4');
      
      // สร้าง PDF สำหรับแต่ละออเดอร์
      for (let i = 0; i < orders.length; i++) {
        const order = orders[i];
        
        // สร้าง iframe สำหรับแต่ละออเดอร์
        const iframe = document.createElement('iframe');
        iframe.style.position = 'absolute';
        iframe.style.left = '-9999px';
        iframe.style.top = '-9999px';
        iframe.style.width = '800px';
        iframe.style.height = '600px';
        document.body.appendChild(iframe);
        
        const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
        if (iframeDoc) {
          iframeDoc.open();
          iframeDoc.write(createOrderHTML(order, i));
          iframeDoc.close();
          
          // รอให้ content โหลดเสร็จ
          await new Promise(resolve => setTimeout(resolve, 500));
          
          // แปลง HTML เป็น canvas
          const canvas = await html2canvas(iframeDoc.body, {
            scale: 1.5,
            useCORS: true,
            allowTaint: true,
            backgroundColor: '#ffffff',
            height: iframeDoc.body.scrollHeight,
            windowHeight: iframeDoc.body.scrollHeight
          });
          
          // เพิ่มหน้าใหม่ (ยกเว้นหน้าแรก)
          if (i > 0) {
            pdf.addPage();
          }
          
          // เพิ่มรูปภาพลงใน PDF
          const imgData = canvas.toDataURL('image/png');
          const imgWidth = 210; // A4 width in mm
          const imgHeight = (canvas.height * imgWidth) / canvas.width;
          
          pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
          
          // ลบ iframe
          document.body.removeChild(iframe);
        }
      }
      
      // บันทึกไฟล์
      const dateStr = selectedDate.toISOString().split('T')[0];
      const fileName = `delivery_list_${dateStr}.pdf`;
      pdf.save(fileName);
      
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('เกิดข้อผิดพลาดในการสร้าง PDF');
    }
  };

  return (
    <button
      onClick={generatePDF}
      disabled={orders.length === 0}
      className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors shadow-md hover:shadow-lg disabled:bg-gray-400 disabled:cursor-not-allowed"
    >
      <FileText size={16} />
      <span className="text-sm font-medium">ดาวน์โหลดรายการส่งของ</span>
    </button>
  );
};

export default PDFDownloader; 