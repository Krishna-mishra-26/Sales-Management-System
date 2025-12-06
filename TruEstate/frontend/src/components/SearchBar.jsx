import { useState, useEffect, useRef } from 'react';
import { Search, X, User, Hash } from 'lucide-react';
import { fetchSuggestions } from '../services/api';
import '../styles/SearchBar.css';

const SearchBar = ({ value, onChange, placeholder }) => {
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const wrapperRef = useRef(null);
  const hideTimeoutRef = useRef(null);
  const isHoveredRef = useRef(false);

  const clearHideTimer = () => {
    if (hideTimeoutRef.current) {
      clearTimeout(hideTimeoutRef.current);
      hideTimeoutRef.current = null;
    }
  };

  const startHideTimer = () => {
    clearHideTimer();
    if (showSuggestions && !isHoveredRef.current) {
      hideTimeoutRef.current = setTimeout(() => {
        setShowSuggestions(false);
      }, 2500);
    }
  };

  const handleMouseEnter = () => {
    isHoveredRef.current = true;
    clearHideTimer();
  };

  const handleMouseLeave = () => {
    isHoveredRef.current = false;
    startHideTimer();
  };

  useEffect(() => {
    startHideTimer();
    return () => clearHideTimer();
  }, [suggestions, showSuggestions]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const getSuggestions = async () => {
      if (value.length >= 2) {
        const results = await fetchSuggestions(value);
        setSuggestions(results);
        setShowSuggestions(results.length > 0);
      } else {
        setSuggestions([]);
        setShowSuggestions(false);
      }
    };

    const timeoutId = setTimeout(getSuggestions, 300);
    return () => clearTimeout(timeoutId);
  }, [value]);

  const handleSuggestionClick = (suggestionValue) => {
    onChange(suggestionValue);
    setShowSuggestions(false);
  };

  return (
    <div 
      className="search-bar" 
      ref={wrapperRef}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <Search className="search-icon" size={20} />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            setShowSuggestions(false);
          }
        }}
        onFocus={() => value.length >= 2 && setShowSuggestions(true)}
        placeholder={placeholder}
        title="Type at least 2 characters to see suggestions"
        className="search-input"
      />
      {value && (
        <button 
          className="clear-search"
          onClick={() => {
            onChange('');
            setSuggestions([]);
          }}
          aria-label="Clear search"
        >
          <X size={18} />
        </button>
      )}
      
      {showSuggestions && suggestions.length > 0 && (
        <ul className="suggestions-list">
          <li className="suggestions-header">Suggestions</li>
          {suggestions.map((suggestion, index) => (
            <li 
              key={index} 
              className="suggestion-item"
              onClick={() => handleSuggestionClick(suggestion.value)}
            >
              {suggestion.type === 'name' && <User size={16} />}

              {suggestion.type === 'id' && <Hash size={16} />}
              <span>
                {suggestion.value}
                {suggestion.label && <span className="suggestion-label"> ({suggestion.label})</span>}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default SearchBar;
