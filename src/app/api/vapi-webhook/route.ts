import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

interface VAPIWebhookData {
  type: string;
  call: {
    id: string;
    status: string;
    phoneNumberId: string;
    customer: {
      number: string;
    };
    metadata?: {
      candidateName?: string;
      jobTitle?: string;
      applicationId?: string;
      callType?: string;
    };
    transcript?: string;
    summary?: string;
    analysis?: Record<string, unknown>;
    createdAt: string;
    startedAt?: string;
    endedAt?: string;
  };
}

export async function POST(request: NextRequest) {
  try {
    const data: VAPIWebhookData = await request.json();
    
    console.log('Received VAPI webhook:', JSON.stringify(data, null, 2));
    
    const { type, call } = data;
    const { id: callId, metadata } = call;
    
    if (!metadata?.applicationId) {
      console.log('No application ID in webhook metadata, skipping processing');
      return NextResponse.json({ success: true });
    }
    
    const applicationId = metadata.applicationId;
    
    // Find the interview record by VAPI call ID
    const { data: interviews, error: fetchError } = await supabase
      .from('interviews')
      .select('*')
      .eq('vapi_call_id', callId)
      .eq('application_id', applicationId);
    
    if (fetchError) {
      console.error('Error fetching interview:', fetchError);
      return NextResponse.json({ error: 'Database error' }, { status: 500 });
    }
    
    if (!interviews || interviews.length === 0) {
      console.log('No interview found for call ID:', callId);
      return NextResponse.json({ success: true });
    }
    
    const interview = interviews[0];
    
    // Process different webhook types
    switch (type) {
      case 'call-started':
        await updateInterviewStatus(interview.id, 'in_progress', {
          started_at: call.startedAt || new Date().toISOString(),
          status: 'in_progress'
        });
        
        // Update application status
        await updateApplicationStatus(applicationId, 'screening');
        break;
        
      case 'call-ended':
        const interviewStatus = call.status === 'completed' ? 'completed' : 'cancelled';
        const duration = calculateDuration(call.startedAt, call.endedAt);
        
        await updateInterviewStatus(interview.id, interviewStatus, {
          completed_at: call.endedAt || new Date().toISOString(),
          status: interviewStatus,
          duration_minutes: duration,
          transcript: call.transcript || null,
          summary: call.summary || null,
          ...(call.analysis && { scores: call.analysis })
        });
        
        // Update application status based on interview outcome
        if (interviewStatus === 'completed') {
          await updateApplicationStatus(applicationId, 'interviewed');
        }
        break;
        
      case 'transcript-updated':
        await updateInterviewStatus(interview.id, interview.status, {
          transcript: call.transcript || null
        });
        break;
        
      default:
        console.log('Unhandled webhook type:', type);
    }
    
    return NextResponse.json({ success: true });
    
  } catch (error) {
    console.error('Error processing VAPI webhook:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

async function updateInterviewStatus(interviewId: string, status: string, updates: Record<string, unknown>) {
  const { error } = await supabase
    .from('interviews')
    .update({
      ...updates,
      updated_at: new Date().toISOString()
    })
    .eq('id', interviewId);
    
  if (error) {
    console.error('Error updating interview:', error);
  }
}

async function updateApplicationStatus(applicationId: string, status: string) {
  const { error } = await supabase
    .from('applications')
    .update({
      status,
      updated_at: new Date().toISOString()
    })
    .eq('id', applicationId);
    
  if (error) {
    console.error('Error updating application:', error);
  }
}

function calculateDuration(startedAt?: string, endedAt?: string): number | null {
  if (!startedAt || !endedAt) return null;
  
  const start = new Date(startedAt);
  const end = new Date(endedAt);
  
  return Math.round((end.getTime() - start.getTime()) / (1000 * 60)); // Duration in minutes
} 