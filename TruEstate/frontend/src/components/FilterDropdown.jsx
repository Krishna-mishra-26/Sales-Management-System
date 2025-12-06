import { useState, useRef, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';
import '../styles/FilterDropdown.css';

const FilterDropdown = ({ title, children, isActive, onClick }) => {
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        if (isActive) {
          onClick(); // Close if clicking outside
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isActive, onClick]);

  return (
    <div className="filter-dropdown" ref={dropdownRef}>
      <button className={`filter-btn ${isActive ? 'active' : ''}`} onClick={onClick}>
        <span>{title}</span>
        <ChevronDown size={16} />
      </button>
      {isActive && (
        <div className="dropdown-panel">
          {children}
        </div>
      )}
    </div>
  );
};

export default FilterDropdown;
