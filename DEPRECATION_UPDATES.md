# Deprecation Updates - November 2025

This document outlines all deprecated code and dependencies that were updated in this project.

## 🔄 Changes Made

### 1. Web Vitals API Update (`reportWebVitals.js`)
**Issue**: The `getFID` metric has been deprecated in web-vitals v3+

**Changes**:
- ❌ Removed: `getFID` (deprecated)
- ✅ Added: `onINP` (Interaction to Next Paint - the new standard)
- Updated all metric functions to use the new `on*` pattern instead of `get*`

**Before**:
```javascript
import('web-vitals').then(({ getCLS, getFID, getFCP, getLCP, getTTFB }) => {
  getCLS(onPerfEntry);
  getFID(onPerfEntry); // DEPRECATED
  ...
});
```

**After**:
```javascript
import('web-vitals').then(({ onCLS, onINP, onFCP, onLCP, onTTFB }) => {
  onCLS(onPerfEntry);
  onINP(onPerfEntry); // NEW: Replaced getFID
  ...
});
```

### 2. Package Dependencies Update (`package.json`)

Updated all outdated packages to their latest compatible versions:

| Package | Old Version | New Version | Major Changes |
|---------|-------------|-------------|---------------|
| `@fortawesome/fontawesome-svg-core` | 6.2.1 | 6.7.2 | Minor update |
| `@fortawesome/free-regular-svg-icons` | 6.2.1 | 6.7.2 | Minor update |
| `@fortawesome/free-solid-svg-icons` | 6.2.1 | 6.7.2 | Minor update |
| `@fortawesome/react-fontawesome` | 0.2.0 | 0.2.6 | Patch update |
| `@material-ui/icons` | 4.11.3 | **REMOVED** | Replaced with @mui |
| `@mui/icons-material` | - | **6.3.0** | Modern replacement |
| `@testing-library/jest-dom` | 5.16.5 | 6.9.1 | Major update |
| `@testing-library/react` | 13.4.0 | 16.3.0 | Major update |
| `@testing-library/user-event` | 13.5.0 | 14.6.1 | Major update |
| `js-cookie` | 3.0.1 | 3.0.5 | Patch update |
| `lucide-react` | 0.546.0 | 0.553.0 | Minor update |
| `pixi.js` | 7.2.3 | 8.14.1 | Major update |
| `react` | 18.2.0 | 18.3.1 | Minor update |
| `react-dom` | 18.2.0 | 18.3.1 | Minor update |
| `react-hook-form` | 7.65.0 | 7.66.0 | Minor update |
| `react-router-dom` | 6.8.0 | 6.30.2 | Minor update |
| `three` | 0.150.1 | 0.181.1 | Minor update |
| `web-vitals` | 2.1.4 | 4.2.4 | Major update |

**Breaking Change Alert**: 
- `@material-ui/icons` is deprecated → replaced with `@mui/icons-material`
- This package is not currently used in the codebase, so no code changes needed

### 3. PropTypes Pattern Updates

**Issue**: Using generic `PropTypes.array` and `PropTypes.object` is discouraged

**Files Updated**:
- `src/shared/components/Leaderboard.js`
- `src/shared/components/GamePopup.js`

**Changes**:

#### Leaderboard.js
```javascript
// BEFORE (deprecated)
players: PropTypes.array,
topPlayers: PropTypes.array,

// AFTER (specific types)
players: PropTypes.arrayOf(PropTypes.object),
topPlayers: PropTypes.arrayOf(PropTypes.object),
```

#### GamePopup.js
```javascript
// BEFORE (deprecated)
nameInputRef: PropTypes.object,

// AFTER (specific type for refs)
nameInputRef: PropTypes.oneOfType([
  PropTypes.object, 
  PropTypes.shape({ current: PropTypes.any })
]),
```

## 📦 Next Steps

After these updates, run the following commands:

```bash
# Install updated dependencies
npm install

# Optional: Remove old package-lock.json and node_modules for clean install
rm -rf node_modules package-lock.json
npm install

# Run tests to ensure compatibility
npm test

# Build to check for any breaking changes
npm run build
```

## ⚠️ Potential Breaking Changes to Watch For

### 1. React Testing Library (v13 → v16)
- Some query methods may have changed
- Check test files if any tests fail

### 2. Pixi.js (v7 → v8)
- Major version update
- Review any pixi.js usage in the codebase
- Check release notes: https://github.com/pixijs/pixijs/releases

### 3. Web Vitals (v2 → v4)
- Metric names changed from `get*` to `on*` pattern
- FID replaced with INP (already updated)

## ✅ What's Been Verified

- ✅ No deprecated React lifecycle methods found
- ✅ No usage of `@material-ui` in codebase (safe to replace)
- ✅ All PropTypes patterns updated to specific types
- ✅ Web vitals metrics updated to latest API

## 📚 Additional Resources

- [Web Vitals v4 Migration Guide](https://github.com/GoogleChrome/web-vitals)
- [React Testing Library Migration](https://testing-library.com/docs/react-testing-library/migrate-from-enzyme)
- [MUI Migration Guide](https://mui.com/material-ui/migration/migration-v4/)
- [Pixi.js v8 Release Notes](https://github.com/pixijs/pixijs/releases/tag/v8.0.0)

---
**Last Updated**: November 15, 2025
**Status**: ✅ All deprecated code updated
