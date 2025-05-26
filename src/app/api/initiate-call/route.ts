import { NextRequest, NextResponse } from 'next/server';
import { vapiService, handleVAPIError } from '@/lib/vapi';
import { supabase } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const { applicationId, candidatePhone, candidateName, jobTitle, squadId } = await request.json();
    
    // Validate required fields
    if (!applicationId || !candidatePhone || !candidateName || !jobTitle || !squadId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }
    
    console.log('Initiating VAPI call for application:', applicationId);
    
    // Initiate VAPI call with metadata
    const callResult = await vapiService.makeCall(
      candidatePhone,
      squadId,
      {
        candidateName,
        jobTitle,
        applicationId,
        callType: 'interview_screening'
      }
    );
    
    if (!callResult || !callResult.id) {
      console.error('Failed to initiate VAPI call');
      return NextResponse.json(
        { error: 'Failed to initiate call' },
        { status: 500 }
      );
    }
    
    console.log('VAPI call initiated with ID:', callResult.id);
    
    // Update application status to screening
    const { error: updateError } = await supabase
      .from('applications')
      .update({ 
        status: 'screening',
        updated_at: new Date().toISOString()
      })
      .eq('id', applicationId);
    
    if (updateError) {
      console.error('Error updating application status:', updateError);
      // Don't fail the request, just log the error
    }
    
    // Create initial interview record
    const { error: interviewError } = await supabase
      .from('interviews')
      .insert({
        application_id: applicationId,
        step_name: 'Initial Screening',
        agent_name: 'AI Screening Agent',
        status: 'scheduled',
        vapi_call_id: callResult.id,
        phone_number_used: candidatePhone,
        scheduled_at: new Date().toISOString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });
    
    if (interviewError) {
      console.error('Error creating interview record:', interviewError);
      // Don't fail the request, just log the error
    }
    
    return NextResponse.json({
      success: true,
      callId: callResult.id,
      message: 'Call initiated successfully'
    });
    
  } catch (error) {
    console.error('Error in initiate-call API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 