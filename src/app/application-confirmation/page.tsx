'use client';

import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, Phone, Calendar, Mail, Clock } from 'lucide-react';

export default function ApplicationConfirmationPage() {
  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <Card className="text-center">
        <CardHeader>
          <div className="mx-auto mb-4">
            <CheckCircle className="w-16 h-16 text-green-500" />
          </div>
          <CardTitle className="text-2xl text-green-700">Application Submitted Successfully!</CardTitle>
          <CardDescription className="text-lg">
            Thank you for applying to MountainPass. We've received your application and our AI interview process has been initiated.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-blue-900 mb-3">What's Happening Now?</h3>
            <div className="space-y-3 text-left">
              <div className="flex items-start space-x-3">
                <Phone className="w-5 h-5 text-blue-600 mt-0.5" />
                <div>
                  <p className="font-medium text-blue-900">AI Interview Call Initiated</p>
                  <p className="text-blue-700 text-sm">You should receive a call from +1 (415) 795-7413 within the next few minutes to begin your AI interview.</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <Clock className="w-5 h-5 text-blue-600 mt-0.5" />
                <div>
                  <p className="font-medium text-blue-900">Interview Process</p>
                  <p className="text-blue-700 text-sm">The AI will conduct a screening interview tailored to the position you applied for. Be ready to answer questions about your experience and motivation.</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <Mail className="w-5 h-5 text-blue-600 mt-0.5" />
                <div>
                  <p className="font-medium text-blue-900">Follow-up Communication</p>
                  <p className="text-blue-700 text-sm">After the AI interview, you'll receive an email with next steps and feedback from our team.</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <p className="text-green-800 text-sm">
              <strong>Pro Tip:</strong> Answer your phone when +1 (415) 795-7413 calls! If you miss the call, 
              our AI system will attempt to reach you again in a few minutes. Make sure you're in a quiet environment 
              where you can speak clearly.
            </p>
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <p className="text-yellow-800 text-sm">
              <strong>Technical Requirements:</strong> Ensure you have good cell reception or are connected to WiFi calling. 
              The interview typically takes 10-20 minutes. Have a pen and paper ready to take notes if needed.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/jobs">
              <Button variant="outline">Browse More Jobs</Button>
            </Link>
            <Link href="/">
              <Button>Return to Home</Button>
            </Link>
          </div>

          <div className="pt-6 border-t">
            <p className="text-sm text-gray-600">
              Having issues with the call or need to reschedule? Contact us at{' '}
              <a href="mailto:careers@mountainpass.com" className="text-blue-600 hover:underline">
                careers@mountainpass.com
              </a>
              {' '}or call{' '}
              <a href="tel:+14157957413" className="text-blue-600 hover:underline">
                +1 (415) 795-7413
              </a>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 