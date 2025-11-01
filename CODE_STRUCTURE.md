# Code Structure Documentation

## Overview

This codebase follows a professional, maintainable frontend architecture with clear separation of concerns.

## Directory Structure

```
frontend/src/
├── features/           # Feature-based modules (domain-driven)
│   ├── meetings/      # Meeting management feature
│   ├── staff/         # Staff management feature
│   ├── dashboard/     # Dashboard feature
│   └── ...            # Other features
├── shared/            # Shared utilities and components
│   ├── components/    # Reusable UI components
│   ├── hooks/         # Custom React hooks
│   ├── utils/         # Utility functions and helpers
│   └── constants/     # Constants and configuration
├── layouts/           # Layout components
├── routes/            # Route configuration
└── api/              # API service layers
```

## Key Principles

### 1. **Feature-Based Organization**
Each feature is self-contained with its own:
- Components
- Hooks (business logic)
- API services (if feature-specific)
- Types/constants (if needed)

### 2. **Separation of Concerns**

#### **Hooks Layer** (`shared/hooks/`)
- `useFetch` - Generic data fetching with loading/error states
- `useForm` - Form state management with validation
- `useModal` - Modal state management
- `useApi` - API operations with built-in error handling

#### **Feature Hooks** (`features/{feature}/hooks/`)
- `useMeetings` - Meeting-specific business logic
- `useStaff` - Staff-specific business logic
- `useDashboard` - Dashboard-specific business logic

### 3. **Data Transformation Layer**
Located in `shared/utils/dataTransformers.js`:
- `MeetingTransformer` - Transforms meeting data between API and UI formats
- `StaffTransformer` - Transforms staff data between API and UI formats
- `DashboardTransformer` - Transforms dashboard data

### 4. **Validation Layer**
Located in `shared/utils/validators.js`:
- Reusable validation functions
- Pre-built validation schemas
- Composable validation patterns

### 5. **Error Handling**
Located in `shared/utils/errorHandler.js`:
- Centralized error processing
- User-friendly error messages
- Error type detection (network, auth, etc.)

### 6. **Constants Management**
- `constants/enums.js` - Enum-like values (status, roles, etc.)
- `constants/constants.js` - Configuration constants
- `constants/routeConfig.js` - Route definitions

## Component Patterns

### Example: Feature Page Component

```javascript
import { useFeatureHook } from './hooks';
import { useForm } from '../../shared/hooks';
import { StatusBadge } from '../../shared/components';

const FeaturePage = () => {
  // Business logic in custom hook
  const { data, loading, error, save, delete } = useFeatureHook();
  
  // Form management
  const form = useForm(initialValues, handleSubmit, validationSchema);
  
  // Modal management
  const modal = useModal();
  
  // Component only handles UI rendering
  return (/* JSX */);
};
```

## Best Practices

1. **Never put business logic in components** - Use custom hooks instead
2. **Always transform data** - Use transformers to convert between API and UI formats
3. **Centralize constants** - Don't hardcode strings/values
4. **Reuse hooks** - Don't duplicate state management logic
5. **Validate forms** - Use the validation utilities
6. **Handle errors consistently** - Use the error handler utilities

## Adding a New Feature

1. Create feature directory: `features/{feature-name}/`
2. Create hooks file: `features/{feature-name}/hooks/use{Feature}.js`
3. Create transformer: Add to `shared/utils/dataTransformers.js`
4. Create component: `features/{feature-name}/{Feature}Page.js`
5. Export from `features/{feature-name}/index.js`
6. Add route in `routes/index.js`

## Benefits of This Structure

✅ **Maintainability** - Clear separation makes code easy to understand and modify
✅ **Reusability** - Shared hooks and utilities reduce duplication
✅ **Testability** - Business logic is isolated and easily testable
✅ **Scalability** - Easy to add new features following the same pattern
✅ **Consistency** - All features follow the same patterns

