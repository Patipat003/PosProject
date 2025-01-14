import React from "react";
import { CSVLink } from "react-csv";
import { jsPDF } from "jspdf";
import { format } from "date-fns";

// ฟังก์ชันสำหรับการ Export ไปยัง PDF
const handleExportToPDF = (data, columns, filename = "export.pdf") => {
  if (!Array.isArray(data) || !Array.isArray(columns)) {
    console.error("Invalid data or columns");
    return;
  }

  const doc = new jsPDF();
  
  // Set font size and style
  doc.setFontSize(10);
  
  // Title at the top of the page
  doc.text("Data Export", 14, 10);

  // Format the date to a more readable format
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return format(date, "d/MM/yyyy, HH:mm"); // Use format from date-fns
  };

  // Column headers
  let y = 20;
  columns.forEach((column, index) => {
    doc.text(column, 9 + index * 50, y); // Increase the spacing between columns
    doc.rect(6 + index * 50, y - 5, 50, 10); // Draw border for header
  });

  // Data rows
  y += 10; // Add some space after headers
  data.forEach((item, index) => {
    columns.forEach((column, colIndex) => {
      let value = item[column] !== undefined && item[column] !== null ? item[column] : 'N/A'; // Handle undefined or null values
      if (column === 'createdat') {
        value = formatDate(value); // Format date field
      }
      // Text wrapping for long descriptions or text
      doc.text(String(value), 9 + colIndex * 50, y);  // Print value
      doc.rect(6 + colIndex * 50, y - 5, 50, 10); // Draw border around each cell
    });
    y += 10; // Move to next row
  });

  // Save PDF with the provided filename
  doc.save(filename);
};

const ExportButtons = ({ filteredTables, columns, filename = "file.pdf" }) => {
  if (!Array.isArray(filteredTables) || !Array.isArray(columns)) {
    console.error("Invalid data or columns passed to ExportButtons");
    return <div>Invalid data or columns</div>;
  }

  return (
    <div className="flex items-center space-x-4 mb-4">
      <button
        onClick={() => handleExportToPDF(filteredTables, columns, filename)}
        className="btn border-none bg-teal-500 text-white px-6 py-3 rounded hover:bg-teal-600 transition duration-300 mt-4"
      >
        Export to PDF
      </button>
      <CSVLink
        data={filteredTables}
        filename={filename.replace(".pdf", ".csv")} // Dynamically set the CSV filename
        className="btn border-none bg-teal-500 text-white px-6 py-3 rounded hover:bg-teal-600 transition duration-300 mt-4"
      >
        Export to CSV
      </CSVLink>
    </div>
  );
};

export default ExportButtons;
