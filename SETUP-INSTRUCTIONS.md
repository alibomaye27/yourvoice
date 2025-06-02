# File Upload and VAPI Integration Setup Instructions

This guide will help you implement file uploads for resumes and cover letters, along with VAPI live call control integration.

## 1. Database Migration

First, run the database migration to update the candidates table schema:

### Step 1: Run the migration script

```sql
-- Run this in your Supabase SQL Editor
-- (Located in database-migration-cover-letter.sql)

-- First, create a backup of the existing cover_letter data
ALTER TABLE candidates ADD COLUMN IF NOT EXISTS cover_letter_backup text;
UPDATE candidates SET cover_letter_backup = cover_letter WHERE cover_letter IS NOT NULL;

-- Add a new column for jsonb cover letter
ALTER TABLE candidates ADD COLUMN IF NOT EXISTS cover_letter_jsonb jsonb;

-- Convert existing text cover letters to jsonb format
UPDATE candidates 
SET cover_letter_jsonb = jsonb_build_object(
  'type', 'text',
  'content', cover_letter,
  'uploaded_at', NOW()
) 
WHERE cover_letter IS NOT NULL AND cover_letter != '';

-- Drop the old text column (you may want to keep the backup for safety)
ALTER TABLE candidates DROP COLUMN IF EXISTS cover_letter;

-- Rename the jsonb column to cover_letter
ALTER TABLE candidates RENAME COLUMN cover_letter_jsonb TO cover_letter;

-- Add any missing columns
ALTER TABLE candidates ADD COLUMN IF NOT EXISTS cover_letter_url text;
ALTER TABLE candidates ADD COLUMN IF NOT EXISTS resume_file_name text;
ALTER TABLE candidates ADD COLUMN IF NOT EXISTS cover_letter_file_name text;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_candidates_cover_letter_type ON candidates USING GIN ((cover_letter->>'type'));
CREATE INDEX IF NOT EXISTS idx_candidates_resume_type ON candidates USING GIN ((resume_text->>'type'));
```

## 2. Supabase Storage Setup

### Step 2: Create Storage Bucket

1. Go to your Supabase dashboard
2. Navigate to Storage
3. Create a new bucket called `candidate-documents`
4. Set the bucket to be **public** (for file access)
5. Set up RLS policies for the bucket:

```sql
-- Storage policies for candidate-documents bucket
INSERT INTO storage.policies (id, bucket_id, name, definition, check, command)
VALUES (
  'Allow public uploads',
  'candidate-documents', 
  'Allow public uploads',
  'true',
  'true',
  'INSERT'
);

INSERT INTO storage.policies (id, bucket_id, name, definition, check, command)
VALUES (
  'Allow public downloads',
  'candidate-documents',
  'Allow public downloads', 
  'true',
  'true',
  'SELECT'
);
```

## 3. Environment Variables

### Step 3: Add VAPI API Key

Add your VAPI API key to your environment variables:

```env
# .env.local
VAPI_API_KEY=your_vapi_api_key_here
```

## 4. Install Dependencies (if needed)

The file upload functionality uses standard Next.js APIs and doesn't require additional dependencies for basic text file handling. However, for enhanced PDF and Word document text extraction, you might want to install:

```bash
# Optional: For better PDF text extraction
npm install pdf-parse

# Optional: For Word document text extraction  
npm install mammoth
```

## 5. File Structure

The implementation includes these new files:

```
src/
├── app/api/upload-file/route.ts          # File upload API endpoint
├── components/ui/file-upload.tsx         # File upload component
├── lib/vapi-control.ts                   # VAPI live call control utilities
├── types/database.ts                     # Updated database types
└── app/apply/[jobId]/page.tsx           # Updated application form
```

## 6. Testing the Implementation

### Step 6: Test File Uploads

1. Navigate to a job application page
2. Try uploading different file types (PDF, DOC, DOCX, TXT)
3. Verify files are stored in Supabase Storage
4. Check that file metadata is saved in the database

### Step 7: Test VAPI Integration

1. Ensure you have a valid VAPI squad setup
2. Submit a job application with resume and cover letter
3. Check that the VAPI call is initiated
4. Verify that document content is injected into the call (check console logs)

## 7. Enhanced Features (Optional)

### Step 7.1: Better Text Extraction

To improve text extraction from PDFs and Word documents, update the upload API:

```typescript
// In src/app/api/upload-file/route.ts
import pdf from 'pdf-parse';
import mammoth from 'mammoth';

// For PDF files
if (file.type === 'application/pdf') {
  const pdfData = await pdf(buffer);
  extractedText = pdfData.text;
}

// For Word documents
if (file.type.includes('word')) {
  const result = await mammoth.extractRawText({ buffer });
  extractedText = result.value;
}
```

### Step 7.2: File Size Limits

Adjust file size limits in the FileUpload component:

```typescript
<FileUpload
  label="Resume"
  fileType="resume"
  onFileUploaded={setResumeDocument}
  maxSize={10} // 10MB limit
  required
/>
```

## 8. VAPI Live Call Control Features

The implementation includes several VAPI control features:

- **Document Injection**: Automatically injects resume and cover letter content
- **Message Control**: Can send messages during calls
- **Assistant Control**: Can mute/unmute the assistant
- **Call Transfer**: Can transfer calls to human interviewers
- **Call Termination**: Can end calls programmatically

### Example Usage:

```typescript
const controller = new VAPICallController(controlUrl);

// Inject documents
await controller.injectCandidateDocuments(resumeData, coverLetterData);

// Send a custom message
await controller.sayMessage("Thank you for your application!");

// Transfer to human
await controller.transferToHuman("+1234567890", "Transferring to hiring manager");
```

## 9. Troubleshooting

### Common Issues:

1. **Database Schema Error**: If you get schema errors, ensure you've run the migration script completely
2. **Storage Access Error**: Verify your Supabase storage bucket is public and has correct RLS policies
3. **VAPI Control Not Working**: Check that your VAPI API key is correct and the controlUrl is available
4. **File Upload Fails**: Verify file types and sizes are within limits

### Debug Steps:

1. Check browser console for errors
2. Verify API responses in Network tab
3. Check Supabase logs for database/storage errors
4. Test VAPI webhook endpoints separately

## 10. Security Considerations

1. **File Validation**: Always validate file types and sizes on the server
2. **Storage Security**: Consider implementing more restrictive RLS policies
3. **API Rate Limiting**: Implement rate limiting for file uploads
4. **Content Scanning**: Consider adding virus/malware scanning for uploaded files

The implementation is now ready for use! Users can upload resume and cover letter files, which will be stored securely and their content will be automatically injected into VAPI calls for enhanced AI interviews. 