'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { 
  Briefcase, 
  MapPin, 
  Clock, 
  DollarSign, 
  Phone,
  Calendar,
  Search,
  Send
} from 'lucide-react';

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
  is_active: boolean;
  application_deadline: string;
  interview_process: {
    steps: Array<{
      name: string;
      agent_name: string;
      duration_minutes: number;
      description: string;
    }>;
  };
  created_at: string;
  updated_at: string;
}

export default function JobsPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [filteredJobs, setFilteredJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchJobs();
  }, []);

  useEffect(() => {
    filterJobs();
  }, [jobs, searchTerm]);

  const fetchJobs = async () => {
    try {
      const { data, error } = await supabase
        .from('jobs')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setJobs(data || []);
    } catch (error) {
      console.error('Error fetching jobs:', error);
      toast.error('Failed to load jobs');
    } finally {
      setLoading(false);
    }
  };

  const filterJobs = () => {
    let filtered = jobs;

    if (searchTerm) {
      filtered = filtered.filter(job =>
        job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        job.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
        job.department.toLowerCase().includes(searchTerm.toLowerCase()) ||
        job.location.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredJobs(filtered);
  };

  const toggleJobStatus = async (jobId: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('jobs')
        .update({ is_active: !currentStatus })
        .eq('id', jobId);

      if (error) throw error;
      
      await fetchJobs();
      toast.success(`Job ${!currentStatus ? 'activated' : 'deactivated'} successfully`);
    } catch (error) {
      console.error('Error updating job status:', error);
      toast.error('Failed to update job status');
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

  const getExperienceLevelColor = (level: string) => {
    const colors = {
      'entry': 'bg-green-100 text-green-800',
      'mid': 'bg-blue-100 text-blue-800',
      'senior': 'bg-purple-100 text-purple-800',
      'executive': 'bg-red-100 text-red-800'
    };
    return colors[level as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Join Our Team at MountainPass</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Discover exciting career opportunities in the heart of the mountains. 
            Experience our innovative AI-powered interview process that makes applying simple and efficient.
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="mb-6 flex justify-center">
        <div className="relative w-full max-w-lg">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder="Search jobs by title, location, or department..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Jobs Grid */}
      {filteredJobs.length === 0 ? (
        <Card className="text-center py-12">
          <CardContent>
            <Briefcase className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No jobs found</h3>
            <p className="text-gray-600 mb-4">
              {jobs.length === 0 
                ? "No job openings are currently available. Please check back soon!"
                : "No jobs match your search criteria. Try adjusting your search terms."
              }
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredJobs.map((job) => (
            <Card key={job.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg font-semibold">{job.title}</CardTitle>
                    <CardDescription className="text-sm font-medium text-gray-700">
                      {job.company} • {job.department}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center text-sm text-gray-600">
                  <MapPin className="w-4 h-4 mr-2" />
                  <span>{job.location}</span>
                </div>
                
                <div className="flex items-center text-sm text-gray-600">
                  <DollarSign className="w-4 h-4 mr-2" />
                  <span>{formatSalary(job.salary_range_min, job.salary_range_max)}</span>
                </div>

                <div className="flex flex-wrap gap-2">
                  <Badge className={getEmploymentTypeColor(job.employment_type)}>
                    {job.employment_type}
                  </Badge>
                  <Badge className={getExperienceLevelColor(job.experience_level)}>
                    {job.experience_level}
                  </Badge>
                </div>

                {job.vapi_squad_id && (
                  <div className="flex items-center text-sm text-blue-600">
                    <Phone className="w-4 h-4 mr-2" />
                    <span>AI Interview Enabled</span>
                  </div>
                )}

                {job.application_deadline && (
                  <div className="flex items-center text-sm text-gray-600">
                    <Calendar className="w-4 h-4 mr-2" />
                    <span>Deadline: {new Date(job.application_deadline).toLocaleDateString()}</span>
                  </div>
                )}

                <div className="flex space-x-2 pt-4">
                  <Link href={`/apply/${job.id}`} className="w-full">
                    <Button size="sm" className="w-full">
                      <Send className="w-4 h-4 mr-2" />
                      Apply Now
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}