# Retail Sales Management System - Frontend

## Overview
Modern React application for managing and analyzing retail sales data with advanced search, filtering, sorting, and pagination capabilities. Built with Vite for optimal performance.

## Tech Stack
- **Framework**: React 18
- **Build Tool**: Vite
- **HTTP Client**: Axios
- **Icons**: Lucide React
- **Styling**: CSS3 (Custom)

## Search Implementation Summary
Implemented debounced search functionality that queries customer names and phone numbers. Uses a 500ms delay to reduce API calls while typing. Search is case-insensitive and works seamlessly with filters and sorting. The search bar includes a clear button for quick reset.

## Filter Implementation Summary
Multi-select filter system supporting:
- **Customer filters**: Region, Gender, Age Range (min/max)
- **Product filters**: Category, Tags (with OR logic)
- **Sales filters**: Payment Method, Date Range

Filters are organized in collapsible sections for better UX. All filters work independently and in combination. Active filters can be cleared individually or all at once.

## Sorting Implementation Summary
Three sorting options:
- **Date**: Newest First (default)
- **Quantity**: High to Low
- **Customer Name**: A-Z

Sort direction toggles on repeated clicks. Visual indicators show active sort field and direction using arrow icons. Sorting preserves all active search and filter states.

## Pagination Implementation Summary
Server-side pagination with 20 items per page. Features:
- First/Previous/Next/Last navigation buttons
- Smart page number display with ellipsis for large page counts
- Page info showing current page and total pages
- Maintains all search, filter, and sort states across pages
- Smooth scroll to top on page change

## Setup Instructions

1. Install dependencies:
```bash
npm install
```

2. Create `.env` file (optional):
```env
VITE_API_URL=http://localhost:5000/api
```

3. Start development server:
```bash
npm run dev
```

4. Build for production:
```bash
npm run build
```

5. Preview production build:
```bash
npm run preview
```

The application will run on `http://localhost:3000`

## Project Structure
```
frontend/
├── src/
│   ├── components/        # React components
│   │   ├── SearchBar.jsx
│   │   ├── FilterPanel.jsx
│   │   ├── SortingDropdown.jsx
│   │   ├── TransactionTable.jsx
│   │   └── Pagination.jsx
│   ├── hooks/            # Custom React hooks
│   │   └── useDebounce.js
│   ├── services/         # API services
│   │   └── api.js
│   ├── styles/           # Component styles
│   ├── App.jsx           # Main component
│   └── main.jsx          # Entry point
├── public/
├── index.html
└── package.json
```

## Features
- ✅ Real-time search with debouncing
- ✅ Advanced multi-select filtering
- ✅ Multiple sorting options
- ✅ Smooth pagination
- ✅ Responsive design
- ✅ Loading and error states
- ✅ Empty state handling
- ✅ Professional UI/UX
