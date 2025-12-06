# Sales-Management-System

A high-performance, full-stack web application engineered to manage, analyze, and visualize large-scale retail sales datasets. This system leverages a modern React frontend and a robust Node.js backend to deliver sub-second search and filtering capabilities across millions of records.

##  Key Features

*   **High-Performance Search**: Implemented an optimized, debounced search engine capable of querying Customer Names, Transaction IDs, Customer IDs, and Product IDs with exact-match prioritization.
*   **Advanced Filtering Engine**: Comprehensive multi-select filtering system supporting complex queries across Regions, Demographics, Product Categories, Tags, and Date Ranges.
*   **Scalable Data Presentation**: Server-side pagination handling large datasets (20 records/page) with maintained state across navigation.
*   **Responsive UI/UX**: A professional, mobile-responsive interface built with React 18, featuring real-time feedback, loading states, and intuitive data visualization.
*   **Optimized Backend**: In-memory data caching strategy to minimize I/O latency and maximize query throughput.

## 🛠 Tech Stack

### Frontend
*   **Framework**: React 18 (Vite)
*   **State Management**: React Hooks (Custom hooks for debouncing and API integration)
*   **Styling**: CSS3 (Flexbox/Grid), Lucide React Icons
*   **HTTP Client**: Axios

### Backend
*   **Runtime**: Node.js
*   **Framework**: Express.js
*   **Data Processing**: Stream-based CSV parsing (`csv-parser`)
*   **Architecture**: MVC (Model-View-Controller)

## 🏗 Architecture & Design Patterns

*   **Monorepo Structure**: Managed via NPM Workspaces for efficient dependency handling and code sharing.
*   **MVC Pattern**: Strict separation of concerns in the backend (Controllers for request handling, Services for business logic, Routes for API definition).
*   **Performance Optimization**:
    *   **Debouncing**: Search input is debounced (500ms) to reduce server load.
    *   **In-Memory Indexing**: Critical search fields are pre-indexed on server startup for O(1) lookup performance.
    *   **Memoization**: React components utilize `useMemo` and `useCallback` to prevent unnecessary re-renders.

## 🔧 Setup & Installation

### Prerequisites
*   Node.js (v18+)
*   NPM (v9+)

### Quick Start

1.  **Clone the Repository**
    ```bash
    gh repo clone Krishna-mishra-26/Sales-Management-System
    cd TruEstate
    ```

2.  **Install Dependencies (Root)**
    ```bash
    npm install
    ```

3.  **Start the Application**
    This command concurrently starts both the backend API (Port 5000) and frontend client (Port 3000).
    ```bash
    npm run dev
    ```

4.  **Access the Application**
    Navigate to `http://localhost:3000`

## 📂 Project Structure

```
TruEstate/
├── backend/                 # Express.js API
│   ├── src/
│   │   ├── controllers/     # Request logic
│   │   ├── services/        # Business logic & Data indexing
│   │   ├── utils/           # CSV parsing & Helpers
│   │   └── index.js         # Server entry point
│
├── frontend/                # React Client
│   ├── src/
│   │   ├── components/      # Reusable UI components
│   │   ├── hooks/           # Custom hooks (useDebounce)
│   │   ├── services/        # API integration
│   │   └── App.jsx          # Main application layout
│
└── truestate_assignment_dataset.csv  # Source Data
```
## 👉🏻 <u>[Source Dataset Download & Add in ROOT FOLDER](https://drive.google.com/file/d/1tzbyuxBmrBwMSXbL22r33FUMtO0V_lxb/view)</u>

## 🔌 API Reference

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/sales/transactions` | Retrieves paginated transaction data with support for `search`, `page`, `limit`, `sortBy`, and dynamic filters. |
| `GET` | `/api/sales/filter-options` | Returns unique values for all filterable fields (Regions, Categories, Tags) to populate UI dropdowns. |
| `GET` | `/health` | System health check. |

---
**Developed by Krishna Mishra** | *Software Development Engineer*
