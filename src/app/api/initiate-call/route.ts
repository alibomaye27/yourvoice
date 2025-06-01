import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const { applicationId, candidatePhone, candidateName, jobTitle } = await request.json();

    // Fetch the application and job to get the correct squadId
    const { data: application, error: appError } = await supabase
      .from('applications')
      .select('id, job:job_id (vapi_squad_id)')
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

    // Optionally update application status, etc.

    return NextResponse.json({ success: true, callId: callResult.id });
  } catch (error) {
    console.error('Error initiating VAPI call:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 