export const normalizeString = (str) => {
  return str.toString().toLowerCase().trim();
};

export const isDateInRange = (dateStr, fromDate, toDate) => {
  if (!dateStr) return false;
  
  const date = new Date(dateStr);
  
  if (fromDate) {
    const from = new Date(fromDate);
    if (date < from) return false;
  }
  
  if (toDate) {
    const to = new Date(toDate);
    to.setHours(23, 59, 59, 999); // Include the entire end date
    if (date > to) return false;
  }
  
  return true;
};

export const isAgeInRange = (age, minAge, maxAge) => {
  if (minAge !== null && age < minAge) return false;
  if (maxAge !== null && age > maxAge) return false;
  return true;
};

export const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2
  }).format(amount);
};

export const formatDate = (dateStr) => {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};
