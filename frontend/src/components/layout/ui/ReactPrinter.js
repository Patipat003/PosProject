import React from 'react';

const ReactPrinter = ({ modalData }) => {
  const { receiptnumber, createdat, items, bname, location } = modalData;

  return (
    <div className="receipt-container">
      <div className="text-center mb-6">
        <h1 className="text-2xl font-bold">Store ({bname})</h1>  {/* Display branch name */}
        <p className="text-sm">Location: {location}</p>  {/* Display branch location */}
        <p className="text-sm">Phone: 123-456-7890</p>
        <p className="text-sm">www.storewebsite.com</p>
      </div>
      
      <div className="border-t border-gray-300 pt-4 mb-6">
        <h2 className="text-lg font-bold mb-2">Receipt #{receiptnumber}</h2>
        <p className="text-sm mb-2">Created At: {createdat}</p>
      </div>

      <div className="border border-gray-300 p-4 rounded">
        <table className="w-full text-sm">
          <thead>
            <tr>
              <th className="text-left">Item</th>
              <th className="text-right">Qty</th>
              <th className="text-right">Price</th>
              <th className="text-right">Total</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item, index) => (
              <tr key={index}>
                <td>{item.productname}</td>
                <td className="text-right">{item.quantity}</td>
                <td className="text-right">{item.price.toFixed(2)}</td>
                <td className="text-right">
                  {(item.quantity * item.price).toFixed(2)}
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr>
              <td className="font-bold">Total</td>
              <td></td>
              <td></td>
              <td className="font-bold text-right">
                {items
                  .reduce(
                    (total, item) => total + item.quantity * item.price,
                    0
                  )
                  .toFixed(2)}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>

      <div className="border-t border-gray-300 pt-4 mt-6">
        <div className="flex justify-between">
          <span className="text-sm">Thank you for shopping with us!</span>
        </div>
      </div>
    </div>
  );
};

export default ReactPrinter;
