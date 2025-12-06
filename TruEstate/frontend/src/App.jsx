import { useState, useEffect } from 'react';
import SearchBar from './components/SearchBar';
import FilterDropdown from './components/FilterDropdown';
import TransactionTable from './components/TransactionTable';
import SortingDropdown from './components/SortingDropdown';
import Pagination from './components/Pagination';
import { fetchTransactions, fetchFilterOptions } from './services/api';
import { useDebounce } from './hooks/useDebounce';
import { SearchX } from 'lucide-react';
import './styles/App.css';

function App() {
  const [transactions, setTransactions] = useState([]);
  const [filterOptions, setFilterOptions] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Search and filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    customerRegion: [],
    gender: [],
    ageMin: '',
    ageMax: '',
    productCategory: [],
    tags: [],
    paymentMethod: [],
    dateFrom: '',
    dateTo: ''
  });
  const [sortBy, setSortBy] = useState('');
  const [sortOrder, setSortOrder] = useState('asc');
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState(null);
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [searchTime, setSearchTime] = useState(0);
  const [showSearchTime, setShowSearchTime] = useState(false);

  const debouncedSearch = useDebounce(searchTerm, 500);

  // Load filter options on mount
  useEffect(() => {
    loadFilterOptions();
  }, []);

  // Load transactions whenever search, filters, sort, or page changes
  useEffect(() => {
    loadTransactions();
  }, [debouncedSearch, filters, sortBy, sortOrder, currentPage]);

  const loadFilterOptions = async () => {
    try {
      const options = await fetchFilterOptions();
      setFilterOptions(options);
    } catch (err) {
      console.error('Failed to load filter options:', err);
    }
  };

  const loadTransactions = async () => {
    setLoading(true);
    setError(null);
    const startTime = performance.now();
    
    try {
      const params = {
        search: debouncedSearch,
        ...filters,
        customerRegion: filters.customerRegion.join(','),
        gender: filters.gender.join(','),
        productCategory: filters.productCategory.join(','),
        tags: filters.tags.join(','),
        paymentMethod: filters.paymentMethod.join(','),
        sortBy: sortBy || 'customerName',
        sortOrder: sortBy ? sortOrder : 'asc',
        page: currentPage,
        limit: 20
      };

      const response = await fetchTransactions(params);
      setTransactions(response.data);
      setPagination(response.pagination);
      const endTime = performance.now();
      setSearchTime(((endTime - startTime) / 1000).toFixed(2));
      setShowSearchTime(true);
      setTimeout(() => setShowSearchTime(false), 1000);
    } catch (err) {
      setError('Failed to load transactions. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchChange = (value) => {
    setSearchTerm(value);
    setCurrentPage(1); // Reset to first page on search
  };

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
    setCurrentPage(1); // Reset to first page on filter change
  };
  
  const handleMultiSelectChange = (filterKey, value) => {
    const currentValues = filters[filterKey];
    const newValues = currentValues.includes(value)
      ? currentValues.filter(v => v !== value)
      : [...currentValues, value];
    
    handleFilterChange({ ...filters, [filterKey]: newValues });
  };

  const handleInputChange = (key, value) => {
    handleFilterChange({ ...filters, [key]: value });
  };

  const handleSortChange = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder(field === 'customerName' ? 'asc' : 'desc');
    }
    setCurrentPage(1);
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleClearFilters = () => {
    setFilters({
      customerRegion: [],
      gender: [],
      ageMin: '',
      ageMax: '',
      productCategory: [],
      tags: [],
      paymentMethod: [],
      dateFrom: '',
      dateTo: ''
    });
    setSearchTerm('');
    setActiveDropdown(null);
    setCurrentPage(1);
  };

  const hasActiveFilters = () => {
    return searchTerm || 
           filters.customerRegion.length > 0 ||
           filters.gender.length > 0 ||
           filters.ageMin ||
           filters.ageMax ||
           filters.productCategory.length > 0 ||
           filters.tags.length > 0 ||
           filters.paymentMethod.length > 0 ||
           filters.dateFrom ||
           filters.dateTo;
  };

  const toggleDropdown = (dropdown) => {
    setActiveDropdown(activeDropdown === dropdown ? null : dropdown);
  };

  return (
    <div className="app">
      <div className="top-bar">
        <div className="top-bar-content">
          <div className="header-row">
            <h1 className="app-title">Sales Management System</h1>
            <div className="header-search-container">
              <SearchBar 
                value={searchTerm}
                onChange={handleSearchChange}
                placeholder="Search by Name, Transaction ID, Customer ID, or Product ID..."
              />
            </div>
          </div>
          <div className="controls-row">
              <div className="filter-dropdowns">
                {filterOptions && (
                  <>
                    <FilterDropdown 
                      title="Customer" 
                      isActive={activeDropdown === 'customer'}
                      onClick={() => toggleDropdown('customer')}
                    >
                      <div className="filter-group">
                        <label className="filter-label">Region</label>
                        <div className="checkbox-group">
                          {filterOptions.customerRegions.map(region => (
                            <label key={region} className="checkbox-label">
                              <input type="checkbox" checked={filters.customerRegion.includes(region)} onChange={() => handleMultiSelectChange('customerRegion', region)} />
                              <span>{region}</span>
                            </label>
                          ))}
                        </div>
                      </div>
                      <div className="filter-group">
                        <label className="filter-label">Gender</label>
                        <div className="checkbox-group">
                          {filterOptions.genders.map(gender => (
                            <label key={gender} className="checkbox-label">
                              <input type="checkbox" checked={filters.gender.includes(gender)} onChange={() => handleMultiSelectChange('gender', gender)} />
                              <span>{gender}</span>
                            </label>
                          ))}
                        </div>
                      </div>
                      <div className="filter-group">
                        <label className="filter-label">Age Range</label>
                        <div className="range-inputs">
                          <input type="number" placeholder="Min" value={filters.ageMin} onChange={e => handleInputChange('ageMin', e.target.value)} />
                          <span>to</span>
                          <input type="number" placeholder="Max" value={filters.ageMax} onChange={e => handleInputChange('ageMax', e.target.value)} />
                        </div>
                      </div>
                    </FilterDropdown>

                    <FilterDropdown 
                      title="Product" 
                      isActive={activeDropdown === 'product'}
                      onClick={() => toggleDropdown('product')}
                    >
                      <div className="filter-group">
                        <label className="filter-label">Category</label>
                        <div className="checkbox-group">
                          {filterOptions.productCategories.map(cat => (
                            <label key={cat} className="checkbox-label">
                              <input type="checkbox" checked={filters.productCategory.includes(cat)} onChange={() => handleMultiSelectChange('productCategory', cat)} />
                              <span>{cat}</span>
                            </label>
                          ))}
                        </div>
                      </div>
                      <div className="filter-group">
                        <label className="filter-label">Tags</label>
                        <div className="checkbox-group scrollable">
                          {filterOptions.tags.map(tag => (
                            <label key={tag} className="checkbox-label">
                              <input type="checkbox" checked={filters.tags.includes(tag)} onChange={() => handleMultiSelectChange('tags', tag)} />
                              <span>{tag}</span>
                            </label>
                          ))}
                        </div>
                      </div>
                    </FilterDropdown>

                    <FilterDropdown 
                      title="Sales" 
                      isActive={activeDropdown === 'sales'}
                      onClick={() => toggleDropdown('sales')}
                    >
                      <div className="filter-group">
                        <label className="filter-label">Payment Method</label>
                        <div className="checkbox-group">
                          {filterOptions.paymentMethods.map(method => (
                            <label key={method} className="checkbox-label">
                              <input type="checkbox" checked={filters.paymentMethod.includes(method)} onChange={() => handleMultiSelectChange('paymentMethod', method)} />
                              <span>{method}</span>
                            </label>
                          ))}
                        </div>
                      </div>
                    </FilterDropdown>

                    <FilterDropdown 
                      title="Date Range" 
                      isActive={activeDropdown === 'date'}
                      onClick={() => toggleDropdown('date')}
                    >
                      <div className="filter-group">
                        <label className="filter-label">From</label>
                        <input type="date" value={filters.dateFrom} onChange={e => handleInputChange('dateFrom', e.target.value)} />
                      </div>
                      <div className="filter-group">
                        <label className="filter-label">To</label>
                        <input type="date" value={filters.dateTo} onChange={e => handleInputChange('dateTo', e.target.value)} />
                      </div>
                    </FilterDropdown>
                  </>
                )}
              </div>
              
              <div className="right-controls">
                {hasActiveFilters() && (
                  <button className="clear-all-btn" onClick={handleClearFilters}>
                    Clear All
                  </button>
                )}
                <SortingDropdown
                  sortBy={sortBy}
                  sortOrder={sortOrder}
                  onSortChange={handleSortChange}
                />
              </div>
            </div>
        </div>
      </div>

      <main className="app-main">
        <div className="content-section-full">
          <div className="results-section">
            {loading && (
              <div className="loading-state">
                <div className="spinner"></div>
                <p>Loading transactions...</p>
              </div>
            )}

            {error && (
              <div className="error-state">
                <p>{error}</p>
                <button onClick={loadTransactions}>Retry</button>
              </div>
            )}

            {!loading && !error && transactions.length === 0 && (
              <div className="empty-state">
                <div className="empty-icon-wrapper">
                  <SearchX size={48} strokeWidth={1.5} />
                </div>
                <h3>No transactions found</h3>
                <p>We couldn't find any transactions matching your current filters. Try adjusting your search or filters.</p>
                {hasActiveFilters() && (
                  <button className="clear-filters-btn-large" onClick={handleClearFilters}>
                    Clear all filters
                  </button>
                )}
              </div>
            )}

            {!loading && !error && transactions.length > 0 && (
              <>
                <TransactionTable 
                  transactions={transactions}
                  sortBy={sortBy}
                  sortOrder={sortOrder}
                  onSortChange={handleSortChange}
                />

                {pagination && pagination.totalPages > 1 && (
                  <Pagination
                    currentPage={currentPage}
                    totalPages={pagination.totalPages}
                    onPageChange={handlePageChange}
                    hasNextPage={pagination.hasNextPage}
                    hasPrevPage={pagination.hasPrevPage}
                  />
                )}
              </>
            )}
          </div>
        </div>
      </main>
      
      {showSearchTime && (
        <div className="search-success-toast">
          🎉 Results found in {searchTime} seconds!
        </div>
      )}
    </div>
  );
}

export default App;