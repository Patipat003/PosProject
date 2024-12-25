import React from "react";
import InventoryForm from "../components/layout/ui/InventoryForm";

const InventoryPage = () => {
  return (
    <div>
      <h1 className="text-3xl font-bold mb-4">Inventory</h1>
      <p>Manage your inventory here.</p>
      <InventoryForm />
    </div>
  );
};

export default InventoryPage;
