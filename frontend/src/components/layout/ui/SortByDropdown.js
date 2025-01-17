const SortByDropdown = ({ onSortChange, currentSortKey, currentSortDirection }) => {
  const handleSortChange = (event) => {
    const [key, direction] = event.target.value.split(":");
    onSortChange(key, direction); // Send values to the parent component
  };

  // Only show the specific sort options required
  const sortOptions = [
    { key: "quantity", label: "Quantity" },
    { key: "updatedat", label: "Updated At" },
  ];

  return (
    <div className="flex items-center space-x-4 w-full">
      <label className="text-black font-semibold">Sort by</label>
      <select
        value={`${currentSortKey}:${currentSortDirection}`}  // Keep value controlled
        onChange={handleSortChange}
        className="select bg-white text-black select-bordered border border-gray-300 w-full max-w-xs rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-teal-500"
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
