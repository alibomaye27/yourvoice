import { NextRequest, NextResponse } from 'next/server';
import { vapiService } from '@/lib/vapi';

export async function GET(request: NextRequest) {
  try {
    const agents = await vapiService.getAgents();
    return NextResponse.json({ agents });
  } catch (error) {
    console.error('Error fetching agents:', error);
    return NextResponse.json(
      { error: 'Failed to fetch agents' },
      { status: 500 }
    );
  }
} 