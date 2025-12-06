import { ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';
import '../styles/SortingDropdown.css';

const SortingDropdown = ({ sortBy, sortOrder, onSortChange }) => {
  const sortOptions = [
    { value: 'date', label: 'Date' },
    { value: 'quantity', label: 'Quantity' },
    { value: 'customerName', label: 'Customer Name' }
  ];

  return (
    <div className="sorting-dropdown">
      <label className="sort-label">Sort by:</label>
      <div className="sort-controls">
        {sortOptions.map(option => (
          <button
            key={option.value}
            className={`sort-btn ${sortBy === option.value ? 'active' : ''}`}
            onClick={() => onSortChange(option.value)}
          >
            <span>{option.label}</span>
            {sortBy === option.value && (
              sortOrder === 'asc' ? <ArrowUp size={16} /> : <ArrowDown size={16} />
            )}
            {sortBy !== option.value && <ArrowUpDown size={16} />}
          </button>
        ))}
      </div>
    </div>
  );
};

export default SortingDropdown;
