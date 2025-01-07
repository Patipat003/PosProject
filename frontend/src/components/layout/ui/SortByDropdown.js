import React from "react";

// ฟังก์ชันสำหรับการเปลี่ยนแปลงการเรียงลำดับ
const SortByDropdown = ({ onSortChange, currentSortKey, currentSortDirection, sortOptions }) => {
  const handleSortChange = (event) => {
    const [key, direction] = event.target.value.split(":");
    onSortChange(key, direction); // ส่งค่าไปยังฟังก์ชันใน parent component
  };

  return (
    <div className="flex items-center space-x-4 m-4">
      <label className="text-black font-semibold">Sort by</label>
      <select
        value={`${currentSortKey}:${currentSortDirection}`}
        onChange={handleSortChange}
        className="select bg-white text-black select-bordered w-full max-w-xs"
      >
        {sortOptions.map((option) => (
          <option key={option.key} value={`${option.key}:asc`}>
            {option.label} (Ascending)
          </option>
        ))}
        {sortOptions.map((option) => (
          <option key={option.key} value={`${option.key}:desc`}>
            {option.label} (Descending)
          </option>
        ))}
      </select>
    </div>
  );
};

export default SortByDropdown;
