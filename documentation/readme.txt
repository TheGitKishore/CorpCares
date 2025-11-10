# Volunteering Opportunity Management System - Documentation

## System Overview

This is a volunteering opportunity management system that connects Persons In Need (PINs) who need volunteer assistance with Corporate Social Responsibility Representatives (CSR Reps) who coordinate corporate volunteer programs.

**Key Actors:**
- **PIN (Person In Need)**: Creates service requests for volunteer assistance
- **CSR Rep**: Browses, saves, and shortlists volunteer opportunities on behalf of corporate volunteers
- **User Admin**: Manages user accounts and profiles
- **Platform Manager**: Manages service categories and generates reports

**Core Workflow:**
1. PINs create service requests in specific categories
2. CSR Reps browse available requests
3. CSR Reps can save requests to a personal saved list or shortlist priority opportunities
4. CSR Reps update request status (Pending → Matched → Complete)
5. System tracks engagement metrics (save count, shortlist count)
6. Platform generates daily, weekly, and monthly reports

---

## Controllers

### **Authentication Controllers**

#### AuthenticationController
**Purpose**: Handles user login, logout, and session validation

**Methods:**
- `login(username, rawPassword)`
  - Validates credentials using UserAccount.findByUsername()
  - Verifies password using userAccount.verifyPassword()
  - Creates new session using Session entity
  - Returns session token
  
- `logout(sessionToken)`
  - Finds session using Session.findByToken()
  - Calls session.endSession()
  
- `validateSession(sessionToken)`
  - Finds session using Session.findByToken()
  - Checks session.isValid()
  - Calls session.updateActivity()

---

### **CSR Controllers**

#### CSRCompletedRequestsViewController
**Purpose**: View all completed service requests system-wide

**Methods:**
- `viewCompleted(sessionToken)`
  - Uses AuthorizationHelper.checkPermission() with VIEW_ALL_REQUESTS
  - Calls ServiceRequest.findAllCompleted()

#### CSRSavedAddController
**Purpose**: Add service requests to CSR's saved list

**Methods:**
- `addToSaved(sessionToken, serviceRequestId)`
  - Uses AuthorizationHelper.checkPermission() with SAVE_REQUEST
  - Calls CSRSavedRequest.getByCSR() or creates new list
  - Calls ServiceRequest.findById()
  - Calls savedList.addServiceRequest()
  - Calls serviceRequest.incrementSaveCount()

#### CSRSavedCheckController
**Purpose**: Check if a request is in CSR's saved list

**Methods:**
- `checkIfSaved(sessionToken, serviceRequestId)`
  - Uses AuthorizationHelper.checkPermission() with VIEW_SAVED_REQUESTS
  - Calls CSRSavedRequest.getByCSR()
  - Checks if serviceRequestId exists in list

#### CSRSavedGetController
**Purpose**: Get or create CSR's saved list

**Methods:**
- `getSaved(sessionToken)`
  - Uses AuthorizationHelper.checkPermission() with VIEW_SAVED_REQUESTS
  - Calls CSRSavedRequest.getByCSR()
  - Creates new list if none exists

#### CSRSavedRemoveController
**Purpose**: Remove service requests from CSR's saved list

**Methods:**
- `removeFromSaved(sessionToken, serviceRequestId)`
  - Uses AuthorizationHelper.checkPermission() with UNSAVE_REQUEST
  - Calls CSRSavedRequest.getByCSR()
  - Calls CSRSavedRequest.removeItemById()
  - Calls serviceRequest.decrementSaveCount()

#### CSRSavedViewController
**Purpose**: View CSR's saved list with all items

**Methods:**
- `viewSaved(sessionToken)`
  - Uses AuthorizationHelper.checkPermission() with VIEW_SAVED_REQUESTS
  - Calls CSRSavedRequest.getByCSR()

#### CSRSearchCompletedRequestsController
**Purpose**: Search completed requests by category and date range

**Methods:**
- `searchCompleted(sessionToken, filters)`
  - Uses AuthorizationHelper.checkPermission() with VIEW_ALL_REQUESTS
  - Calls ServiceRequest.searchCompleted() with filters

#### CSRSearchRequestsByCategoryController
**Purpose**: Search pending/matched requests by category

**Methods:**
- `searchByCategory(sessionToken, categoryTitle)`
  - Uses AuthorizationHelper.checkPermission() with VIEW_ALL_REQUESTS
  - Calls ServiceRequest.searchByCategory()

#### CSRSearchSavedRequestsController
**Purpose**: Search within CSR's saved list by keyword

**Methods:**
- `searchSaved(sessionToken, searchTerm)`
  - Uses AuthorizationHelper.checkPermission() with VIEW_SAVED_REQUESTS
  - Calls CSRSavedRequest.getByCSR()
  - Filters results locally by title/description

#### CSRShortlistAddController
**Purpose**: Add service requests to CSR's shortlist

**Methods:**
- `addToShortlist(sessionToken, serviceRequestId)`
  - Uses AuthorizationHelper.checkPermission() with SHORTLIST_REQUEST
  - Calls CSRShortlist.getByCSR() or creates new list
  - Calls ServiceRequest.findById()
  - Calls shortlist.addServiceRequest()
  - Calls serviceRequest.incrementShortlistCount()

#### CSRShortlistCheckController
**Purpose**: Check if a request is in CSR's shortlist

**Methods:**
- `checkIfShortlisted(sessionToken, serviceRequestId)`
  - Uses AuthorizationHelper.checkPermission() with VIEW_SHORTLISTED_REQUESTS
  - Calls CSRShortlist.getByCSR()
  - Checks if serviceRequestId exists in list

#### CSRShortlistGetController
**Purpose**: Get or create CSR's shortlist

**Methods:**
- `getShortlist(sessionToken)`
  - Uses AuthorizationHelper.checkPermission() with VIEW_SHORTLISTED_REQUESTS
  - Calls CSRShortlist.getByCSR()
  - Creates new list if none exists

#### CSRShortlistRemoveController
**Purpose**: Remove service requests from CSR's shortlist

**Methods:**
- `removeFromShortlist(sessionToken, serviceRequestId)`
  - Uses AuthorizationHelper.checkPermission() with UNSHORTLIST_REQUEST
  - Calls CSRShortlist.getByCSR()
  - Calls CSRShortlist.removeItemById()
  - Calls serviceRequest.decrementShortlistCount()

#### CSRShortlistViewController
**Purpose**: View CSR's shortlist with all items

**Methods:**
- `viewShortlist(sessionToken)`
  - Uses AuthorizationHelper.checkPermission() with VIEW_SHORTLISTED_REQUESTS
  - Calls CSRShortlist.getByCSR()

---

### **PIN Controllers**

#### PINMatchHistorySearchController
**Purpose**: Search PIN's completed matches by category and date

**Methods:**
- `searchMatchHistory(sessionToken, filters)`
  - Uses AuthorizationHelper.checkPermission() with VIEW_OWN_REQUESTS
  - Calls ServiceRequest.searchCompletedByOwner()

#### PINMatchHistoryViewController
**Purpose**: View PIN's completed service requests

**Methods:**
- `viewMatchHistory(sessionToken)`
  - Uses AuthorizationHelper.checkPermission() with VIEW_OWN_REQUESTS
  - Calls ServiceRequest.findCompletedByOwnerId()

---

### **Platform Management Controllers**

#### PlatformDailyReportController
**Purpose**: Generate daily volunteer activity reports

**Methods:**
- `generateDailyReport(sessionToken, reportDate)`
  - Uses AuthorizationHelper.checkPermission() with VIEW_STATISTICS
  - Calls ServiceRequest.getDailyStatistics()

#### PlatformWeeklyReportController
**Purpose**: Generate weekly volunteer activity reports

**Methods:**
- `generateWeeklyReport(sessionToken, reportDate)`
  - Uses AuthorizationHelper.checkPermission() with VIEW_STATISTICS
  - Calls ServiceRequest.getWeeklyStatistics()

#### PlatformMonthlyReportController
**Purpose**: Generate monthly volunteer engagement reports

**Methods:**
- `generateMonthlyReport(sessionToken, year, month)`
  - Uses AuthorizationHelper.checkPermission() with VIEW_STATISTICS
  - Calls ServiceRequest.getMonthlyStatistics()

---

### **Service Category Controllers**

#### ServiceCategoryCreationController
**Purpose**: Create new service categories

**Methods:**
- `createServiceCategory(sessionToken, title, description)`
  - Uses AuthorizationHelper.checkPermission() with CREATE_CATEGORY
  - Creates ServiceCategory entity
  - Calls category.createServiceCategory()

#### ServiceCategoryDeleteController
**Purpose**: Delete service categories

**Methods:**
- `findServiceCategoryById(id)` (static factory)
  - Calls ServiceCategory.getServiceCategoryById()
  
- `deleteServiceCategory(sessionToken)`
  - Uses AuthorizationHelper.checkPermission() with DELETE_CATEGORY
  - Calls category.deleteServiceCategory()

#### ServiceCategoryUpdateController
**Purpose**: Update service categories

**Methods:**
- `findServiceCategoryById(id)` (static factory)
  - Calls ServiceCategory.getServiceCategoryById()
  
- `updateServiceCategory(sessionToken, title, description)`
  - Uses AuthorizationHelper.checkPermission() with UPDATE_CATEGORY
  - Calls category.updateServiceCategory()

#### ServiceCategoryViewAllController
**Purpose**: View all service categories

**Methods:**
- `viewAllServiceCategories(sessionToken)`
  - Uses AuthorizationHelper.checkPermission() with VIEW_ALL_CATEGORIES
  - Calls ServiceCategory.getAllServiceCategories()

#### ServiceCategoryViewSingleController
**Purpose**: View single service category by title

**Methods:**
- `viewServiceCategoryByTitle(sessionToken, categoryTitle)`
  - Uses AuthorizationHelper.checkPermission() with VIEW_CATEGORY
  - Calls ServiceCategory.getServiceCategoryByTitle()

---

### **Service Request Controllers**

#### ServiceRequestCreationController
**Purpose**: Create new service requests

**Methods:**
- `createServiceRequest(sessionToken, title, description, categoryTitle)`
  - Uses AuthorizationHelper.checkPermission() with CREATE_OWN_REQUEST
  - Calls ServiceCategory.getServiceCategoryByTitle()
  - Creates ServiceRequest entity
  - Calls serviceRequest.createServiceRequest()

#### ServiceRequestDeleteController
**Purpose**: Delete service requests (owner or admin)

**Methods:**
- `findById(requestId)` (static factory)
  - Calls ServiceRequest.findById()
  
- `deleteServiceRequest(sessionToken)`
  - Uses AuthorizationHelper.verifyOwnershipOrPermission() with DELETE_ANY_REQUEST
  - Calls serviceRequest.deleteServiceRequest()

#### ServiceRequestStatusController
**Purpose**: Update service request status

**Methods:**
- `markAsMatched(sessionToken, serviceRequestId)`
  - Uses AuthorizationHelper.checkPermission() with UPDATE_REQUEST_STATUS
  - Calls ServiceRequest.findById()
  - Calls serviceRequest.updateStatus("Matched")

- `markAsComplete(sessionToken, serviceRequestId)`
  - Uses AuthorizationHelper.checkPermission() with UPDATE_REQUEST_STATUS
  - Calls ServiceRequest.findById()
  - Calls serviceRequest.updateStatus("Complete")

- `updateStatus(sessionToken, serviceRequestId, newStatus)`
  - Uses AuthorizationHelper.checkPermission() with UPDATE_REQUEST_STATUS
  - Calls ServiceRequest.findById()
  - Calls serviceRequest.updateStatus()

#### ServiceRequestUpdateController
**Purpose**: Update service request details

**Methods:**
- `findById(requestId)` (static factory)
  - Calls ServiceRequest.findById()
  
- `updateServiceRequest(sessionToken, title, description, categoryTitle)`
  - Uses AuthorizationHelper.verifyOwnershipOrPermission() with UPDATE_OWN_REQUEST
  - Calls ServiceCategory.getServiceCategoryByTitle()
  - Calls serviceRequest.updateServiceRequest()

#### ServiceRequestViewAllController
**Purpose**: View all service requests (admin view)

**Methods:**
- `viewAllServiceRequests(sessionToken)`
  - Uses AuthorizationHelper.checkPermission() with VIEW_ALL_REQUESTS
  - Calls ServiceRequest.viewAllServiceRequests()

#### ServiceRequestViewSingleController
**Purpose**: View single service request

**Methods:**
- `viewServiceRequestById(sessionToken, requestId)`
  - Uses AuthorizationHelper.checkAnyPermission() with VIEW_ALL_REQUESTS or VIEW_OWN_REQUESTS
  - Calls ServiceRequest.findById()
  - Validates ownership if user doesn't have VIEW_ALL_REQUESTS

---

### **User Account Controllers**

#### UserAccountCreationController
**Purpose**: Create new user accounts

**Methods:**
- `createUserAccount(sessionToken, username, rawPassword, roleName, email, name)`
  - Uses AuthorizationHelper.checkPermission() with CREATE_USER
  - Calls UserAccount.existsByUsername()
  - Calls UserProfile.findByRoleName()
  - Creates Password entity
  - Creates UserAccount entity
  - Calls userAccount.createUserAccount()

#### UserAccountDeleteController
**Purpose**: Delete user accounts

**Methods:**
- `findById(userId)` (static factory)
  - Calls UserAccount.findById()
  
- `deleteUserAccount(sessionToken)`
  - Uses AuthorizationHelper.checkPermission() with DELETE_USER
  - Calls userAccount.deleteUserAccount() (cascades to all related data)

#### UserAccountUpdateController
**Purpose**: Update user account details

**Methods:**
- `findById(userId)` (static factory)
  - Calls UserAccount.findById()
  
- `updateUserAccount(sessionToken, username, name, email, rawPassword, roleName, isActive)`
  - Uses AuthorizationHelper.checkPermission() with UPDATE_USER
  - Calls UserProfile.findByRoleName()
  - Calls userAccount.updateUserAccount()

#### UserAccountViewAllController
**Purpose**: View all user accounts

**Methods:**
- `viewUserAccounts(sessionToken)`
  - Uses AuthorizationHelper.checkPermission() with VIEW_ALL_USERS
  - Calls UserAccount.viewUserAccounts()

#### UserAccountViewSingleController
**Purpose**: View single user account

**Methods:**
- `viewSingleUserAccount(sessionToken, userId)`
  - Uses AuthorizationHelper.checkPermission() with VIEW_USER
  - Calls UserAccount.findById()

---

### **User Profile Controllers**

#### UserProfileCreationController
**Purpose**: Create new user profiles (roles)

**Methods:**
- `createUserProfile(sessionToken, roleName, description, permissions)`
  - Uses AuthorizationHelper.checkPermission() with CREATE_PROFILE
  - Creates UserProfile entity
  - Calls profile.createUserProfile()

#### UserProfileDeleteController
**Purpose**: Delete user profiles

**Methods:**
- `findByRoleName(roleName)` (static factory)
  - Calls UserProfile.findByRoleName()
  
- `deleteUserProfile(sessionToken)`
  - Uses AuthorizationHelper.checkPermission() with DELETE_PROFILE
  - Calls profile.deleteUserProfile()

#### UserProfileUpdateController
**Purpose**: Update user profiles

**Methods:**
- `findByRoleName(roleName)` (static factory)
  - Calls UserProfile.findByRoleName()
  
- `updateUserProfile(sessionToken, newRoleName, newDescription, newPermissions)`
  - Uses AuthorizationHelper.checkPermission() with UPDATE_PROFILE
  - Calls profile.updateUserProfile()

#### UserProfileViewAllController
**Purpose**: View all user profiles

**Methods:**
- `viewAllProfiles(sessionToken)`
  - Uses AuthorizationHelper.checkPermission() with VIEW_ALL_PROFILES
  - Calls UserProfile.viewAllUserProfiles()

#### UserProfileViewSingleController
**Purpose**: View single user profile

**Methods:**
- `viewProfileByRoleName(sessionToken, roleName)`
  - Uses AuthorizationHelper.checkPermission() with VIEW_PROFILE
  - Calls UserProfile.findByRoleName()

---

## Entities

### **CSRSavedRequest**
**Purpose**: Manages CSR's saved request list and items

**Methods:**
- `createSavedList()` - Inserts saved list into database
- `addServiceRequest(serviceRequest)` - Adds item to saved list
- `loadServiceRequests()` - Loads all items for this list
- `removeItemById(itemId)` (static) - Deletes item from database
- `getByCSR(csrId)` (static) - Loads saved list for a CSR
  - Calls UserAccount.findById()
  - Calls loadServiceRequests()

### **CSRShortlist**
**Purpose**: Manages CSR's shortlist and items

**Methods:**
- `createShortlist()` - Inserts shortlist into database
- `addServiceRequest(serviceRequest)` - Adds item to shortlist
- `loadServiceRequests()` - Loads all items for this list
- `removeItemById(itemId)` (static) - Deletes item from database
- `getByCSR(csrId)` (static) - Loads shortlist for a CSR
  - Calls UserAccount.findById()
  - Calls loadServiceRequests()

### **Password**
**Purpose**: Handles password hashing and verification

**Methods:**
- `hashPassword(rawPassword)` - Hashes password using bcrypt
- `verify(inputPassword)` - Verifies password against hash
- `fromHash(storedHash)` (static) - Creates instance from existing hash

### **ServiceCategory**
**Purpose**: Manages volunteer service categories

**Methods:**
- `createServiceCategory()` - Inserts category into database
- `updateServiceCategory(title, description)` - Updates category
- `deleteServiceCategory()` - Deletes category from database
- `getAllServiceCategories()` (static) - Returns all categories
- `getServiceCategoryById(id)` (static) - Finds category by ID
- `getServiceCategoryByTitle(title)` (static) - Finds category by title

### **ServiceRequest**
**Purpose**: Manages volunteer service requests

**Methods:**
- `createServiceRequest()` - Inserts request into database
- `updateServiceRequest(title, description, category)` - Updates request details
- `updateStatus(newStatus)` - Changes request status
- `incrementShortlistCount()` - Increases shortlist counter
- `decrementShortlistCount()` - Decreases shortlist counter
- `incrementSaveCount()` - Increases save counter
- `decrementSaveCount()` - Decreases save counter
- `deleteServiceRequest()` - Deletes request from database
- `viewAllServiceRequests()` (static) - Returns all requests
  - Calls ServiceCategory.getServiceCategoryByTitle() for each
  - Calls UserAccount.findById() for each
- `findById(id)` (static) - Finds request by ID
  - Calls ServiceCategory.getServiceCategoryByTitle()
  - Calls UserAccount.findById()
- `findByTitle(title)` (static) - Finds request by title
  - Calls ServiceCategory.getServiceCategoryByTitle()
  - Calls UserAccount.findById()
- `findByOwnerId(ownerId)` (static) - Finds all requests by owner
  - Calls ServiceCategory.getServiceCategoryByTitle() for each
  - Calls UserAccount.findById() for each
- `findCompletedByOwnerId(ownerId)` (static) - Finds completed requests by owner
  - Calls ServiceCategory.getServiceCategoryByTitle() for each
  - Calls UserAccount.findById() for each
- `searchCompletedByOwner(ownerId, categoryTitle, startDate, endDate)` (static) - Searches completed with filters
  - Calls ServiceCategory.getServiceCategoryByTitle() for each
  - Calls UserAccount.findById() for each
- `searchByCategory(categoryTitle)` (static) - Searches by category (excludes completed)
  - Calls ServiceCategory.getServiceCategoryByTitle() for each
  - Calls UserAccount.findById() for each
- `findAllCompleted()` (static) - Finds all completed requests
  - Calls ServiceCategory.getServiceCategoryByTitle() for each
  - Calls UserAccount.findById() for each
- `searchCompleted(categoryTitle, startDate, endDate)` (static) - Searches completed with filters
  - Calls ServiceCategory.getServiceCategoryByTitle() for each
  - Calls UserAccount.findById() for each
- `getDailyStatistics(startDate, endDate)` (static) - Aggregates daily stats
- `getWeeklyStatistics(weekStart, weekEnd)` (static) - Aggregates weekly stats
- `getMonthlyStatistics(monthStart, monthEnd)` (static) - Aggregates monthly stats

### **Session**
**Purpose**: Manages user sessions and authentication tokens

**Methods:**
- `#generateToken()` (private) - Creates secure random token
- `createSession()` - Inserts session into database
- `updateActivity()` - Updates last activity timestamp
- `endSession()` - Marks session as inactive
- `isValid(timeoutMinutes)` - Checks if session hasn't timed out
- `findByToken(sessionToken)` (static) - Finds active session by token
  - Calls UserAccount.findById()
- `endAllSessionsForUser(userId)` (static) - Deactivates all user sessions
- `cleanupExpiredSessions(timeoutMinutes)` (static) - Bulk deactivates expired sessions

### **UserAccount**
**Purpose**: Manages user accounts and credentials

**Methods:**
- `createUserAccount()` - Inserts user into database
- `updateUserAccount(username, name, email, rawPassword, profile, isActive)` - Updates user details
  - Creates new Password if rawPassword provided
- `deleteUserAccount()` - Cascading delete of user and all related data
  - Deletes: Sessions, CSRSavedRequestItem, CSRSavedRequest, CSRShortlistItem, CSRShortlist, ServiceRequest
- `verifyPassword(rawPassword)` - Validates login password
  - Uses Password.fromHash() and verify()
- `viewUserAccounts()` (static) - Returns all users with profiles
  - Joins with UserProfile table
- `findById(userId)` (static) - Finds user by ID
  - Creates UserProfile entity
  - Creates Password entity from hash
- `findByUsername(username)` (static) - Finds user by username
  - Creates UserProfile entity
  - Creates Password entity from hash
- `existsById(userId)` (static) - Checks if user ID exists
- `existsByUsername(username)` (static) - Checks if username exists

### **UserProfile**
**Purpose**: Manages user roles and permissions

**Methods:**
- `hasPermission(action)` - Checks single permission
- `hasAnyPermission(actions)` - Checks if has any of multiple permissions
- `hasAllPermissions(actions)` - Checks if has all permissions
- `createUserProfile()` - Inserts profile into database
- `updateUserProfile(newRoleName, newDescription, newPermissions)` - Updates profile
- `deleteUserProfile()` - Deletes profile from database
- `viewAllUserProfiles()` (static) - Returns all profiles
- `findByRoleName(roleName)` (static) - Finds profile by role name

---

## Helpers

### **AuthorizationHelper**
**Purpose**: Centralized authorization and session validation

**Methods:**
- `checkPermission(sessionToken, requiredAction)` (static) - Validates single permission
  - Calls Session.findByToken()
  - Calls session.isValid()
  - Calls session.updateActivity()
  - Calls userAccount.profile.hasPermission()

- `checkAnyPermission(sessionToken, allowedActions)` (static) - Validates any of multiple permissions
  - Calls Session.findByToken()
  - Calls session.isValid()
  - Calls session.updateActivity()
  - Calls userAccount.profile.hasAnyPermission()

- `checkAllPermissions(sessionToken, requiredActions)` (static) - Validates all permissions
  - Calls Session.findByToken()
  - Calls session.isValid()
  - Calls session.updateActivity()
  - Calls userAccount.profile.hasAllPermissions()

- `verifyOwnership(sessionToken, userId)` (static) - Validates user owns resource
  - Calls Session.findByToken()
  - Calls session.isValid()
  - Calls session.updateActivity()

- `verifyOwnershipOrPermission(sessionToken, userId, requiredAction)` (static) - Validates ownership OR permission
  - Calls Session.findByToken()
  - Calls session.isValid()
  - Calls session.updateActivity()
  - Calls userAccount.profile.hasPermission()

---

## Functionalities by User Role

### **PIN (Person In Need)**
**Permissions**: CREATE_OWN_REQUEST, UPDATE_OWN_REQUEST, DELETE_OWN_REQUEST, VIEW_OWN_REQUESTS, VIEW_STATISTICS

**Can:**
- Create service requests for volunteer opportunities
- Update their own service requests (title, description, category)
- Delete their own service requests
- View their own service requests
- View match history (completed requests)
- Search match history by category and date range
- View platform statistics reports

**Cannot:**
- View other users' requests
- Update request status
- Save or shortlist requests
- Manage users, profiles, or categories

---

### **CSR Rep (Corporate Social Responsibility Representative)**
**Permissions**: VIEW_ALL_REQUESTS, SAVE_REQUEST, UNSAVE_REQUEST, SHORTLIST_REQUEST, UNSHORTLIST_REQUEST, VIEW_SAVED_REQUESTS, VIEW_SHORTLISTED_REQUESTS, UPDATE_REQUEST_STATUS

**Can:**
- View all service requests (system-wide)
- View individual service request details
- Search requests by category
- View all completed requests
- Search completed requests by category and date
- Save requests to personal saved list
- Remove requests from saved list
- Check if request is saved
- View saved list
- Search within saved list by keyword
- Add requests to shortlist
- Remove requests from shortlist
- Check if request is shortlisted
- View shortlist
- Update request status (Pending → Matched → Complete)

**Cannot:**
- Create, update, or delete service requests (except status)
- Manage users, profiles, or categories
- View statistics reports

---

### **User Admin**
**Permissions**: CREATE_USER, UPDATE_USER, DELETE_USER, VIEW_ALL_USERS, VIEW_USER, CREATE_PROFILE, UPDATE_PROFILE, DELETE_PROFILE, VIEW_ALL_PROFILES, VIEW_PROFILE

**Can:**
- Create new user accounts
- Update user account details (username, email, name, password, role, active status)
- Delete user accounts (cascading delete)
- View all user accounts
- View individual user account details
- Create new user profiles (roles)
- Update user profiles (role name, description, permissions)
- Delete user profiles
- View all user profiles
- View individual user profile details

**Cannot:**
- Manage service requests or categories
- Save/shortlist requests
- View statistics reports

---

### **Platform Manager**
**Permissions**: CREATE_CATEGORY, UPDATE_CATEGORY, DELETE_CATEGORY, VIEW_ALL_CATEGORIES, VIEW_CATEGORY

**Can:**
- Create new service categories
- Update service category details (title, description)
- Delete service categories
- View all service categories
- View individual service category details

**Cannot:**
- Manage service requests, users, or profiles
- Save/shortlist requests
- View statistics reports

---

### **Note on Statistics Access**
The VIEW_STATISTICS permission is assigned to the PIN role in the constants file, allowing PINs to generate daily, weekly, and monthly reports. This seems intentional but may need review based on business requirements. If CSR Reps or Platform Managers need reporting access, the permission assignments should be updated.

---

## Security Model

**Authentication**: Token-based sessions with configurable timeout (default 60 minutes)
**Authorization**: Permission-based access control via UserProfile
**Password Security**: Bcrypt hashing with 10 salt rounds
**Session Management**: Automatic timeout, activity tracking, single-session enforcement option

**Key Security Features:**
- All controller actions require valid session token
- Permissions checked before every operation
- Ownership validation for resource-specific operations
- Cascading deletes prevent orphaned data
- Inactive accounts cannot log in