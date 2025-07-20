# Client Management Users - Comprehensive Test Plan

## Overview
This test plan covers the complete testing of client management users functionality for 4syz administrators, including both the dedicated client users page and the integrated client users modal.

## Test Environment
- Frontend: Next.js development server (http://localhost:3000)
- Backend: Django REST API
- User Role: 4syz Owner/Admin with full permissions

## Test Scenarios

### 1. Navigation Access Test
**Objective**: Verify that client management users can be accessed through navigation

**Steps**:
1. Login as 4syz Owner/Admin
2. Navigate to 4syz Admin dashboard
3. Click on "Client Management" dropdown
4. Click on "Client Users" option
5. Verify page loads successfully

**Expected Results**:
- ✅ Navigation dropdown works correctly
- ✅ Client Users page loads without errors
- ✅ Page shows proper title and description

### 2. Client Users Page - Data Loading Test
**Objective**: Verify that client users data loads correctly from API

**Steps**:
1. Access the Client Users page (/start/client-management/users)
2. Wait for data to load
3. Check if users are displayed in the table
4. Verify client information is shown correctly

**Expected Results**:
- ✅ Loading state is shown initially
- ✅ Users data loads successfully
- ✅ Each user shows: Name, Email, Client, Role, Status, Last Login
- ✅ Client names are displayed correctly (not "Unknown Client")
- ✅ No console errors

### 3. Client Users Page - Filtering Test
**Objective**: Test all filtering functionality

**Steps**:
1. Test search functionality:
   - Search by user first name
   - Search by user last name
   - Search by email
   - Search by client name
   - Search by role
2. Test status filter:
   - Filter by "Active" users
   - Filter by "Inactive" users
   - Filter by "All Status"
3. Test client filter:
   - Filter by specific client
   - Filter by "All Clients"
4. Test role filter:
   - Filter by specific role
   - Filter by "All Roles"
5. Test last login filter:
   - Filter by "Never Logged In"
   - Filter by "Last 30 Days"
   - Filter by "Last 90 Days"
   - Filter by "Inactive 90+ Days"

**Expected Results**:
- ✅ Search works for all fields
- ✅ Status filter works correctly
- ✅ Client filter shows correct client names
- ✅ Role filter works correctly
- ✅ Last login filter works correctly
- ✅ Filter combinations work together

### 4. Client Users Page - Sorting Test
**Objective**: Test sorting functionality

**Steps**:
1. Test sorting by Name (ascending/descending)
2. Test sorting by Email (ascending/descending)
3. Test sorting by Client (ascending/descending)
4. Test sorting by Role (ascending/descending)
5. Test sorting by Status (ascending/descending)
6. Test sorting by Last Login (ascending/descending)

**Expected Results**:
- ✅ All sort columns work correctly
- ✅ Sort order toggles properly
- ✅ Sort indicators show correctly

### 5. Client Users Page - Bulk Operations Test
**Objective**: Test bulk user management operations

**Steps**:
1. Select individual users using checkboxes
2. Use "Select All" checkbox
3. Test bulk activate operation
4. Test bulk deactivate operation
5. Test bulk decommission operation

**Expected Results**:
- ✅ Individual selection works
- ✅ Select all works correctly
- ✅ Bulk operations execute successfully
- ✅ Success notifications appear
- ✅ User status updates immediately

### 6. Client Users Page - Individual User Operations Test
**Objective**: Test individual user status toggle

**Steps**:
1. Find a user with active status
2. Click the status toggle button
3. Verify status changes
4. Test the reverse operation

**Expected Results**:
- ✅ Status toggle works correctly
- ✅ Success notifications appear
- ✅ Status updates immediately in UI

### 7. Client Users Page - Statistics Test
**Objective**: Verify statistics display correctly

**Steps**:
1. Check total users count
2. Check active users count
3. Check inactive users count
4. Check never logged in count
5. Check inactive 90+ days count

**Expected Results**:
- ✅ All statistics are accurate
- ✅ Numbers match filtered data
- ✅ Statistics update when filters change

### 8. Client Management - Integrated Users Modal Test
**Objective**: Test the client users modal within client management

**Steps**:
1. Navigate to Client Management page (/start/clients)
2. Find a client with users
3. Click "View Users" button
4. Test modal functionality:
   - Search users
   - Filter by status
   - Filter by role
   - Sort users
   - Toggle user status
   - Bulk operations

**Expected Results**:
- ✅ Modal opens correctly
- ✅ Only users for that specific client are shown
- ✅ All filtering and sorting works
- ✅ User operations work correctly
- ✅ Modal closes properly

### 9. Data Structure Verification Test
**Objective**: Verify correct handling of nested data structure

**Steps**:
1. Check browser console for any data structure errors
2. Verify user data is accessed correctly (userClient.user.first_name)
3. Verify client data is accessed correctly (userClient.client.name)
4. Check if any "undefined" values appear in the UI

**Expected Results**:
- ✅ No console errors related to data structure
- ✅ All user information displays correctly
- ✅ All client information displays correctly
- ✅ No "undefined" values in UI

### 10. Error Handling Test
**Objective**: Test error handling and user feedback

**Steps**:
1. Simulate network errors (disconnect internet)
2. Test with invalid API responses
3. Test with empty data sets
4. Test with malformed data

**Expected Results**:
- ✅ Error messages are displayed clearly
- ✅ Loading states work correctly
- ✅ Empty states are handled gracefully
- ✅ No application crashes

### 11. Responsive Design Test
**Objective**: Verify responsive design works on different screen sizes

**Steps**:
1. Test on desktop (1920x1080)
2. Test on tablet (768x1024)
3. Test on mobile (375x667)
4. Test table responsiveness
5. Test filter layout

**Expected Results**:
- ✅ Layout adapts to screen size
- ✅ Table is scrollable on mobile
- ✅ Filters stack properly on small screens
- ✅ All functionality works on mobile

### 12. Permission Test
**Objective**: Test role-based access control

**Steps**:
1. Login as different user roles:
   - 4syz Owner
   - 4syz Admin
   - 4syz User
   - Client Admin
   - Client User
2. Try to access client management users page
3. Check what operations are available

**Expected Results**:
- ✅ Only authorized users can access the page
- ✅ Permission gates work correctly
- ✅ Unauthorized users see appropriate error messages

## Test Execution Checklist

### Pre-Test Setup
- [ ] Development server is running
- [ ] Backend API is accessible
- [ ] Test user accounts are available
- [ ] Browser console is open for error monitoring

### Test Execution
- [ ] Navigation Access Test
- [ ] Data Loading Test
- [ ] Filtering Test
- [ ] Sorting Test
- [ ] Bulk Operations Test
- [ ] Individual Operations Test
- [ ] Statistics Test
- [ ] Integrated Modal Test
- [ ] Data Structure Verification
- [ ] Error Handling Test
- [ ] Responsive Design Test
- [ ] Permission Test

### Post-Test Verification
- [ ] All tests pass
- [ ] No console errors
- [ ] No build errors
- [ ] All functionality works as expected

## Known Issues to Check

1. **Data Structure**: Ensure nested UserClient objects are handled correctly
2. **Filtering**: Verify client filtering works by client name, not email domain
3. **State Management**: Check that filteredUsers state is properly managed
4. **API Integration**: Verify all API calls work correctly
5. **Notifications**: Ensure success/error notifications appear

## Success Criteria

The client management users functionality is considered working correctly when:

1. ✅ All test scenarios pass
2. ✅ No critical errors in console
3. ✅ All user operations work as expected
4. ✅ Data displays correctly
5. ✅ Filtering and sorting work properly
6. ✅ Bulk operations function correctly
7. ✅ Responsive design works on all screen sizes
8. ✅ Permission system works correctly

## Notes

- Focus on testing the actual functionality rather than just the UI
- Pay special attention to data structure handling
- Verify that both the dedicated page and integrated modal work correctly
- Test with real data when possible
- Document any issues found during testing 