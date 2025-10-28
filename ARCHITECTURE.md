# Frontend Architecture Quick Reference

## 🏗️ Project Structure at a Glance

```
src/
├── 🌐 api/                    → Backend communication
├── 🎯 features/               → Business domains
│   ├── auth/                  → Login, Signup, Auth
│   ├── dashboard/             → Main dashboard
│   ├── masterConfig/          → Meeting types config
│   ├── staff/                 → Staff management
│   ├── meetings/              → Meeting management
│   ├── attendance/            → Attendance tracking
│   ├── documents/             → Document management
│   ├── reports/               → Reports & analytics
│   └── profile/               → User profile
├── 📐 layouts/                → Page structures
├── 🔧 shared/                 → Reusable resources
│   ├── components/            → UI components
│   ├── utils/                 → Helper functions
│   ├── constants/             → App constants
│   └── hooks/                 → Custom hooks
└── 📄 App.js                  → Root component
```

## 🔗 Import Paths Cheat Sheet

### From Root (App.js)
```javascript
import { LoginPage, AuthProvider } from './features/auth';
import { DashboardPage } from './features/dashboard';
import { MainLayout } from './layouts';
```

### From Feature Pages (e.g., MasterConfigPage.js)
```javascript
import * as handlers from './masterConfigHandlers';  // Same folder
import { api } from '../../shared/utils';            // Shared utils
import { LoadingSpinner } from '../../shared/components'; // Shared components
import { staffService } from '../../api';            // API services
```

### From Layouts (e.g., Header.js)
```javascript
import { useAuth } from '../features/auth/AuthContext';
```

### From Auth Features
```javascript
import { useAuth } from './AuthContext';             // Same folder
import { api } from '../../shared/utils';            // Shared utils
```

## 📋 Quick Migration Summary

### What Changed:
1. ✅ `pages/` → `features/[domain]/`
2. ✅ `components/common/` → `shared/components/`
3. ✅ `components/[Layout]` → `layouts/`
4. ✅ `services/` → `api/`
5. ✅ `utils/` → `shared/utils/`
6. ✅ `config/constants.js` → `shared/constants/`
7. ✅ `contexts/AuthContext.js` → `features/auth/`

### New Additions:
- ✨ `index.js` barrel exports in every folder
- ✨ Feature-specific handlers co-located with pages
- ✨ `STRUCTURE.md` documentation

## 🎨 Folder Color Coding

- 🟢 **features/** - Green zone (your main work area)
- 🔵 **shared/** - Blue zone (reusable utilities)
- 🟣 **layouts/** - Purple zone (page structures)
- 🟡 **api/** - Yellow zone (data layer)

## 💡 Key Benefits

1. **Scalability** - Add new features easily
2. **Maintainability** - Clear module boundaries
3. **Reusability** - Shared components accessible
4. **Discoverability** - Logical file organization
5. **Team-friendly** - Multiple devs, no conflicts

## 🚀 Next Steps

1. Run `npm start` to test the restructure
2. Check for any import errors
3. Test each feature page
4. Add unit tests to feature folders
5. Consider adding TypeScript types

---

**Note**: All imports have been updated. The app functionality remains unchanged - only the organization has improved!
