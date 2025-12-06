import { 
  loadSalesData, 
  searchTransactions, 
  filterTransactions, 
  sortTransactions,
  paginateResults,
  getUniqueFilterValues,
  getSearchSuggestions
} from '../services/salesService.js';

export const getSales = async (req, res) => {
  try {
    const { 
      search = '',
      customerRegion = '',
      gender = '',
      ageMin = '',
      ageMax = '',
      productCategory = '',
      tags = '',
      paymentMethod = '',
      dateFrom = '',
      dateTo = '',
      sortBy = 'date',
      sortOrder = 'desc',
      page = 1,
      limit = 20
    } = req.query;

    // Load all data
    let transactions = await loadSalesData();

    // Apply search
    if (search) {
      transactions = searchTransactions(transactions, search);
    }

    // Build filter object
    const filters = {
      customerRegion: customerRegion ? customerRegion.split(',') : [],
      gender: gender ? gender.split(',') : [],
      ageMin: ageMin ? parseInt(ageMin) : null,
      ageMax: ageMax ? parseInt(ageMax) : null,
      productCategory: productCategory ? productCategory.split(',') : [],
      tags: tags ? tags.split(',') : [],
      paymentMethod: paymentMethod ? paymentMethod.split(',') : [],
      dateFrom: dateFrom || null,
      dateTo: dateTo || null
    };

    // Apply filters
    transactions = filterTransactions(transactions, filters);

    // Apply sorting
    transactions = sortTransactions(transactions, sortBy, sortOrder);

    // Get total count before pagination
    const totalCount = transactions.length;

    // Apply pagination
    const paginatedData = paginateResults(transactions, parseInt(page), parseInt(limit));

    res.json({
      success: true,
      data: paginatedData.data,
      pagination: {
        currentPage: paginatedData.currentPage,
        totalPages: paginatedData.totalPages,
        totalItems: totalCount,
        itemsPerPage: parseInt(limit),
        hasNextPage: paginatedData.hasNextPage,
        hasPrevPage: paginatedData.hasPrevPage
      }
    });
  } catch (error) {
    console.error('Error in getSales:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch sales data',
      message: error.message 
    });
  }
};

export const getFilterOptions = async (req, res) => {
  try {
    const transactions = await loadSalesData();
    const filterOptions = getUniqueFilterValues(transactions);

    res.json({
      success: true,
      data: filterOptions
    });
  } catch (error) {
    console.error('Error in getFilterOptions:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch filter options',
      message: error.message 
    });
  }
};

export const getSuggestions = async (req, res) => {
  try {
    const { query } = req.query;
    const transactions = await loadSalesData();
    const suggestions = getSearchSuggestions(transactions, query);

    res.json({
      success: true,
      data: suggestions
    });
  } catch (error) {
    console.error('Error in getSuggestions:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch suggestions',
      message: error.message 
    });
  }
};
