import React from "react";

const SalesPage = () => {
  return (
    <div>
      <h1 className="text-3xl font-bold mb-4">Sales Product</h1>
      <p>Manage your sales here. This page will display products available for sale.</p>
      
      {/* ตัวอย่างฟอร์มหรือข้อมูลการขาย */}
      <div className="mt-6">
        <h2 className="text-xl font-semibold">Product List</h2>
        <ul className="space-y-4 mt-4">
          <li className="p-4 border rounded-lg bg-white shadow-sm">
            <div className="flex justify-between">
              <span>Product A</span>
              <button className="bg-blue-500 text-white px-4 py-2 rounded-md">Sell</button>
            </div>
          </li>
          <li className="p-4 border rounded-lg bg-white shadow-sm">
            <div className="flex justify-between">
              <span>Product B</span>
              <button className="bg-blue-500 text-white px-4 py-2 rounded-md">Sell</button>
            </div>
          </li>
          {/* เพิ่มสินค้าอื่น ๆ */}
        </ul>
      </div>
    </div>
  );
};

export default SalesPage;
  