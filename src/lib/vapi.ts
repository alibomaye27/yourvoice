interface VAPICallRequest {
  phoneNumberId: string;
  customer: {
    number: string;
  };
  assistantId?: string;
  squadId?: string;
  metadata?: {
    candidateName?: string;
    jobTitle?: string;
    applicationId?: string;
    callType?: string;
  };
}

interface VAPICallResponse {
  id: string;
  status: string;
  phoneNumberId: string;
  customer: {
    number: string;
  };
  createdAt: string;
  updatedAt: string;
}

class VAPIService {
  private apiKey: string;
  private baseUrl: string;

  constructor() {
    this.apiKey = process.env.VAPI_API_KEY || '';
    this.baseUrl = 'https://api.vapi.ai';
    
    if (!this.apiKey) {
      throw new Error('VAPI_API_KEY environment variable is required');
    }
  }

  async makeCall(
    phoneNumber: string, 
    squadId: string, 
    metadata?: {
      candidateName?: string;
      jobTitle?: string;
      applicationId?: string;
      callType?: string;
    }
  ): Promise<VAPICallResponse> {
    try {
      const phoneNumberId = process.env.VAPI_PHONE_NUMBER_ID;
      
      if (!phoneNumberId) {
        throw new Error('VAPI_PHONE_NUMBER_ID environment variable is required');
      }

      const callData: VAPICallRequest = {
        phoneNumberId,
        customer: {
          number: phoneNumber
        },
        squadId,
        ...(metadata && { metadata })
      };

      console.log('Making VAPI call with data:', JSON.stringify(callData, null, 2));

      const response = await fetch(`${this.baseUrl}/call`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(callData),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('VAPI API error:', response.status, errorText);
        throw new Error(`VAPI API error: ${response.status} - ${errorText}`);
      }

      const result = await response.json();
      console.log('VAPI call initiated successfully:', result);
      return result;
    } catch (error) {
      console.error('Error making VAPI call:', error);
      throw error;
    }
  }

  async getCall(callId: string): Promise<any> {
    try {
      const response = await fetch(`${this.baseUrl}/call/${callId}`, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to get call: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error getting VAPI call:', error);
      return null;
    }
  }

  async endCall(callId: string): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/call/${callId}`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: 'ended' }),
      });

      return response.ok;
    } catch (error) {
      console.error('Error ending VAPI call:', error);
      return false;
    }
  }
}

export const vapiService = new VAPIService();

// Helper function to handle VAPI errors
export const handleVAPIError = (error: any) => {
  console.error('VAPI Error:', error);
  
  if (error.response) {
    // API responded with error status
    const status = error.response.status;
    const message = error.response.data?.message || 'Unknown VAPI error';
    
    switch (status) {
      case 401:
        return 'VAPI authentication failed. Please check your API key.';
      case 402:
        return 'Insufficient VAPI credits. Please check your account balance.';
      case 429:
        return 'VAPI rate limit exceeded. Please try again later.';
      default:
        return `VAPI error: ${message}`;
    }
  }
  
  return 'Failed to initiate interview call. Please try again later.';
};
