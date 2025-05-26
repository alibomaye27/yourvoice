'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/lib/supabase';
import { 
  BrainCircuit, 
  Users, 
  Briefcase, 
  Phone, 
  BarChart3, 
  Clock, 
  CheckCircle, 
  ArrowRight,
  Zap,
  Shield,
  Target
} from 'lucide-react';

interface DashboardStats {
  totalJobs: number;
  totalCandidates: number;
  activeApplications: number;
  completedInterviews: number;
}

export default function HomePage() {
  const [stats, setStats] = useState<DashboardStats>({
    totalJobs: 0,
    totalCandidates: 0,
    activeApplications: 0,
    completedInterviews: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      const [jobsResult, candidatesResult, applicationsResult, interviewsResult] = await Promise.all([
        supabase.from('jobs').select('id', { count: 'exact' }),
        supabase.from('candidates').select('id', { count: 'exact' }),
        supabase.from('applications').select('id', { count: 'exact' }).neq('status', 'rejected'),
        supabase.from('interviews').select('id', { count: 'exact' }).eq('status', 'completed')
      ]);

      setStats({
        totalJobs: jobsResult.count || 0,
        totalCandidates: candidatesResult.count || 0,
        activeApplications: applicationsResult.count || 0,
        completedInterviews: interviewsResult.count || 0
      });
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const features = [
    {
      icon: BrainCircuit,
      title: 'AI-Powered Interviews',
      description: 'Automated phone interviews using advanced AI agents that adapt to each role and candidate.',
      color: 'text-blue-600'
    },
    {
      icon: Phone,
      title: 'VAPI Integration',
      description: 'Seamless voice AI integration for natural, conversational interview experiences.',
      color: 'text-green-600'
    },
    {
      icon: BarChart3,
      title: 'Smart Scoring',
      description: 'Comprehensive candidate evaluation with detailed scoring across multiple criteria.',
      color: 'text-purple-600'
    },
    {
      icon: Target,
      title: 'Role-Specific Assessments',
      description: 'Customized interview processes tailored to specific job requirements and skills.',
      color: 'text-orange-600'
    },
    {
      icon: Clock,
      title: 'Efficient Screening',
      description: 'Reduce time-to-hire with automated initial screening and candidate ranking.',
      color: 'text-red-600'
    },
    {
      icon: Shield,
      title: 'Consistent Evaluation',
      description: 'Eliminate bias with standardized, objective assessment criteria for all candidates.',
      color: 'text-indigo-600'
    }
  ];

  const quickActions = [
    {
      title: 'Create New Job',
      description: 'Set up a new position with AI interview configuration',
      href: '/job-setup',
      icon: Briefcase,
      color: 'bg-blue-50 hover:bg-blue-100 border-blue-200'
    },
    {
      title: 'View Candidates',
      description: 'Review applications and interview progress',
      href: '/candidates',
      icon: Users,
      color: 'bg-green-50 hover:bg-green-100 border-green-200'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16">
          <div className="text-center">
            <Badge variant="secondary" className="mb-4 px-4 py-2">
              <Zap className="w-4 h-4 mr-2" />
              AI-Powered Recruitment Platform
            </Badge>
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
              AI Employment
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
                {' '}Coach
              </span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              Revolutionize your hiring process with AI-powered phone interviews. 
              Screen candidates efficiently, reduce bias, and find the perfect fit for every role.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/job-setup">
                <Button size="lg" className="px-8 py-3">
                  Get Started
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </Link>
              <Link href="/candidates">
                <Button variant="outline" size="lg" className="px-8 py-3">
                  View Candidates
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6 text-center">
              <Briefcase className="w-8 h-8 mx-auto mb-2 text-blue-600" />
              <div className="text-2xl font-bold text-gray-900">
                {loading ? '...' : stats.totalJobs}
              </div>
              <div className="text-sm text-gray-600">Active Jobs</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 text-center">
              <Users className="w-8 h-8 mx-auto mb-2 text-green-600" />
              <div className="text-2xl font-bold text-gray-900">
                {loading ? '...' : stats.totalCandidates}
              </div>
              <div className="text-sm text-gray-600">Candidates</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 text-center">
              <Clock className="w-8 h-8 mx-auto mb-2 text-orange-600" />
              <div className="text-2xl font-bold text-gray-900">
                {loading ? '...' : stats.activeApplications}
              </div>
              <div className="text-sm text-gray-600">Active Applications</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 text-center">
              <CheckCircle className="w-8 h-8 mx-auto mb-2 text-purple-600" />
              <div className="text-2xl font-bold text-gray-900">
                {loading ? '...' : stats.completedInterviews}
              </div>
              <div className="text-sm text-gray-600">Completed Interviews</div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Features Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Powerful Features for Modern Recruitment
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Leverage cutting-edge AI technology to streamline your hiring process 
            and make better recruitment decisions.
          </p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <Card key={index} className="border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader>
                <feature.icon className={`w-12 h-12 ${feature.color} mb-4`} />
                <CardTitle className="text-xl">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base">
                  {feature.description}
                </CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Quick Actions Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Quick Actions
          </h2>
          <p className="text-lg text-gray-600">
            Get started with the most common tasks
          </p>
        </div>
        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {quickActions.map((action, index) => (
            <Link key={index} href={action.href}>
              <Card className={`${action.color} border-2 transition-all hover:shadow-lg cursor-pointer h-full`}>
                <CardHeader className="pb-4">
                  <div className="flex items-center space-x-4">
                    <action.icon className="w-8 h-8 text-gray-700" />
                    <div>
                      <CardTitle className="text-xl text-gray-900">
                        {action.title}
                      </CardTitle>
                      <CardDescription className="text-gray-600 mt-1">
                        {action.description}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="flex items-center text-sm font-medium text-gray-700">
                    Get started
                    <ArrowRight className="ml-2 w-4 h-4" />
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-50 border-t">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center text-gray-600">
            <p>&copy; 2024 AI Employment Coach. Powered by advanced AI technology.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
