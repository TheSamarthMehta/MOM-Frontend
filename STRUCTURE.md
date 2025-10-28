# Frontend Project Structure

This document describes the professional folder structure of the MOM Management frontend application.

## 📁 Directory Overview

```
frontend/src/
├── api/                    # API services and data fetching logic
│   ├── apiService.js
│   ├── dashboardService.js
│   ├── documentService.js
│   ├── meetingService.js
│   ├── staffService.js
│   └── index.js           # Barrel export for all services
│
├── features/              # Feature-based modules (domain-driven design)
│   ├── auth/              # Authentication & Authorization
│   │   ├── AuthContext.js
│   │   ├── LoginPage.js
│   │   ├── SignupPage.js
│   │   ├── ProtectedRoute.js
│   │   └── index.js
│   │
│   ├── dashboard/         # Dashboard feature
│   │   ├── DashboardPage.js
│   │   └── index.js
│   │
│   ├── masterConfig/      # Master Configuration (Meeting Types)
│   │   ├── MasterConfigPage.js
│   │   ├── masterConfigHandlers.js
│   │   └── index.js
│   │
│   ├── staff/             # Staff Management
│   │   ├── StaffConfigPage.js
│   │   └── index.js
│   │
│   ├── meetings/          # Meeting Management
│   │   ├── MeetingManagerPage.js
│   │   └── index.js
│   │
│   ├── attendance/        # Attendance Tracking
│   │   ├── AttendancePage.js
│   │   └── index.js
│   │
│   ├── documents/         # Document Management
│   │   ├── DocumentsManagerPage.js
│   │   └── index.js
│   │
│   ├── reports/           # Reports & Analytics
│   │   ├── ReportsPage.js
│   │   └── index.js
│   │
│   └── profile/           # User Profile
│       ├── ProfilePage.js
│       └── index.js
│
├── layouts/               # Layout components
│   ├── MainLayout.js
│   ├── Header.js
│   ├── SideBar.js
│   └── index.js
│
├── shared/                # Shared resources across features
│   ├── components/        # Reusable UI components
│   │   ├── ActionIcons.js
│   │   ├── DataTable.js
│   │   ├── ErrorMessage.js
│   │   ├── FileComponents.js
│   │   ├── FormComponents.js
│   │   ├── LoadingSpinner.js
│   │   ├── Modal.js
│   │   ├── PageHeader.js
│   │   ├── CustomSelect.js
│   │   └── index.js       # Barrel export
│   │
│   ├── utils/             # Utility functions
│   │   ├── api.js
│   │   ├── commonUtils.js
│   │   └── index.js
│   │
│   ├── constants/         # App-wide constants
│   │   ├── constants.js
│   │   └── index.js
│   │
│   └── hooks/             # Custom React hooks (future)
│
├── App.js                 # Root application component
├── App.css
├── index.js               # Application entry point
└── index.css
```

## 🎯 Design Principles

### 1. **Feature-Based Architecture**
- Each feature is self-contained in its own folder
- Related components, handlers, and logic are co-located
- Easier to understand, maintain, and scale

### 2. **Separation of Concerns**
- **`api/`**: Handles all backend communication
- **`features/`**: Domain-specific business logic
- **`shared/`**: Reusable components and utilities
- **`layouts/`**: Page layout structures

### 3. **Barrel Exports (index.js)**
- Clean, organized imports
- Example: `import { LoginPage, AuthProvider } from './features/auth'`
- Single source of truth for exports

### 4. **Consistent Import Patterns**
```javascript
// Feature imports
import { LoginPage, SignupPage } from './features/auth';

// Shared components
import { LoadingSpinner, Modal } from '../../shared/components';

// API services
import { staffService } from '../../api';

// Utils
import { api } from '../../shared/utils';
```

## 📦 Module Responsibilities

### API Layer (`api/`)
- Handles HTTP requests
- Data transformation
- Error handling
- Caching (if needed)

### Features (`features/`)
Each feature module contains:
- **Pages**: Main UI components
- **Handlers**: Business logic and event handlers
- **Local components**: Feature-specific components (if needed)
- **Types/Interfaces**: Feature-specific TypeScript types (if using TS)

### Shared (`shared/`)
- **Components**: Reusable UI primitives
- **Utils**: Helper functions, formatters, validators
- **Constants**: Configuration values, enums
- **Hooks**: Custom React hooks

### Layouts (`layouts/`)
- Page structure components
- Navigation components
- Header, Footer, Sidebar

## 🚀 Usage Examples

### Importing from Features
```javascript
// App.js
import { LoginPage, SignupPage, ProtectedRoute } from './features/auth';
import { DashboardPage } from './features/dashboard';
import { MasterConfigPage } from './features/masterConfig';
```

### Importing Shared Components
```javascript
// Within a feature
import { 
  LoadingSpinner, 
  ErrorMessage, 
  Modal, 
  DataTable 
} from '../../shared/components';
```

### Importing API Services
```javascript
// Within a feature
import { staffService, meetingService } from '../../api';
import { api } from '../../shared/utils';
```

## 🔄 Migration Benefits

1. **Scalability**: Easy to add new features without cluttering
2. **Maintainability**: Clear boundaries between modules
3. **Reusability**: Shared components are easily accessible
4. **Discoverability**: Logical grouping makes code easy to find
5. **Team Collaboration**: Multiple developers can work on different features
6. **Testing**: Isolated features are easier to test

## 📝 Best Practices

1. **Keep features isolated**: Avoid cross-feature dependencies
2. **Use barrel exports**: Always create index.js for clean imports
3. **Co-locate related code**: Keep handlers near their pages
4. **Shared first**: If a component is used by 2+ features, move to shared
5. **Consistent naming**: Use clear, descriptive names
6. **Document handlers**: Add JSDoc comments to handler functions

## 🔮 Future Enhancements

- Add `shared/hooks/` for custom React hooks
- Add `shared/types/` for TypeScript definitions
- Add `shared/contexts/` for global contexts (if more are needed)
- Add feature-specific subdirectories as features grow
- Add `__tests__/` folders within each feature for unit tests

## 📚 Additional Resources

- [React Folder Structure Best Practices](https://reactjs.org/)
- [Feature-Sliced Design](https://feature-sliced.design/)
- [Domain-Driven Design in Frontend](https://khalilstemmler.com/articles/client-side-architecture/introduction/)
