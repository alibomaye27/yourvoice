'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Progress } from '@/components/ui/progress'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog'
import { supabase } from '@/lib/supabase'
import { JobInsert } from '@/types/database'
import { Plus, X, Save, Phone, Users, Calendar } from 'lucide-react'
import { toast } from 'sonner'

interface VAPIAgent {
  id: string;
  name: string;
  voice?: {
    voiceId: string;
    provider: string;
  };
  model?: {
    model: string;
    provider: string;
  };
  firstMessage?: string;
  createdAt: string;
  updatedAt: string;
}

interface InterviewStep {
  name: string;
  agent_name: string;
  assistant_id: string;
  duration_minutes: number;
  description: string;
}

export default function JobSetupPage() {
  const router = useRouter()
  const [currentTab, setCurrentTab] = useState('basic')
  const [isLoading, setIsLoading] = useState(false)
  const [agents, setAgents] = useState<VAPIAgent[]>([])
  const [isLoadingAgents, setIsLoadingAgents] = useState(false)
  
  const [formData, setFormData] = useState<Partial<JobInsert>>({
    title: '',
    company: '',
    department: '',
    location: '',
    employment_type: 'full-time',
    experience_level: 'mid',
    description: '',
    requirements: [],
    responsibilities: [],
    skills_required: [],
    certifications_required: [],
    benefits: [],
    is_active: true,
    interview_process: {
      steps: [] as InterviewStep[]
    },
    ai_interview_enabled: true,
  })

  const [newItem, setNewItem] = useState('')
  const [newStep, setNewStep] = useState<InterviewStep>({
    name: '',
    agent_name: '',
    assistant_id: '',
    duration_minutes: 15,
    description: ''
  })

  useEffect(() => {
    const fetchAgents = async () => {
      setIsLoadingAgents(true);
      try {
        const response = await fetch('/api/agents');
        if (response.ok) {
          const data = await response.json();
          console.log('Agents data received:', data);
          console.log('Agents array:', data.agents);
          setAgents(data.agents);
          console.log('Agents state after setting:', agents);
        }
      } catch (error) {
        console.error('Error fetching agents:', error);
        toast.error('Failed to load agents');
      } finally {
        setIsLoadingAgents(false);
      }
    };

    fetchAgents();
  }, []);

  const progress = () => {
    let completed = 0
    const total = 7
    
    if (formData.title) completed++
    if (formData.company) completed++
    if (formData.description) completed++
    if (formData.requirements && formData.requirements.length > 0) completed++
    if (formData.responsibilities && formData.responsibilities.length > 0) completed++
    if (formData.skills_required && formData.skills_required.length > 0) completed++
    if (formData.vapi_squad_id && formData.phone_number) completed++
    
    return (completed / total) * 100
  }

  const addArrayItem = (field: keyof typeof formData, value: string) => {
    if (!value.trim()) return
    
    const currentArray = (formData[field] as string[]) || []
    setFormData(prev => ({
      ...prev,
      [field]: [...currentArray, value.trim()]
    }))
    setNewItem('')
  }

  const removeArrayItem = (field: keyof typeof formData, index: number) => {
    const currentArray = (formData[field] as string[]) || []
    setFormData(prev => ({
      ...prev,
      [field]: currentArray.filter((_, i) => i !== index)
    }))
  }

  const addInterviewStep = () => {
    if (!newStep.name || !newStep.agent_name) return
    
    setFormData(prev => ({
      ...prev,
      interview_process: {
        steps: [
          ...(prev.interview_process?.steps || []),
          { ...newStep }
        ]
      }
    }))
    
    setNewStep({
      name: '',
      agent_name: '',
      assistant_id: '',
      duration_minutes: 15,
      description: ''
    })
  }

  const removeInterviewStep = (index: number) => {
    setFormData(prev => ({
      ...prev,
      interview_process: {
        steps: prev.interview_process?.steps.filter((_, i) => i !== index) || []
      }
    }))
  }

  const handleSubmit = async () => {
    setIsLoading(true)

    try {
      // Validate required fields
      if (!formData.title || !formData.company || !formData.description) {
        toast.error('Please fill in all required fields')
        return
      }

      // Build VAPI squad payload from interview steps
      const steps = (formData.interview_process?.steps || []) as InterviewStep[];
      if (steps.length === 0) {
        toast.error('Please add at least one interview step')
        setIsLoading(false)
        return;
      }
      const members = steps.map((step, idx) => {
        const isLast = idx === steps.length - 1;
        const member: any = {
          assistantId: step.assistant_id,
        };
        if (!isLast) {
          // @ts-ignore: dynamic property assignment
          member.assistantDestinations = [
            {
              message: " ",
              description: idx === 0
                ? "Transfer when you asked your questions to move you forward in the process"
                : "Transfer after you asked your questions.",
              type: "assistant",
              assistantName: steps[idx + 1].agent_name,
              transferMode: "swap-system-message-in-history"
            }
          ];
        }
        if (idx > 0) {
          // @ts-ignore: dynamic property assignment
          member.assistantOverrides = {
            firstMessageMode: "assistant-speaks-first-with-model-generated-message"
          };
        }
        return member;
      });
      const squadPayload = {
        name: formData.title || 'Job Squad',
        members
      };

      // Create squad in VAPI
      let squadId = null;
      try {
        const squadRes = await fetch('https://api.vapi.ai/squad', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${process.env.VAPI_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(squadPayload),
        });
        if (!squadRes.ok) {
          const errorText = await squadRes.text();
          throw new Error(`VAPI squad creation failed: ${squadRes.status} - ${errorText}`);
        }
        const squadData = await squadRes.json();
        squadId = squadData.id;
      } catch (err) {
        toast.error('Failed to create VAPI squad. Job not created.');
        setIsLoading(false);
        return;
      }

      // Ensure interview_process has the correct structure
      const jobData = {
        ...formData,
        requirements: formData.requirements || [],
        responsibilities: formData.responsibilities || [],
        benefits: formData.benefits || [],
        skills_required: formData.skills_required || [],
        certifications_required: formData.certifications_required || [],
        is_active: true,
        ai_interview_enabled: formData.ai_interview_enabled,
        interview_process: {
          steps: formData.interview_process?.steps || []
        },
        vapi_squad_id: squadId,
      }

      // Log the data being sent to Supabase
      console.log('Submitting job data:', JSON.stringify(jobData, null, 2))

      // First, try to insert without select to see if that works
      const { error: insertError } = await supabase
        .from('jobs')
        .insert([jobData as JobInsert])

      if (insertError) {
        console.error('Insert error:', insertError)
        toast.error(`Failed to create job: ${insertError.message}`)
        return
      }

      // If insert succeeded, fetch the created job
      const { data, error: selectError } = await supabase
        .from('jobs')
        .select('*')
        .eq('title', jobData.title)
        .eq('company', jobData.company)
        .order('created_at', { ascending: false })
        .limit(1)
        .single()

      if (selectError) {
        console.error('Select error:', selectError)
        toast.error(`Job created but failed to fetch details: ${selectError.message}`)
        return
      }

      console.log('Job created successfully:', data)
      toast.success('Job created successfully!')
      router.push('/candidates')
    } catch (error) {
      console.error('Unexpected error creating job:', error)
      if (error instanceof Error) {
        console.error('Error details:', {
          name: error.name,
          message: error.message,
          stack: error.stack
        })
      }
      toast.error('An unexpected error occurred while creating the job')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Job Setup</h1>
        <p className="text-muted-foreground mt-2">
          Configure your job posting and AI interview process
        </p>
        <div className="mt-4">
          <Progress value={progress()} className="w-full" />
          <p className="text-sm text-muted-foreground mt-2">
            {Math.round(progress())}% complete
          </p>
        </div>
      </div>

      <Tabs value={currentTab} onValueChange={setCurrentTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="basic">Basic Info</TabsTrigger>
          <TabsTrigger value="details">Job Details</TabsTrigger>
          <TabsTrigger value="requirements">Requirements</TabsTrigger>
          <TabsTrigger value="interview">Interview Setup</TabsTrigger>
        </TabsList>

        <TabsContent value="basic" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Basic Information
              </CardTitle>
              <CardDescription>
                Essential job details and company information
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="title">Job Title *</Label>
                  <Input
                    id="title"
                    value={formData.title || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="e.g. Senior Ski Instructor"
                  />
                </div>
                <div>
                  <Label htmlFor="company">Company *</Label>
                  <Input
                    id="company"
                    value={formData.company || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, company: e.target.value }))}
                    placeholder="e.g. MountainPass"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="department">Department</Label>
                  <Input
                    id="department"
                    value={formData.department || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, department: e.target.value }))}
                    placeholder="e.g. Ski School"
                  />
                </div>
                <div>
                  <Label htmlFor="location">Location</Label>
                  <Input
                    id="location"
                    value={formData.location || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                    placeholder="e.g. Whistler, BC"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="employment_type">Employment Type</Label>
                  <Select
                    value={formData.employment_type}
                    onValueChange={(value: any) => setFormData(prev => ({ ...prev, employment_type: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="full-time">Full-time</SelectItem>
                      <SelectItem value="part-time">Part-time</SelectItem>
                      <SelectItem value="contract">Contract</SelectItem>
                      <SelectItem value="internship">Internship</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="experience_level">Experience Level</Label>
                  <Select
                    value={formData.experience_level}
                    onValueChange={(value: any) => setFormData(prev => ({ ...prev, experience_level: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="entry">Entry Level</SelectItem>
                      <SelectItem value="mid">Mid Level</SelectItem>
                      <SelectItem value="senior">Senior Level</SelectItem>
                      <SelectItem value="executive">Executive</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="salary_min">Salary Range (Min)</Label>
                  <Input
                    id="salary_min"
                    type="number"
                    value={formData.salary_range_min || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, salary_range_min: parseInt(e.target.value) || undefined }))}
                    placeholder="50000"
                  />
                </div>
                <div>
                  <Label htmlFor="salary_max">Salary Range (Max)</Label>
                  <Input
                    id="salary_max"
                    type="number"
                    value={formData.salary_range_max || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, salary_range_max: parseInt(e.target.value) || undefined }))}
                    placeholder="80000"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="application_deadline">Application Deadline</Label>
                <Input
                  id="application_deadline"
                  type="date"
                  value={formData.application_deadline || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, application_deadline: e.target.value }))}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="details" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Job Description</CardTitle>
              <CardDescription>
                Detailed description of the role and what the candidate will be doing
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Label htmlFor="description">Description *</Label>
              <Textarea
                id="description"
                value={formData.description || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Describe the role, company culture, and what makes this position exciting..."
                className="min-h-32"
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Responsibilities</CardTitle>
              <CardDescription>
                Key responsibilities and duties for this position
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Input
                  value={newItem}
                  onChange={(e) => setNewItem(e.target.value)}
                  placeholder="Add a responsibility..."
                  onKeyPress={(e) => e.key === 'Enter' && addArrayItem('responsibilities', newItem)}
                />
                <Button 
                  onClick={() => addArrayItem('responsibilities', newItem)}
                  size="sm"
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {formData.responsibilities?.map((item, index) => (
                  <Badge key={index} variant="secondary" className="flex items-center gap-1">
                    {item}
                    <X 
                      className="h-3 w-3 cursor-pointer" 
                      onClick={() => removeArrayItem('responsibilities', index)}
                    />
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Benefits</CardTitle>
              <CardDescription>
                Employee benefits and perks
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Input
                  value={newItem}
                  onChange={(e) => setNewItem(e.target.value)}
                  placeholder="Add a benefit..."
                  onKeyPress={(e) => e.key === 'Enter' && addArrayItem('benefits', newItem)}
                />
                <Button 
                  onClick={() => addArrayItem('benefits', newItem)}
                  size="sm"
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {formData.benefits?.map((item, index) => (
                  <Badge key={index} variant="secondary" className="flex items-center gap-1">
                    {item}
                    <X 
                      className="h-3 w-3 cursor-pointer" 
                      onClick={() => removeArrayItem('benefits', index)}
                    />
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="requirements" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Job Requirements</CardTitle>
              <CardDescription>
                Essential qualifications and requirements for candidates
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Input
                  value={newItem}
                  onChange={(e) => setNewItem(e.target.value)}
                  placeholder="Add a requirement..."
                  onKeyPress={(e) => e.key === 'Enter' && addArrayItem('requirements', newItem)}
                />
                <Button 
                  onClick={() => addArrayItem('requirements', newItem)}
                  size="sm"
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {formData.requirements?.map((item, index) => (
                  <Badge key={index} variant="secondary" className="flex items-center gap-1">
                    {item}
                    <X 
                      className="h-3 w-3 cursor-pointer" 
                      onClick={() => removeArrayItem('requirements', index)}
                    />
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Required Skills</CardTitle>
              <CardDescription>
                Technical and soft skills required for this position
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Input
                  value={newItem}
                  onChange={(e) => setNewItem(e.target.value)}
                  placeholder="Add a skill..."
                  onKeyPress={(e) => e.key === 'Enter' && addArrayItem('skills_required', newItem)}
                />
                <Button 
                  onClick={() => addArrayItem('skills_required', newItem)}
                  size="sm"
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {formData.skills_required?.map((item, index) => (
                  <Badge key={index} variant="secondary" className="flex items-center gap-1">
                    {item}
                    <X 
                      className="h-3 w-3 cursor-pointer" 
                      onClick={() => removeArrayItem('skills_required', index)}
                    />
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Required Certifications</CardTitle>
              <CardDescription>
                Professional certifications like PSIA/CSIA for ski instructors
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Input
                  value={newItem}
                  onChange={(e) => setNewItem(e.target.value)}
                  placeholder="e.g. PSIA Level 2, CSIA Level 1..."
                  onKeyPress={(e) => e.key === 'Enter' && addArrayItem('certifications_required', newItem)}
                />
                <Button 
                  onClick={() => addArrayItem('certifications_required', newItem)}
                  size="sm"
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {formData.certifications_required?.map((item, index) => (
                  <Badge key={index} variant="secondary" className="flex items-center gap-1">
                    {item}
                    <X 
                      className="h-3 w-3 cursor-pointer" 
                      onClick={() => removeArrayItem('certifications_required', index)}
                    />
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="interview" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Phone className="h-5 w-5" />
                AI Interview Configuration
              </CardTitle>
              <CardDescription>
                AI interviews are automatically enabled for all jobs using your configured VAPI system
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center gap-2 text-green-800">
                  <Phone className="h-4 w-4" />
                  <span className="font-medium">AI Interviews Enabled</span>
                </div>
                <p className="text-green-700 text-sm mt-1">
                  Candidates will automatically receive AI phone interviews after applying.
                </p>
              </div>
              <div className="mb-4">
                <Label>AI Interview Enabled</Label>
                <div className="flex gap-4 mt-2">
                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="ai_interview_enabled"
                      value="true"
                      checked={formData.ai_interview_enabled === true}
                      onChange={() => setFormData(prev => ({ ...prev, ai_interview_enabled: true }))}
                    />
                    Yes
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="ai_interview_enabled"
                      value="false"
                      checked={formData.ai_interview_enabled === false}
                      onChange={() => setFormData(prev => ({ ...prev, ai_interview_enabled: false }))}
                    />
                    No
                  </label>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Interview Process
              </CardTitle>
              <CardDescription>
                Configure the multi-step AI interview process
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h4 className="font-medium">Add New Interview Step</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="step_name">Step Name</Label>
                    <Input
                      id="step_name"
                      value={newStep.name}
                      onChange={(e) => setNewStep(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="e.g. Technical Assessment"
                    />
                  </div>
                  <div>
                    <Label htmlFor="assistant">VAPI Assistant</Label>
                    <Select
                      value={newStep.assistant_id}
                      onValueChange={(value) => {
                        const selectedAgent = agents.find(agent => agent.id === value);
                        setNewStep(prev => ({
                          ...prev,
                          assistant_id: value,
                          agent_name: selectedAgent ? selectedAgent.name : '',
                        }));
                      }}
                      disabled={isLoadingAgents}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select an assistant" />
                      </SelectTrigger>
                      <SelectContent>
                        {agents.map((agent) => (
                          <SelectItem key={agent.id} value={agent.id}>
                            {agent.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="duration">Duration (minutes)</Label>
                    <Input
                      id="duration"
                      type="number"
                      value={newStep.duration_minutes}
                      onChange={(e) => setNewStep(prev => ({ ...prev, duration_minutes: parseInt(e.target.value) || 15 }))}
                      min="5"
                      max="120"
                    />
                  </div>
                  <div>
                    <Label htmlFor="step_description">Description</Label>
                    <Textarea
                      id="step_description"
                      value={newStep.description}
                      onChange={(e) => setNewStep(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="Describe what happens in this interview step..."
                    />
                  </div>
                </div>
                <div className="flex justify-end mt-2">
                  <Button
                    onClick={addInterviewStep}
                    disabled={!newStep.name || !newStep.assistant_id || !newStep.duration_minutes}
                    className="flex items-center gap-2"
                  >
                    <Plus className="h-4 w-4" />
                    Add Step
                  </Button>
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <h4 className="font-medium">Interview Steps</h4>
                {formData.interview_process?.steps.map((step, index) => (
                  <Card key={index} className="p-4">
                    <div className="flex justify-between items-start">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">Step {index + 1}</Badge>
                          <h5 className="font-medium">{step.name}</h5>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Agent: {step.agent_name} • Duration: {step.duration_minutes} min
                        </p>
                        {step.description && (
                          <p className="text-sm text-muted-foreground">{step.description}</p>
                        )}
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeInterviewStep(index)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="flex justify-between pt-6">
        <div className="flex gap-2">
          {currentTab !== 'basic' && (
            <Button variant="outline" onClick={() => {
              const tabs = ['basic', 'details', 'requirements', 'interview']
              const currentIndex = tabs.indexOf(currentTab)
              if (currentIndex > 0) setCurrentTab(tabs[currentIndex - 1])
            }}>
              Previous
            </Button>
          )}
        </div>
        
        <div className="flex gap-2">
          {currentTab !== 'interview' ? (
            <Button onClick={() => {
              const tabs = ['basic', 'details', 'requirements', 'interview']
              const currentIndex = tabs.indexOf(currentTab)
              if (currentIndex < tabs.length - 1) setCurrentTab(tabs[currentIndex + 1])
            }}>
              Next
            </Button>
          ) : (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button className="flex items-center gap-2">
                  <Save className="h-4 w-4" />
                  Create Job
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Create Job Posting</AlertDialogTitle>
                  <AlertDialogDescription>
                    Are you ready to create this job posting? Once created, candidates will be able to apply and go through the AI interview process.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleSubmit} disabled={isLoading}>
                    {isLoading ? 'Creating...' : 'Create Job'}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
        </div>
      </div>
    </div>
  )
}
