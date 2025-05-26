'use client'

import { useState } from 'react'
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

export default function JobSetupPage() {
  const router = useRouter()
  const [currentTab, setCurrentTab] = useState('basic')
  const [isLoading, setIsLoading] = useState(false)
  
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
      steps: [
        {
          name: 'Founder Screening',
          agent_name: 'MountainPass Founder',
          duration_minutes: 15,
          description: 'Initial conversation with the company founder'
        },
        {
          name: 'HR Screening',
          agent_name: 'HR Screener',
          duration_minutes: 20,
          description: 'HR screening for culture fit and basic qualifications'
        },
        {
          name: 'Technical Interview',
          agent_name: 'Ski Instructor',
          duration_minutes: 30,
          description: 'Technical skills and experience assessment'
        }
      ]
    }
  })

  const [newItem, setNewItem] = useState('')
  const [newStep, setNewStep] = useState({
    name: '',
    agent_name: '',
    duration_minutes: 15,
    description: ''
  })

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

      const { data, error } = await supabase
        .from('jobs')
        .insert([formData as JobInsert])
        .select()
        .single()

      if (error) {
        console.error('Error creating job:', error)
        toast.error('Failed to create job')
        return
      }

      toast.success('Job created successfully!')
      router.push('/candidates')
    } catch (error) {
      console.error('Error:', error)
      toast.error('An unexpected error occurred')
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
                VAPI Integration
              </CardTitle>
              <CardDescription>
                Configure your VAPI squad and phone number for AI interviews
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="vapi_squad_id">VAPI Squad ID</Label>
                <Input
                  id="vapi_squad_id"
                  value={formData.vapi_squad_id || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, vapi_squad_id: e.target.value }))}
                  placeholder="Enter your VAPI Squad ID"
                />
              </div>
              <div>
                <Label htmlFor="phone_number">Phone Number</Label>
                <Input
                  id="phone_number"
                  value={formData.phone_number || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, phone_number: e.target.value }))}
                  placeholder="+1 (555) 123-4567"
                />
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
                    <Label htmlFor="agent_name">Agent Name</Label>
                    <Input
                      id="agent_name"
                      value={newStep.agent_name}
                      onChange={(e) => setNewStep(prev => ({ ...prev, agent_name: e.target.value }))}
                      placeholder="e.g. Technical Interviewer"
                    />
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
                  <div className="flex items-end">
                    <Button onClick={addInterviewStep} className="w-full">
                      <Plus className="h-4 w-4 mr-2" />
                      Add Step
                    </Button>
                  </div>
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
