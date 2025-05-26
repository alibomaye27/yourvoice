'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { ArrowLeft, MapPin, DollarSign, Clock, Phone, Calendar } from 'lucide-react';
import Link from 'next/link';

interface Job {
  id: string;
  title: string;
  company: string;
  department: string;
  location: string;
  employment_type: string;
  experience_level: string;
  description: string;
  requirements: string[];
  responsibilities: string[];
  skills_required: string[];
  certifications_required: string[];
  benefits: string[];
  salary_range_min: number;
  salary_range_max: number;
  vapi_squad_id: string;
  phone_number: string;
  application_deadline: string;
  interview_process: {
    steps: Array<{
      name: string;
      agent_name: string;
      duration_minutes: number;
      description: string;
    }>;
  };
}

export default function ApplyPage() {
  const params = useParams();
  const router = useRouter();
  const jobId = params.jobId as string;
  
  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    resumeUrl: '',
    coverLetter: '',
    experienceYears: '',
    skills: '',
    linkedinUrl: ''
  });

  const fetchJob = async () => {
    try {
      const { data, error } = await supabase
        .from('jobs')
        .select('*')
        .eq('id', jobId)
        .eq('is_active', true)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          toast.error('Job not found or no longer accepting applications');
          router.push('/jobs');
          return;
        }
        throw error;
      }
      
      setJob(data);
    } catch (error) {
      console.error('Error fetching job:', error);
      toast.error('Failed to load job details');
      router.push('/jobs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJob();
  }, [jobId]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const validateForm = () => {
    const errors = [];
    
    if (!formData.firstName.trim()) errors.push('First name is required');
    if (!formData.lastName.trim()) errors.push('Last name is required');
    if (!formData.email.trim()) errors.push('Email is required');
    if (!formData.phone.trim()) errors.push('Phone number is required');
    if (!formData.coverLetter.trim()) errors.push('Cover letter is required');
    if (!formData.experienceYears) errors.push('Years of experience is required');
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (formData.email && !emailRegex.test(formData.email)) {
      errors.push('Please enter a valid email address');
    }
    
    if (errors.length > 0) {
      errors.forEach(error => toast.error(error));
      return false;
    }
    
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setSubmitting(true);
    
    try {
      // First, create or find the candidate
      const skillsArray = formData.skills 
        ? formData.skills.split(',').map(skill => skill.trim()).filter(Boolean)
        : [];
      
      const { data: candidateData, error: candidateError } = await supabase
        .from('candidates')
        .upsert({
          first_name: formData.firstName,
          last_name: formData.lastName,
          email: formData.email,
          phone: formData.phone,
          resume_url: formData.resumeUrl || null,
          linkedin_url: formData.linkedinUrl || null,
          skills: skillsArray,
          experience_years: parseInt(formData.experienceYears),
          cover_letter: formData.coverLetter
        }, {
          onConflict: 'email'
        })
        .select()
        .single();

      if (candidateError) throw candidateError;

      // Then create the application
      const { data: applicationData, error: applicationError } = await supabase
        .from('applications')
        .insert({
          job_id: jobId,
          candidate_id: candidateData.id,
          status: 'applied',
          applied_at: new Date().toISOString(),
          cover_letter_specific: formData.coverLetter,
          source: 'website'
        })
        .select()
        .single();

      if (applicationError) {
        if (applicationError.code === '23505') {
          toast.error('You have already applied for this position');
          return;
        }
        throw applicationError;
      }

      // Initiate VAPI call automatically for all applications
      if (job) {
        try {
          const callResponse = await fetch('/api/initiate-call', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              applicationId: applicationData.id,
              candidatePhone: formData.phone,
              candidateName: `${formData.firstName} ${formData.lastName}`,
              jobTitle: job.title,
            }),
          });

          if (callResponse.ok) {
            const callResult = await callResponse.json();
            console.log('VAPI call initiated:', callResult);
            toast.success('Application submitted successfully! You will receive a call shortly for your AI interview.');
          } else {
            const errorData = await callResponse.json();
            console.error('Failed to initiate call:', errorData);
            toast.success('Application submitted successfully! We\'ll contact you soon to schedule your interview.');
          }
        } catch (callError) {
          console.error('Error initiating VAPI call:', callError);
          toast.success('Application submitted successfully! We\'ll contact you soon to schedule your interview.');
        }
      }

      router.push('/application-confirmation');
    } catch (error) {
      console.error('Error submitting application:', error);
      toast.error('Failed to submit application. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const formatSalary = (min: number, max: number) => {
    if (!min && !max) return 'Salary not specified';
    if (min && max) return `$${min.toLocaleString()} - $${max.toLocaleString()}`;
    if (min) return `From $${min.toLocaleString()}`;
    return `Up to $${max.toLocaleString()}`;
  };

  const getEmploymentTypeColor = (type: string) => {
    const colors = {
      'full-time': 'bg-green-100 text-green-800',
      'part-time': 'bg-blue-100 text-blue-800',
      'contract': 'bg-orange-100 text-orange-800',
      'internship': 'bg-purple-100 text-purple-800'
    };
    return colors[type as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-8">
        <Card className="text-center py-12">
          <CardContent>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Job not found</h3>
            <p className="text-gray-600 mb-4">This job posting is no longer available.</p>
            <Link href="/jobs">
              <Button>Browse Other Jobs</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <Link href="/jobs">
          <Button variant="ghost" className="mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Jobs
          </Button>
        </Link>
        
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{job.title}</h1>
              <p className="text-lg text-gray-700">{job.company}</p>
              <div className="flex items-center text-gray-600 mt-2">
                <MapPin className="w-4 h-4 mr-2" />
                <span>{job.location}</span>
              </div>
            </div>
            <div className="flex flex-col items-end space-y-2">
              <Badge className={getEmploymentTypeColor(job.employment_type)}>
                {job.employment_type}
              </Badge>
              <Badge variant="outline">{job.experience_level}</Badge>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div className="flex items-center text-gray-600">
              <DollarSign className="w-4 h-4 mr-2" />
              <span>{formatSalary(job.salary_range_min, job.salary_range_max)}</span>
            </div>
            
            {job.vapi_squad_id && (
              <div className="flex items-center text-blue-600">
                <Phone className="w-4 h-4 mr-2" />
                <span>AI Interview Process</span>
              </div>
            )}
            
            {job.application_deadline && (
              <div className="flex items-center text-gray-600">
                <Calendar className="w-4 h-4 mr-2" />
                <span>Deadline: {new Date(job.application_deadline).toLocaleDateString()}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Job Details */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Job Description</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 whitespace-pre-line">{job.description}</p>
            </CardContent>
          </Card>

          {job.requirements.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Requirements</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="list-disc list-inside space-y-2">
                  {job.requirements.map((req, index) => (
                    <li key={index} className="text-gray-700">{req}</li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          {job.responsibilities.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Responsibilities</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="list-disc list-inside space-y-2">
                  {job.responsibilities.map((resp, index) => (
                    <li key={index} className="text-gray-700">{resp}</li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          {job.interview_process.steps.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Interview Process</CardTitle>
                <CardDescription>Our AI-powered interview process</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {job.interview_process.steps.map((step, index) => (
                    <div key={index} className="border rounded-lg p-3">
                      <div className="flex items-center justify-between mb-2">
                        <h5 className="font-medium">Step {index + 1}: {step.name}</h5>
                        <Badge variant="outline">
                          <Clock className="w-3 h-3 mr-1" />
                          {step.duration_minutes} min
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600 mb-1">Agent: {step.agent_name}</p>
                      <p className="text-sm text-gray-700">{step.description}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Application Form */}
        <div className="lg:col-span-1">
          <Card className="sticky top-8">
            <CardHeader>
              <CardTitle>Apply for This Position</CardTitle>
              <CardDescription>
                Fill out the form below to submit your application
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="firstName">First Name *</Label>
                    <Input
                      id="firstName"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="lastName">Last Name *</Label>
                    <Input
                      id="lastName"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="phone">Phone Number *</Label>
                  <Input
                    id="phone"
                    name="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="experienceYears">Years of Experience *</Label>
                  <Input
                    id="experienceYears"
                    name="experienceYears"
                    type="number"
                    min="0"
                    value={formData.experienceYears}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="resumeUrl">Resume URL</Label>
                  <Input
                    id="resumeUrl"
                    name="resumeUrl"
                    type="url"
                    placeholder="https://..."
                    value={formData.resumeUrl}
                    onChange={handleInputChange}
                  />
                </div>

                <div>
                  <Label htmlFor="linkedinUrl">LinkedIn Profile</Label>
                  <Input
                    id="linkedinUrl"
                    name="linkedinUrl"
                    type="url"
                    placeholder="https://linkedin.com/in/..."
                    value={formData.linkedinUrl}
                    onChange={handleInputChange}
                  />
                </div>

                <div>
                  <Label htmlFor="skills">Skills (comma-separated)</Label>
                  <Textarea
                    id="skills"
                    name="skills"
                    placeholder="e.g., JavaScript, React, Node.js, Project Management"
                    value={formData.skills}
                    onChange={handleInputChange}
                    rows={3}
                  />
                </div>

                <div>
                  <Label htmlFor="coverLetter">Cover Letter *</Label>
                  <Textarea
                    id="coverLetter"
                    name="coverLetter"
                    placeholder="Tell us why you're interested in this position and what makes you a great fit..."
                    value={formData.coverLetter}
                    onChange={handleInputChange}
                    rows={5}
                    required
                  />
                </div>

                <Button 
                  type="submit" 
                  className="w-full"
                  disabled={submitting}
                >
                  {submitting ? 'Submitting...' : 'Submit Application'}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
} 