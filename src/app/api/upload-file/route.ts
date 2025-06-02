import { NextRequest, NextResponse } from 'next/server';
import { getServerSupabase } from '@/lib/supabase';
const pdf = require('pdf-extraction');

export async function POST(request: NextRequest) {
  try {
    const supabase = getServerSupabase();
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const fileType = formData.get('type') as string; // 'resume' or 'cover_letter'
    
    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    if (!['resume', 'cover_letter'].includes(fileType)) {
      return NextResponse.json({ error: 'Invalid file type' }, { status: 400 });
    }

    // Validate file type
    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain'
    ];

    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ 
        error: 'Invalid file format. Please upload PDF, DOC, DOCX, or TXT files only.' 
      }, { status: 400 });
    }

    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ 
        error: 'File too large. Maximum size is 5MB.' 
      }, { status: 400 });
    }

    // Create unique filename
    const timestamp = Date.now();
    const sanitizedFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
    const fileName = `${fileType}/${timestamp}_${sanitizedFileName}`;

    // Convert file to buffer
    const buffer = Buffer.from(await file.arrayBuffer());

    // Upload to Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('candidate-documents')
      .upload(fileName, buffer, {
        contentType: file.type,
        metadata: {
          originalName: file.name,
          fileType: fileType,
          uploadedAt: new Date().toISOString()
        }
      });

    if (uploadError) {
      console.error('Upload error:', uploadError);
      return NextResponse.json({ 
        error: 'Failed to upload file' 
      }, { status: 500 });
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from('candidate-documents')
      .getPublicUrl(fileName);

    // Extract text content based on file type
    let extractedText = '';
    try {
      if (file.type === 'text/plain') {
        extractedText = await file.text();
        console.log(`Extracted ${extractedText.length} characters from text file`);
      } else if (file.type === 'application/pdf') {
        try {
          console.log('Extracting text from PDF using pdf-extraction...');
          const pdfData = await pdf(buffer);
          extractedText = pdfData.text.trim();
          console.log(`Extracted ${extractedText.length} characters from PDF (${pdfData.numpages} pages)`);
          
          if (!extractedText || extractedText.length < 10) {
            extractedText = '[PDF uploaded successfully but text extraction yielded minimal content - may be image-based PDF]';
          }
        } catch (pdfError) {
          console.error('PDF parsing error:', pdfError);
          extractedText = '[PDF uploaded successfully but text extraction failed - may be encrypted or image-based PDF]';
        }
      } else if (file.type.includes('word')) {
        // For Word documents, you might want to use mammoth or similar
        extractedText = '[Word document uploaded successfully - text extraction for Word docs not yet implemented]';
      }
    } catch (error) {
      console.error('Text extraction error:', error);
      extractedText = '[File uploaded successfully but text extraction failed]';
    }

    // Prepare response data
    const fileData = {
      url: urlData.publicUrl,
      fileName: file.name,
      originalName: file.name,
      size: file.size,
      type: file.type,
      extractedText,
      uploadedAt: new Date().toISOString(),
      storagePath: fileName
    };

    // Format the data based on file type for database storage
    const documentData = {
      type: 'file',
      content: extractedText,
      metadata: {
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type,
        url: urlData.publicUrl,
        storagePath: fileName
      },
      uploaded_at: new Date().toISOString()
    };

    return NextResponse.json({ 
      success: true, 
      fileData,
      documentData // This is what you'll store in the jsonb column
    });

  } catch (error) {
    console.error('File upload error:', error);
    return NextResponse.json({ 
      error: 'Internal server error' 
    }, { status: 500 });
  }
} 