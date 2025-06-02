export interface VAPIControlMessage {
  type: 'say' | 'add-message' | 'control' | 'end-call' | 'transfer';
  content?: string;
  endCallAfterSpoken?: boolean;
  message?: {
    role: 'system' | 'user' | 'assistant';
    content: string;
  };
  triggerResponseEnabled?: boolean;
  control?: 'mute-assistant' | 'unmute-assistant' | 'say-first-message';
  destination?: {
    type: 'number';
    number: string;
  };
}

export class VAPICallController {
  private controlUrl: string;

  constructor(controlUrl: string) {
    this.controlUrl = controlUrl;
  }

  private async sendControlMessage(message: VAPIControlMessage): Promise<boolean> {
    try {
      const response = await fetch(this.controlUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(message),
      });

      return response.ok;
    } catch (error) {
      console.error('VAPI control message failed:', error);
      return false;
    }
  }

  // Say a message during the call
  async sayMessage(content: string, endCallAfter = false): Promise<boolean> {
    return this.sendControlMessage({
      type: 'say',
      content,
      endCallAfterSpoken: endCallAfter,
    });
  }

  // Add a system message to the conversation
  async addSystemMessage(content: string, triggerResponse = true): Promise<boolean> {
    return this.sendControlMessage({
      type: 'add-message',
      message: {
        role: 'system',
        content,
      },
      triggerResponseEnabled: triggerResponse,
    });
  }

  // Inject resume content into the conversation
  async injectResumeContent(resumeData: any): Promise<boolean> {
    let resumeContent = '';
    
    if (resumeData?.type === 'file' && resumeData?.content) {
      resumeContent = resumeData.content;
    } else if (resumeData?.type === 'text' && resumeData?.content) {
      resumeContent = resumeData.content;
    } else if (typeof resumeData === 'string') {
      resumeContent = resumeData;
    }

    if (!resumeContent || resumeContent.trim() === '') {
      return false;
    }

    const systemMessage = `
CANDIDATE RESUME INFORMATION:
${resumeContent}

Please use this resume information to ask relevant follow-up questions about the candidate's experience, skills, and background. Focus on areas that align with the job requirements.
`.trim();

    return this.addSystemMessage(systemMessage, false);
  }

  // Inject cover letter content into the conversation
  async injectCoverLetterContent(coverLetterData: any): Promise<boolean> {
    let coverLetterContent = '';
    
    if (coverLetterData?.type === 'file' && coverLetterData?.content) {
      coverLetterContent = coverLetterData.content;
    } else if (coverLetterData?.type === 'text' && coverLetterData?.content) {
      coverLetterContent = coverLetterData.content;
    } else if (typeof coverLetterData === 'string') {
      coverLetterContent = coverLetterData;
    }

    if (!coverLetterContent || coverLetterContent.trim() === '') {
      return false;
    }

    const systemMessage = `
CANDIDATE COVER LETTER:
${coverLetterContent}

The candidate has expressed interest in this position through their cover letter. Use this information to understand their motivation and ask relevant questions about their interest in the role.
`.trim();

    return this.addSystemMessage(systemMessage, false);
  }

  // Inject both resume and cover letter at once
  async injectCandidateDocuments(resumeData: any, coverLetterData: any): Promise<boolean> {
    const resumeSuccess = await this.injectResumeContent(resumeData);
    const coverLetterSuccess = await this.injectCoverLetterContent(coverLetterData);
    
    // If we successfully injected any content, send a message to the assistant
    if (resumeSuccess || coverLetterSuccess) {
      return this.addSystemMessage(
        'I have now received the candidate\'s application documents. Please proceed with the interview questions based on their background and expressed interest.',
        true
      );
    }
    
    return false;
  }

  // Control assistant behavior
  async muteAssistant(): Promise<boolean> {
    return this.sendControlMessage({
      type: 'control',
      control: 'mute-assistant',
    });
  }

  async unmuteAssistant(): Promise<boolean> {
    return this.sendControlMessage({
      type: 'control',
      control: 'unmute-assistant',
    });
  }

  // End the call
  async endCall(): Promise<boolean> {
    return this.sendControlMessage({
      type: 'end-call',
    });
  }

  // Transfer call to a human interviewer
  async transferToHuman(phoneNumber: string, message?: string): Promise<boolean> {
    return this.sendControlMessage({
      type: 'transfer',
      destination: {
        type: 'number',
        number: phoneNumber,
      },
      content: message || 'Transferring you to a human interviewer now.',
    });
  }
} 