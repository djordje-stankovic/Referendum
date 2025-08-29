# Drafts Implementation Guide

## 🚀 **Overview**
This document outlines the complete implementation of the Drafts functionality for the Municipal Proposals application. Users can now save their work-in-progress proposals as drafts and continue working on them later.

## 📋 **What's Been Implemented**

### 1. **Backend API** (`/backend/routes/draftRoutes.js`)
- **GET** `/api/drafts/:userId` - Fetch all drafts for a user
- **GET** `/api/drafts/:userId/:draftId` - Fetch specific draft
- **POST** `/api/drafts` - Create or update draft
- **DELETE** `/api/drafts/:userId/:draftId` - Delete draft
- **POST** `/api/drafts/:userId/:draftId/convert` - Convert draft to proposal

### 2. **Database Schema** (`/backend/create_drafts_table.sql`)
```sql
CREATE TABLE drafts (
  id SERIAL PRIMARY KEY,
  author_id INTEGER NOT NULL REFERENCES users(id),
  title VARCHAR(255),
  category_id INTEGER REFERENCES categories(id),
  municipality_id INTEGER DEFAULT 1,
  summary TEXT,
  details JSONB DEFAULT '{}',
  attachments TEXT[] DEFAULT '{}',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### 3. **Frontend Store** (`/client/src/stores/draft.js`)
- Pinia store for managing draft state
- CRUD operations for drafts
- Integration with backend API

### 4. **Drafts Page** (`/client/src/views/Drafts.vue`)
- Grid view of all user drafts
- Progress indicators for each draft
- Actions: Edit, Convert to Proposal, Delete
- Empty state for new users

### 5. **Enhanced Create Proposal** (`/client/src/views/ProposalCreate.vue`)
- Auto-save functionality every 2 seconds
- Load existing drafts from URL parameters
- Save as draft before leaving page
- Integration with draft store

### 6. **Navigation Updates**
- Added "My Drafts" to user menu
- Added "My Drafts" button in sticky search bar
- Added "View Drafts" button in empty state
- Breadcrumb navigation support

## 🛠️ **Setup Instructions**

### Step 1: Database Setup
```bash
# Connect to your PostgreSQL database
psql -U your_username -d your_database

# Run the SQL script
\i backend/create_drafts_table.sql
```

### Step 2: Backend Dependencies
```bash
cd backend
npm install pg
```

### Step 3: Environment Variables
Make sure your `.env` file has:
```env
DATABASE_URL=postgresql://username:password@localhost:5432/database_name
NODE_ENV=development
```

### Step 4: Frontend Dependencies
```bash
cd client
npm install
```

## 🔄 **How It Works**

### **Saving Drafts**
1. User types in Create Proposal form
2. Auto-save triggers every 2 seconds after changes
3. Draft is saved to database via API
4. User can continue editing or leave page

### **Loading Drafts**
1. User navigates to `/drafts` page
2. All drafts are fetched from database
3. User clicks on a draft to continue editing
4. Form is populated with draft data

### **Converting Drafts**
1. User completes draft and clicks "Submit Proposal"
2. Draft is converted to active proposal
3. Draft is automatically deleted
4. User is redirected to new proposal

## 🎯 **Key Features**

### **Auto-save**
- Saves every 2 seconds after user stops typing
- Silent saves (no notifications)
- Manual save button for immediate feedback

### **Progress Tracking**
- Visual progress bar for each draft
- Color-coded completion status
- Required vs optional field tracking

### **Smart Navigation**
- Drafts accessible from multiple locations
- Breadcrumb navigation support
- Seamless integration with existing flow

### **Data Persistence**
- All form data is preserved
- File attachments are saved
- Category and municipality information maintained

## 🚨 **Important Notes**

### **File Attachments**
- File objects are stored as names only
- Actual files need separate storage solution
- Consider implementing file upload service

### **Validation**
- Drafts don't require all fields to be filled
- Validation only occurs when converting to proposal
- Progress indicator shows completion percentage

### **Security**
- Users can only access their own drafts
- Draft deletion requires confirmation
- API endpoints validate user ownership

## 🔧 **Customization Options**

### **Auto-save Interval**
```javascript
// In ProposalCreate.vue, change this value:
setTimeout(() => {
  saveAsDraft(true); // Silent save
}, 2000); // 2 seconds
```

### **Progress Calculation**
```javascript
// In Drafts.vue, modify getDraftProgress function
const getDraftProgress = (draft) => {
  // Customize which fields count toward completion
  // Adjust weighting for different field types
};
```

### **Draft Expiration**
```sql
-- Add to database schema if needed
ALTER TABLE drafts ADD COLUMN expires_at TIMESTAMP;
-- Add cleanup job to delete expired drafts
```

## 🐛 **Troubleshooting**

### **Common Issues**

1. **Drafts not saving**
   - Check database connection
   - Verify API endpoints are working
   - Check browser console for errors

2. **Drafts not loading**
   - Verify user authentication
   - Check draft store initialization
   - Verify API response format

3. **Auto-save not working**
   - Check form input event handlers
   - Verify timeout clearing logic
   - Check draft store save method

### **Debug Commands**
```javascript
// In browser console
console.log('Draft Store:', useDraftStore());
console.log('Current Drafts:', useDraftStore().drafts);
console.log('Form Data:', formData.value);
```

## 🚀 **Next Steps**

### **Potential Enhancements**
1. **Draft Sharing** - Allow users to share drafts with others
2. **Draft Templates** - Pre-filled draft templates for common proposals
3. **Draft Collaboration** - Multiple users working on same draft
4. **Draft Versioning** - Track changes and revert to previous versions
5. **Draft Analytics** - Track draft completion rates and user behavior

### **Performance Optimizations**
1. **Debounced Auto-save** - Reduce API calls during rapid typing
2. **Batch Operations** - Save multiple drafts simultaneously
3. **Offline Support** - Cache drafts locally when offline
4. **Lazy Loading** - Load draft content only when needed

## 📞 **Support**

If you encounter any issues or have questions about the implementation:

1. Check the browser console for error messages
2. Verify all dependencies are installed
3. Ensure database connection is working
4. Check API endpoint responses
5. Review the implementation code for syntax errors

---

**Happy Drafting! 🎉**
