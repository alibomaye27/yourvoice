'use client';

import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, Phone, Mail, Clock } from 'lucide-react';

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
            Thank you for applying to MountainPass. We&apos;ve received your application and our AI interview process has been initiated.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="bg-blue-50 p-6 rounded-lg">
            <h3 className="text-lg font-semibold text-blue-900 mb-2">What happens next?</h3>
            <p className="text-blue-800">
              You&apos;ll receive a call within the next few minutes for your AI-powered interview screening.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-4">
            <div className="flex flex-col items-center text-center p-4">
              <Phone className="w-8 h-8 text-blue-600 mb-2" />
              <h4 className="font-medium">AI Phone Interview</h4>
              <p className="text-sm text-gray-600">Automated screening call</p>
            </div>
            <div className="flex flex-col items-center text-center p-4">
              <Clock className="w-8 h-8 text-green-600 mb-2" />
              <h4 className="font-medium">Quick Process</h4>
              <p className="text-sm text-gray-600">Takes about 10-15 minutes</p>
            </div>
            <div className="flex flex-col items-center text-center p-4">
              <Mail className="w-8 h-8 text-purple-600 mb-2" />
              <h4 className="font-medium">Follow-up</h4>
              <p className="text-sm text-gray-600">We&apos;ll email you results</p>
            </div>
          </div>
          
          <div className="border-t pt-6">
            <p className="text-sm text-gray-600 mb-4">
              Didn&apos;t receive a call? Please check your phone and make sure it&apos;s available to receive calls.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button asChild variant="outline">
                <Link href="/jobs">
                  Browse More Jobs
                </Link>
              </Button>
              <Button asChild>
                <Link href="/">
                  Return Home
                </Link>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 