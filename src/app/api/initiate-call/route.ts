import { NextRequest, NextResponse } from 'next/server';
import { getServerSupabase } from '@/lib/supabase';
import { VAPICallController } from '@/lib/vapi-control';

export async function POST(request: NextRequest) {
  try {
    const supabase = getServerSupabase();
    const { applicationId, candidatePhone, candidateName, jobTitle } = await request.json();

    // Fetch the application and job to get the correct squadId
    const { data: application, error: appError } = await supabase
      .from('applications')
      .select(`
        id, 
        job:job_id (vapi_squad_id),
        candidate:candidate_id (
          id,
          first_name,
          last_name,
          resume,
          cover_letter
        )
      `)
      .eq('id', applicationId)
      .single();

    if (appError || !(application?.job && ((application.job as unknown) as { vapi_squad_id?: string }).vapi_squad_id)) {
      return NextResponse.json(
        { error: 'Could not find job or squad for this application' },
        { status: 400 }
      );
    }
    
    const squadId = ((application.job as unknown) as { vapi_squad_id: string }).vapi_squad_id;
    const phoneNumberId = 'b2c3f1d2-3e38-47c8-bfd7-7e3cbd6d5536';
    const candidate = application.candidate as any;

    // Initiate VAPI call
    const vapiResponse = await fetch('https://api.vapi.ai/call', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.VAPI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        phoneNumberId,
        squadId,
        customer: {
          number: candidatePhone,
          name: candidateName
        },
        name: `AI Interview for ${candidateName}`,
        metadata: {
          candidateName,
          jobTitle,
          applicationId,
          candidateId: candidate.id,
          callType: 'interview_screening'
        }
      })
    });
    
    const callResult = await vapiResponse.json();

    if (!callResult || !callResult.id) {
      return NextResponse.json(
        { error: 'Failed to initiate call', details: callResult },
        { status: 500 }
      );
    }

    // Extract control URL from the monitor object
    const controlUrl = callResult.monitor?.controlUrl;
    
    if (controlUrl) {
      // Initialize call controller and inject candidate documents
      const callController = new VAPICallController(controlUrl);
      
      // Wait a moment for the call to be established
      setTimeout(async () => {
        try {
          // Inject resume and cover letter content into the call
          await callController.injectCandidateDocuments(
            candidate.resume,
            candidate.cover_letter
          );
          
          console.log('Successfully injected candidate documents into call');
        } catch (error) {
          console.error('Failed to inject candidate documents:', error);
        }
      }, 5000); // Wait 5 seconds for call to be established
    }

    // Store call information in interviews table
    try {
      await supabase
        .from('interviews')
        .insert({
          application_id: applicationId,
          step_name: 'AI Screening',
          agent_name: 'AI Interviewer',
          status: 'in_progress',
          vapi_call_id: callResult.id,
          phone_number_used: candidatePhone,
          started_at: new Date().toISOString()
        });
    } catch (error) {
      console.error('Failed to store interview record:', error);
      // Don't fail the whole request for this
    }

    return NextResponse.json({ 
      success: true, 
      callId: callResult.id,
      controlUrl: controlUrl,
      candidateDocumentsInjected: !!controlUrl
    });
  } catch (error) {
    console.error('Error initiating VAPI call:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 