# Bug Fixes for ESLint Warnings and Runtime Errors

## Critical Bugs
- [ ] MapLayerForm.jsx: `supabase` not defined in `handleSubmit` function (runtime error)
- [ ] MapLayerForm.jsx: useEffect missing dependency 'fetchLocation' (stale closure warning)
- [ ] TyphoonDashboard.jsx: useEffect missing dependency 'fetchTyphoonData' (stale closure warning)
- [ ] TyphoonForm.jsx: useEffect missing dependency 'fetchTyphoon' (stale closure warning)

## Implementation Plan
1. Declare `supabase` at component level in MapLayerForm.jsx
2. Wrap fetch functions in useCallback with proper dependencies
3. Add fetch functions to useEffect dependency arrays
4. Test the fixes by running build and checking for warnings
