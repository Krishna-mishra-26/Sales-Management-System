# System Architecture Documentation

## 1. Executive Summary
The Retail Sales Management System is a high-performance, full-stack web application engineered to process, analyze, and visualize large-scale retail datasets. The system implements a decoupled Client-Server architecture, leveraging **Node.js** for high-throughput data processing and **React 18** for a responsive, state-driven user interface.

## 2. Technical Stack & Design Choices

### 2.1 Backend (Node.js / Express)
*   **Runtime Environment**: Node.js (v18+) selected for its non-blocking I/O model, ideal for handling concurrent API requests.
*   **Framework**: Express.js for robust routing and middleware management.
*   **Data Processing**: Stream-based CSV parsing (`csv-parser`) to handle large datasets with minimal memory footprint during ingestion.
*   **Architecture Pattern**: **MVC (Model-View-Controller)** to enforce separation of concerns:
    *   **Controllers**: Handle HTTP request/response lifecycles and input validation.
    *   **Services**: Encapsulate core business logic, data indexing, and transformation rules.
    *   **Routes**: Define API endpoints and map them to controller actions.

### 2.2 Frontend (React / Vite)
*   **Framework**: React 18 utilizing Functional Components and Hooks (`useState`, `useEffect`, `useMemo`) for efficient state management.
*   **Build Tool**: Vite for lightning-fast HMR (Hot Module Replacement) and optimized production builds.
*   **State Management**: Centralized local state in the root component, propagated via props to ensure unidirectional data flow.
*   **UI/UX**: Custom-built, responsive components styled with CSS Modules/Flexbox; Lucide React for lightweight iconography.

## 3. Backend Architecture

### 3.1 Core Modules
*   **`salesService.js`**: The heart of the application.
    *   **In-Memory Indexing**: Upon startup, critical search fields (Transaction ID, Customer Name, etc.) are pre-indexed into `Set` data structures to enable **O(1)** lookup performance for autocomplete and exact matches.
    *   **Search Engine**: Implements a hybrid search strategy prioritizing **Exact Matches** before falling back to **Fuzzy Search** (substring matching).
    *   **Data Caching**: The CSV dataset is loaded into memory once (Singleton pattern) to eliminate disk I/O latency for subsequent requests.

### 3.2 Data Flow Pipeline
1.  **Request Ingestion**: API receives a `GET` request with query parameters (search, filters, pagination).
2.  **Validation**: Controller validates input types and sanitizes data.
3.  **Search & Filter**: Service layer applies the search algorithm first to reduce the dataset, followed by multi-criteria filtering (AND/OR logic).
4.  **Sorting**: The reduced dataset is sorted based on the requested field (Date, Quantity, Name) using an optimized comparator.
5.  **Pagination**: A slice of the data is extracted based on `page` and `limit` (20 items/page).
6.  **Response**: JSON payload containing the data slice and pagination metadata is returned.

## 4. Frontend Architecture

### 4.1 Component Hierarchy
*   **`App.jsx`**: The orchestrator. Manages the "Source of Truth" for all application state (search term, active filters, sort order, pagination).
*   **`TransactionTable.jsx`**: A pure presentation component. Renders data in a responsive grid with sticky headers and virtualized-like scrolling.
*   **`FilterPanel.jsx`**: A complex UI component handling multi-select logic for categorical data (Regions, Tags) and range inputs for numerical data (Age).
*   **`SearchBar.jsx`**: Features a **Debounced** input (500ms) to prevent API thrashing during typing.

### 4.2 Performance Optimizations
*   **Debouncing**: Search API calls are delayed by 500ms to reduce server load.
*   **Memoization**: Expensive calculations and callback functions are memoized using `useMemo` and `useCallback` to prevent unnecessary re-renders.
*   **Optimistic UI**: Loading states (spinners/skeletons) provide immediate visual feedback while data is being fetched.

## 5. API Contract

### 5.1 Endpoints
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/sales/transactions` | Core data retrieval. Supports `search`, `page`, `limit`, `sortBy`, `sortOrder`, and dynamic filter params. |
| `GET` | `/api/sales/filter-options` | Returns unique values for all filterable fields to populate UI dropdowns dynamically. |
| `GET` | `/health` | System health check for monitoring uptime. |

## 6. Scalability & Future Roadmap
*   **Database Migration**: Transition from in-memory CSV to a relational database (PostgreSQL) for ACID compliance and handling datasets > 10GB.
*   **Caching Layer**: Implement Redis to cache frequent search queries and filter results.
*   **Containerization**: Dockerize the application for consistent deployment across environments.
*   **CI/CD**: Establish automated testing and deployment pipelines using GitHub Actions.

---
**Document Version**: 2.0 | **Last Updated**: December 2025
- Each filter is independent
- Filters can be combined using AND logic
- Tags use OR logic for matching
- Empty filter values are ignored

#### Search Implementation
- Case-insensitive string matching
- Uses string normalization for consistent results
- Searches across Customer Name and Phone Number fields

#### Sorting Strategy
- Three predefined sort options (date, quantity, customerName)
- Default: Date descending (newest first)
- Supports ascending and descending order

#### Pagination Approach
- Server-side pagination reduces payload size
- Fixed page size of 20 items
- Returns pagination metadata (current page, total pages, has next/prev)

## Frontend Architecture

### Folder Structure
```
frontend/
├── src/
│   ├── components/           # Reusable UI components
│   │   ├── SearchBar.jsx
│   │   ├── FilterPanel.jsx
│   │   ├── SortingDropdown.jsx
│   │   ├── TransactionTable.jsx
│   │   └── Pagination.jsx
│   ├── hooks/                # Custom React hooks
│   │   └── useDebounce.js
│   ├── services/             # API communication
│   │   └── api.js
│   ├── styles/               # Component-specific CSS
│   ├── App.jsx               # Main application component
│   └── main.jsx              # React entry point
├── public/
├── index.html
└── vite.config.js
```

### Module Responsibilities

#### 1. App.jsx (Main Component)
- Central state management
- Orchestrates all child components
- Manages search, filter, sort, and pagination state
- Handles API calls through service layer
- Implements loading and error states

#### 2. Components

**SearchBar.jsx**
- Controlled input component
- Displays search icon and clear button
- Emits onChange events to parent
- Shows autocomplete suggestions with debouncing

**FilterDropdown.jsx**
- Reusable dropdown component for individual filter categories
- Supports multi-select checkboxes and range inputs
- Handles mobile-responsive "bottom sheet" behavior
- Manages open/close state and click-outside detection

**SortingDropdown.jsx**
- Visual buttons for each sort option
- Shows active sort with directional arrows
- Toggles sort direction on repeated clicks

**TransactionTable.jsx**
- Displays transaction data in table format
- Responsive design with horizontal scroll
- Formatted currency and dates
- Color-coded status badges

**Pagination.jsx**
- Navigation buttons (First, Prev, Next, Last)
- Smart page number display with ellipsis
- Shows current page info
- Disables buttons when appropriate

#### 3. Hooks

**useDebounce.js**
- Custom hook for debouncing rapid value changes
- Reduces API calls during search typing
- 500ms delay before emitting value

#### 4. Services

**api.js**
- Axios instance configured with base URL
- `fetchTransactions()`: GET transactions with params
- `fetchFilterOptions()`: GET available filter values
- Centralized error handling

### Data Flow (Frontend)

```
User Interaction → State Update → API Call → Response Processing → UI Update

1. User types in search / changes filter / clicks sort / navigates page
2. State updates trigger useEffect
3. Debounced search (if applicable) delays API call
4. API service constructs request with all current state
5. Backend processes request and returns data
6. Response updates transaction list and pagination metadata
7. React re-renders affected components
```

### State Management Strategy

**Local State (useState)**
- Search term
- Filter values (object with all filter fields)
- Sort field and order
- Current page number
- Transactions array
- Pagination metadata
- Loading and error states

**Side Effects (useEffect)**
- Load filter options on mount
- Load transactions when search/filter/sort/page changes
- Debounce search to optimize performance

**State Reset Logic**
- Search/filter changes reset to page 1
- Clear filters resets all filter state
- Maintains consistency across operations

### Key Design Decisions

#### Component Modularity
- Each component has single responsibility
- Components are reusable and testable
- Props-based communication

#### State Lifting
- State managed in App.jsx
- Child components receive state and callbacks as props
- Unidirectional data flow

#### Debouncing
- Search uses 500ms debounce
- Prevents excessive API calls
- Improves performance and UX

#### Responsive Design
- Mobile-first CSS approach
- Flexible layouts with CSS Grid and Flexbox
- Horizontal scroll for table on small screens

#### Loading States
- Spinner shown during API calls
- Prevents duplicate requests
- Clear user feedback

#### Error Handling
- User-friendly error messages
- Retry functionality
- Graceful fallbacks

## API Contract

### GET /api/sales/transactions

**Query Parameters:**
```
search: string
customerRegion: string (comma-separated)
gender: string (comma-separated)
ageMin: number
ageMax: number
productCategory: string (comma-separated)
tags: string (comma-separated)
paymentMethod: string (comma-separated)
dateFrom: string (YYYY-MM-DD)
dateTo: string (YYYY-MM-DD)
sortBy: string (date|quantity|customerName)
sortOrder: string (asc|desc)
page: number
limit: number
```

**Response:**
```json
{
  "success": true,
  "data": [...],
  "pagination": {
    "currentPage": 1,
    "totalPages": 10,
    "totalItems": 100,
    "itemsPerPage": 20,
    "hasNextPage": true,
    "hasPrevPage": false
  }
}
```

### GET /api/sales/filter-options

**Response:**
```json
{
  "success": true,
  "data": {
    "customerRegions": [...],
    "genders": [...],
    "productCategories": [...],
    "tags": [...],
    "paymentMethods": [...],
    "ageRange": { "min": 18, "max": 80 }
  }
}
```

## Performance Considerations

### Backend Optimizations
1. **Data Caching**: CSV loaded once and cached
2. **Efficient Filtering**: Short-circuit evaluation
3. **Pagination**: Only requested data sent to client
4. **Stream Processing**: CSV parsed with streams

### Frontend Optimizations
1. **Debouncing**: Reduces API calls during typing
2. **Conditional Rendering**: Only renders visible components
3. **CSS Performance**: Minimal reflows, GPU-accelerated animations
4. **Code Splitting**: Vite handles automatic code splitting

## Security Considerations

1. **CORS**: Configured to allow specific origins
2. **Input Validation**: Query parameters validated
3. **Error Messages**: Generic errors to prevent information leakage
4. **Rate Limiting**: Should be added for production
5. **Environment Variables**: Sensitive config in .env files

## Scalability Considerations

### Current Limitations
- In-memory data storage
- Single server instance
- File-based data source

### Future Improvements
1. **Database Integration**: PostgreSQL or MongoDB
2. **Caching Layer**: Redis for frequently accessed data
3. **Load Balancing**: Multiple server instances
4. **CDN**: Static asset delivery
5. **API Gateway**: Rate limiting and authentication
6. **Microservices**: Separate services for different domains

## Deployment Architecture

### Development
- Backend: `npm run dev` (nodemon)
- Frontend: `npm run dev` (Vite dev server)
- Proxy: Vite proxies API calls to backend

### Production
- Backend: Node.js on port 5000
- Frontend: Static files served by Nginx/CDN
- Environment variables for configuration
- Process manager (PM2) for Node.js

## Testing Strategy (Recommended)

### Backend Tests
- Unit tests for service functions
- Integration tests for API endpoints
- Test data fixtures
- Coverage target: 80%+

### Frontend Tests
- Component tests with React Testing Library
- Integration tests for user flows
- E2E tests with Playwright/Cypress
- Accessibility testing

## Monitoring and Logging

### Recommended Tools
- **Logging**: Winston or Pino
- **Monitoring**: PM2, New Relic, or Datadog
- **Error Tracking**: Sentry
- **Analytics**: Google Analytics or Mixpanel

## Conclusion

This architecture provides a solid foundation for a production-ready retail sales management system. The clear separation of concerns, modular design, and focus on performance and user experience make the system maintainable and scalable.
