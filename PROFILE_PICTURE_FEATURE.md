# Profile Picture Upload Feature

## Overview
Users can now upload profile pictures or provide image URLs for their accounts. OAuth users (Google Sign-In) automatically get their profile pictures from their Google account.

## Features

### For Local Accounts
- **File Upload**: Upload image files directly (JPG, PNG, GIF, WebP)
  - Maximum file size: 5MB
  - Files are stored in `backend/uploads/profiles/`
  - Automatic file validation and error handling
  
- **URL Input**: Provide a direct URL to an image
  - Supports any publicly accessible image URL
  - Useful for linking to external profile pictures

### For OAuth Accounts (Google)
- Profile pictures are automatically synced from Google account
- Users cannot manually change their profile picture
- Updates automatically when changed in Google account
- Clear notification displayed in profile edit mode

## Technical Implementation

### Backend

#### New Dependencies
- `multer`: File upload middleware
- `@types/multer`: TypeScript types for multer

#### New Files
- `backend/src/middleware/upload.middleware.ts`: Multer configuration for file uploads
- `backend/uploads/profiles/`: Directory for storing uploaded profile pictures

#### API Endpoints
- `POST /api/auth/profile-picture/upload`: Upload profile picture file
  - Requires authentication
  - Accepts multipart/form-data with `profilePicture` field
  - Returns updated user object with new profile picture URL

#### Existing Endpoints Updated
- `PUT /api/auth/profile`: Now handles both username and profile picture URL updates

#### Static File Serving
- `/uploads` route serves uploaded files statically
- Files are accessible at: `http://localhost:4000/uploads/profiles/{filename}`

### Frontend

#### New UI Components
- **Upload Method Toggle**: Switch between file upload and URL input
- **File Upload Button**: Drag-and-drop style file selector
- **Image Preview**: Shows preview of selected file before upload
- **OAuth Notice**: Informational message for Google users

#### File Handling
- Client-side validation for file type and size
- Preview generation using `URL.createObjectURL()`
- FormData API for multipart file upload
- Automatic cleanup of preview URLs

#### Image URL Helper
- `getImageUrl()` function converts relative paths to absolute URLs
- Handles both local uploads and external URLs
- Supports OAuth profile pictures from Google

## Usage

### For Users

#### Upload a Profile Picture (Local Accounts)
1. Go to Profile page
2. Click "Edit Profile"
3. In the Profile Picture section, ensure "Upload File" is selected
4. Click "Choose an image file"
5. Select an image (max 5MB)
6. Preview will appear below
7. Click "Save Changes"

#### Use a URL (Local Accounts)
1. Go to Profile page
2. Click "Edit Profile"
3. In the Profile Picture section, click "Use URL"
4. Enter the image URL
5. Click "Save Changes"

#### Google Account Users
- Your profile picture is automatically synced from Google
- Cannot be changed manually in the app
- Update it in your Google account settings

### For Developers

#### Testing File Upload
```bash
# Test upload endpoint with curl
curl -X POST http://localhost:4000/api/auth/profile-picture/upload \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -F "profilePicture=@/path/to/image.jpg"
```

#### Environment Variables
No new environment variables required. Uses existing:
- `NEXT_PUBLIC_API_URL`: Frontend API base URL
- `FRONTEND_URL`: Backend CORS configuration

## Security Considerations

1. **File Type Validation**: Only image files allowed (jpeg, jpg, png, gif, webp)
2. **File Size Limit**: Maximum 5MB per file
3. **Authentication Required**: All upload endpoints require valid JWT token
4. **Unique Filenames**: Files are named with `userId-timestamp` to prevent conflicts
5. **Directory Isolation**: Uploads are stored in dedicated directory
6. **CORS Configuration**: Proper CORS headers for cross-origin requests

## Database Schema

No changes to the Prisma schema required. Uses existing `profilePicture` field:
```prisma
model User {
  // ... other fields
  profilePicture String?  // Can store URL or relative path
  // ... other fields
}
```

## Future Enhancements

Potential improvements:
- Image compression/optimization before storage
- Multiple profile picture sizes (thumbnail, full)
- Image cropping tool in UI
- Cloud storage integration (AWS S3, Cloudinary)
- Profile picture history/gallery
- Avatar generation service integration
