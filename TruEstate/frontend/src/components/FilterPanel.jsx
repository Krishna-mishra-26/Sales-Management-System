import { useState } from 'react';
import { Filter, X, ChevronDown, ChevronUp } from 'lucide-react';
import '../styles/FilterPanel.css';

const FilterPanel = ({ filters, filterOptions, onFilterChange, onClearFilters, hasActiveFilters }) => {
  const [expandedSections, setExpandedSections] = useState({
    customer: true,
    product: true,
    sales: true,
    date: true
  });

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const handleMultiSelectChange = (filterKey, value) => {
    const currentValues = filters[filterKey];
    const newValues = currentValues.includes(value)
      ? currentValues.filter(v => v !== value)
      : [...currentValues, value];
    
    onFilterChange({ ...filters, [filterKey]: newValues });
  };

  const handleInputChange = (key, value) => {
    onFilterChange({ ...filters, [key]: value });
  };

  if (!filterOptions) {
    return (
      <aside className="filter-panel">
        <div className="filter-loading">Loading filters...</div>
      </aside>
    );
  }

  return (
    <aside className="filter-panel">
      <div className="filter-header">
        <div className="filter-title">
          <Filter size={20} />
          <h2>Filters</h2>
        </div>
        {hasActiveFilters && (
          <button className="clear-all-btn" onClick={onClearFilters}>
            Clear All
          </button>
        )}
      </div>

      <div className="filter-sections">
        {/* Customer Filters */}
        <div className="filter-section">
          <button 
            className="section-header"
            onClick={() => toggleSection('customer')}
          >
            <h3>Customer</h3>
            {expandedSections.customer ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
          </button>
          
          {expandedSections.customer && (
            <div className="section-content">
              {/* Customer Region */}
              <div className="filter-group">
                <label className="filter-label">Region</label>
                <div className="checkbox-group">
                  {filterOptions.customerRegions.map(region => (
                    <label key={region} className="checkbox-label">
                      <input
                        type="checkbox"
                        checked={filters.customerRegion.includes(region)}
                        onChange={() => handleMultiSelectChange('customerRegion', region)}
                      />
                      <span>{region}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Gender */}
              <div className="filter-group">
                <label className="filter-label">Gender</label>
                <div className="checkbox-group">
                  {filterOptions.genders.map(gender => (
                    <label key={gender} className="checkbox-label">
                      <input
                        type="checkbox"
                        checked={filters.gender.includes(gender)}
                        onChange={() => handleMultiSelectChange('gender', gender)}
                      />
                      <span>{gender}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Age Range */}
              <div className="filter-group">
                <label className="filter-label">Age Range</label>
                <div className="range-inputs">
                  <input
                    type="number"
                    placeholder={`Min (${filterOptions.ageRange.min})`}
                    value={filters.ageMin}
                    onChange={(e) => handleInputChange('ageMin', e.target.value)}
                    min={filterOptions.ageRange.min}
                    max={filterOptions.ageRange.max}
                  />
                  <span>to</span>
                  <input
                    type="number"
                    placeholder={`Max (${filterOptions.ageRange.max})`}
                    value={filters.ageMax}
                    onChange={(e) => handleInputChange('ageMax', e.target.value)}
                    min={filterOptions.ageRange.min}
                    max={filterOptions.ageRange.max}
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Product Filters */}
        <div className="filter-section">
          <button 
            className="section-header"
            onClick={() => toggleSection('product')}
          >
            <h3>Product</h3>
            {expandedSections.product ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
          </button>
          
          {expandedSections.product && (
            <div className="section-content">
              {/* Product Category */}
              <div className="filter-group">
                <label className="filter-label">Category</label>
                <div className="checkbox-group scrollable">
                  {filterOptions.productCategories.map(category => (
                    <label key={category} className="checkbox-label">
                      <input
                        type="checkbox"
                        checked={filters.productCategory.includes(category)}
                        onChange={() => handleMultiSelectChange('productCategory', category)}
                      />
                      <span>{category}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Tags */}
              <div className="filter-group">
                <label className="filter-label">Tags</label>
                <div className="checkbox-group scrollable">
                  {filterOptions.tags.map(tag => (
                    <label key={tag} className="checkbox-label">
                      <input
                        type="checkbox"
                        checked={filters.tags.includes(tag)}
                        onChange={() => handleMultiSelectChange('tags', tag)}
                      />
                      <span>{tag}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Sales Filters */}
        <div className="filter-section">
          <button 
            className="section-header"
            onClick={() => toggleSection('sales')}
          >
            <h3>Sales</h3>
            {expandedSections.sales ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
          </button>
          
          {expandedSections.sales && (
            <div className="section-content">
              {/* Payment Method */}
              <div className="filter-group">
                <label className="filter-label">Payment Method</label>
                <div className="checkbox-group">
                  {filterOptions.paymentMethods.map(method => (
                    <label key={method} className="checkbox-label">
                      <input
                        type="checkbox"
                        checked={filters.paymentMethod.includes(method)}
                        onChange={() => handleMultiSelectChange('paymentMethod', method)}
                      />
                      <span>{method}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Date Filter */}
        <div className="filter-section">
          <button 
            className="section-header"
            onClick={() => toggleSection('date')}
          >
            <h3>Date Range</h3>
            {expandedSections.date ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
          </button>
          
          {expandedSections.date && (
            <div className="section-content">
              <div className="filter-group">
                <label className="filter-label">From</label>
                <input
                  type="date"
                  value={filters.dateFrom}
                  onChange={(e) => handleInputChange('dateFrom', e.target.value)}
                  className="date-input"
                />
              </div>
              <div className="filter-group">
                <label className="filter-label">To</label>
                <input
                  type="date"
                  value={filters.dateTo}
                  onChange={(e) => handleInputChange('dateTo', e.target.value)}
                  className="date-input"
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
};

export default FilterPanel;
