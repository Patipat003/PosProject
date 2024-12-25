// components/ExportButtons.js
import React from "react";
import { CSVLink } from "react-csv";
import { jsPDF } from "jspdf";

const ExportButtons = ({ filteredProducts }) => {
  const handleExportToPDF = () => {
    const doc = new jsPDF();
    doc.text("Product List", 10, 10);
    filteredProducts.forEach((product, index) => {
      doc.text(`${index + 1}. ${product.name} - ${product.category}`, 10, 20 + index * 10);
    });
    doc.save("products.pdf");
  };

  return (
    <div className="flex items-center space-x-4 mb-4">
      <button
        onClick={handleExportToPDF}
        className="bg-base-200 text-white px-6 py-3 rounded hover:bg-gray-700 transition duration-300 mt-4"
      >
        Export to PDF
      </button>
      <CSVLink
        data={filteredProducts}
        filename="products.csv"
        className="bg-base-200 text-white px-6 py-3 rounded hover:bg-gray-700 transition duration-300 mt-4"
      >
        Export to CSV
      </CSVLink>
    </div>
  );
};

export default ExportButtons;
