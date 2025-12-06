import { readCSVData } from '../utils/csvReader.js';
import { normalizeString, isDateInRange, isAgeInRange } from '../utils/helpers.js';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let cachedData = null;
let uniqueSearchData = null;
let isLoading = false;
let loadPromise = null;

export const loadSalesData = async () => {
  if (cachedData) {
    return cachedData;
  }

  // Prevent multiple simultaneous loads
  if (isLoading) {
    return loadPromise;
  }

  isLoading = true;
  const csvPath = path.resolve(__dirname, '../../../truestate_assignment_dataset.csv');
  
  loadPromise = readCSVData(csvPath)
    .then(data => {
      console.log(`Successfully cached ${data.length} transactions`);
      cachedData = data;
      
      // Pre-compute unique names and phones for fast suggestions
      const names = new Set();
      // Phone numbers removed from index as per request
      const transactionIds = new Set();
      const customerIds = new Set();
      const productIds = new Set();
      
      // Use a single pass to collect unique values
      for (const t of data) {
        if (t['Customer Name']) names.add(t['Customer Name']);
        if (t['Transaction ID']) transactionIds.add(t['Transaction ID']);
        if (t['Customer ID']) customerIds.add(t['Customer ID']);
        if (t['Product ID']) productIds.add(t['Product ID']);
      }
      
      uniqueSearchData = {
        names: Array.from(names).map(name => ({
          original: name,
          normalized: normalizeString(name)
        })),
        transactionIds: Array.from(transactionIds).map(id => ({
          original: id,
          normalized: normalizeString(id)
        })),
        customerIds: Array.from(customerIds).map(id => ({
          original: id,
          normalized: normalizeString(id)
        })),
        productIds: Array.from(productIds).map(id => ({
          original: id,
          normalized: normalizeString(id)
        }))
      };
      
      console.log(`Indexed ${uniqueSearchData.names.length} names, ${uniqueSearchData.transactionIds.length} txn IDs, ${uniqueSearchData.customerIds.length} cust IDs, ${uniqueSearchData.productIds.length} prod IDs`);

      isLoading = false;
      return cachedData;
    })
    .catch(error => {
      console.error('Error loading data:', error);
      isLoading = false;
      throw error;
    });

  return loadPromise;
};

export const searchTransactions = (transactions, searchTerm) => {
  if (!searchTerm) return transactions;

  const normalizedSearch = normalizeString(searchTerm);

  // Priority 1: Exact matches on IDs
  // If the user types a specific ID, they likely want that exact record.
  const exactMatches = transactions.filter(transaction => 
    transaction._searchTransactionId === normalizedSearch ||
    transaction._searchCustomerId === normalizedSearch ||
    transaction._searchProductId === normalizedSearch
  );

  if (exactMatches.length > 0) {
    return exactMatches;
  }

  // Priority 2: Fuzzy search (substrings)
  return transactions.filter(transaction => {
    // Use pre-calculated search fields
    return (transaction._searchName && transaction._searchName.includes(normalizedSearch)) || 
           (transaction._searchTransactionId && transaction._searchTransactionId.includes(normalizedSearch)) ||
           (transaction._searchCustomerId && transaction._searchCustomerId.includes(normalizedSearch)) ||
           (transaction._searchProductId && transaction._searchProductId.includes(normalizedSearch));
  });
};

export const getSearchSuggestions = (transactions, query) => {
  if (!query || query.length < 2) return [];
  
  // If unique data isn't ready (shouldn't happen if loadSalesData called), fallback to empty
  if (!uniqueSearchData) return [];

  const normalizedQuery = normalizeString(query);
  const suggestions = [];
  const limit = 5;

  // Search in names first
  for (const item of uniqueSearchData.names) {
    if (suggestions.length >= limit) break;
    if (item.normalized.includes(normalizedQuery)) {
      suggestions.push({ type: 'name', value: item.original });
    }
  }



  // Search in Transaction IDs
  if (suggestions.length < limit) {
    for (const item of uniqueSearchData.transactionIds) {
      if (suggestions.length >= limit) break;
      if (item.normalized.includes(normalizedQuery)) {
        suggestions.push({ type: 'id', value: item.original, label: 'Transaction ID' });
      }
    }
  }

  // Search in Customer IDs
  if (suggestions.length < limit) {
    for (const item of uniqueSearchData.customerIds) {
      if (suggestions.length >= limit) break;
      if (item.normalized.includes(normalizedQuery)) {
        suggestions.push({ type: 'id', value: item.original, label: 'Customer ID' });
      }
    }
  }

  // Search in Product IDs
  if (suggestions.length < limit) {
    for (const item of uniqueSearchData.productIds) {
      if (suggestions.length >= limit) break;
      if (item.normalized.includes(normalizedQuery)) {
        suggestions.push({ type: 'id', value: item.original, label: 'Product ID' });
      }
    }
  }

  return suggestions;
};

export const filterTransactions = (transactions, filters) => {
  // Pre-parse dates if they exist
  const fromDate = filters.dateFrom ? new Date(filters.dateFrom) : null;
  const toDate = filters.dateTo ? new Date(filters.dateTo) : null;
  if (toDate) toDate.setHours(23, 59, 59, 999);

  return transactions.filter(transaction => {
    // Customer Region filter
    if (filters.customerRegion.length > 0) {
      const region = transaction['Customer Region'] || '';
      if (!filters.customerRegion.includes(region)) return false;
    }

    // Gender filter
    if (filters.gender.length > 0) {
      const gender = transaction['Gender'] || '';
      if (!filters.gender.includes(gender)) return false;
    }

    // Age Range filter
    if (filters.ageMin !== null || filters.ageMax !== null) {
      const age = transaction.Age; // Use pre-parsed Age
      if (!isAgeInRange(age, filters.ageMin, filters.ageMax)) return false;
    }

    // Product Category filter
    if (filters.productCategory.length > 0) {
      const category = transaction['Product Category'] || '';
      if (!filters.productCategory.includes(category)) return false;
    }

    // Tags filter (multi-select with OR logic)
    if (filters.tags.length > 0) {
      const transactionTags = transaction['Tags'] || '';
      // Optimization: Check if string contains tag before splitting? 
      // Or just split. Splitting is safer for exact matches.
      const tagArray = transactionTags.split(',').map(t => t.trim());
      const hasMatchingTag = filters.tags.some(filterTag => 
        tagArray.includes(filterTag)
      );
      if (!hasMatchingTag) return false;
    }

    // Payment Method filter
    if (filters.paymentMethod.length > 0) {
      const paymentMethod = transaction['Payment Method'] || '';
      if (!filters.paymentMethod.includes(paymentMethod)) return false;
    }

    // Date Range filter
    if (fromDate || toDate) {
      const transactionDate = transaction.DateObj; // Use pre-parsed DateObj
      if (!transactionDate) return false;
      
      if (fromDate && transactionDate < fromDate) return false;
      if (toDate && transactionDate > toDate) return false;
    }

    return true;
  });
};

export const sortTransactions = (transactions, sortBy, sortOrder = 'desc') => {
  const sorted = [...transactions];

  sorted.sort((a, b) => {
    let valueA, valueB;

    switch (sortBy) {
      case 'date':
        valueA = a.DateObj || new Date(0);
        valueB = b.DateObj || new Date(0);
        break;
      
      case 'quantity':
        valueA = a.Quantity;
        valueB = b.Quantity;
        break;
      
      case 'customerName':
        valueA = a._searchName || '';
        valueB = b._searchName || '';
        break;
      
      default:
        return 0;
    }

    if (valueA < valueB) return sortOrder === 'asc' ? -1 : 1;
    if (valueA > valueB) return sortOrder === 'asc' ? 1 : -1;
    return 0;
  });

  return sorted;
};

export const paginateResults = (data, page = 1, limit = 20) => {
  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + limit;
  const paginatedData = data.slice(startIndex, endIndex);

  return {
    data: paginatedData,
    currentPage: page,
    totalPages: Math.ceil(data.length / limit),
    hasNextPage: endIndex < data.length,
    hasPrevPage: page > 1
  };
};

export const getUniqueFilterValues = (transactions) => {
  const regions = new Set();
  const genders = new Set();
  const categories = new Set();
  const tags = new Set();
  const paymentMethods = new Set();
  let minAge = Infinity;
  let maxAge = -Infinity;

  transactions.forEach(transaction => {
    if (transaction['Customer Region']) regions.add(transaction['Customer Region']);
    if (transaction['Gender']) genders.add(transaction['Gender']);
    if (transaction['Product Category']) categories.add(transaction['Product Category']);
    if (transaction['Payment Method']) paymentMethods.add(transaction['Payment Method']);
    
    // Extract tags
    if (transaction['Tags']) {
      const tagArray = transaction['Tags'].split(',').map(t => t.trim());
      tagArray.forEach(tag => tags.add(tag));
    }

    // Track age range
    const age = transaction.Age;
    if (!isNaN(age)) {
      minAge = Math.min(minAge, age);
      maxAge = Math.max(maxAge, age);
    }
  });

  return {
    customerRegions: Array.from(regions).sort(),
    genders: Array.from(genders).sort(),
    productCategories: Array.from(categories).sort(),
    tags: Array.from(tags).sort(),
    paymentMethods: Array.from(paymentMethods).sort(),
    ageRange: { min: minAge !== Infinity ? minAge : 0, max: maxAge !== -Infinity ? maxAge : 100 }
  };
};
