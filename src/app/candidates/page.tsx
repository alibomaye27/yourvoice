'use client'

import { useState, useEffect } from 'react'
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
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { supabase } from '@/lib/supabase'
import { Application, Candidate, Job, Interview } from '@/types/database'
import { 
  Search, 
  Filter, 
  Eye, 
  Phone, 
  Mail, 
  MapPin, 
  Calendar, 
  Clock, 
  Star, 
  FileText, 
  User, 
  GraduationCap,
  Award,
  Briefcase,
  MessageSquare,
  PhoneCall,
  CheckCircle,
  XCircle,
  PlayCircle,
  Pause
} from 'lucide-react'
import { toast } from 'sonner'

interface CandidateWithApplication extends Candidate {
  applications: (Application & {
    job: Job
    interviews: Interview[]
  })[]
}

export default function CandidatesPage() {
  const [candidates, setCandidates] = useState<CandidateWithApplication[]>([])
  const [filteredCandidates, setFilteredCandidates] = useState<CandidateWithApplication[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [selectedCandidate, setSelectedCandidate] = useState<CandidateWithApplication | null>(null)

  useEffect(() => {
    fetchCandidates()
  }, [])

  useEffect(() => {
    filterCandidates()
  }, [candidates, searchTerm, statusFilter])

  const fetchCandidates = async () => {
    setIsLoading(true)
    try {
      const { data, error } = await supabase
        .from('candidates')
        .select(`
          *,
          applications (
            *,
            job:jobs (*),
            interviews (*)
          )
        `)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error fetching candidates:', error)
        toast.error('Failed to load candidates')
        return
      }

      setCandidates(data || [])
    } catch (error) {
      console.error('Error:', error)
      toast.error('An unexpected error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  const filterCandidates = () => {
    let filtered = candidates

    if (searchTerm) {
      filtered = filtered.filter(candidate =>
        candidate.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        candidate.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        candidate.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        candidate.applications.some(app => 
          app.job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          app.job.company.toLowerCase().includes(searchTerm.toLowerCase())
        )
      )
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(candidate =>
        candidate.applications.some(app => app.status === statusFilter)
      )
    }

    setFilteredCandidates(filtered)
  }

  const getApplicationStatus = (application: Application) => {
    const statusColors = {
      applied: 'bg-blue-100 text-blue-800',
      screening: 'bg-yellow-100 text-yellow-800',
      interviewing: 'bg-purple-100 text-purple-800',
      offered: 'bg-green-100 text-green-800',
      hired: 'bg-green-200 text-green-900',
      rejected: 'bg-red-100 text-red-800',
      withdrawn: 'bg-gray-100 text-gray-800'
    }

    return statusColors[application.status] || 'bg-gray-100 text-gray-800'
  }

  const getInterviewProgress = (interviews: Interview[]) => {
    const total = interviews.length
    const completed = interviews.filter(i => i.status === 'completed').length
    return total > 0 ? (completed / total) * 100 : 0
  }

  const formatScore = (score?: number) => {
    return score ? `${score}/10` : 'N/A'
  }

  const getOverallScore = (interviews: Interview[]) => {
    const completedInterviews = interviews.filter(i => i.status === 'completed' && i.scores?.overall)
    if (completedInterviews.length === 0) return null
    
    const average = completedInterviews.reduce((acc, interview) => 
      acc + (interview.scores?.overall || 0), 0
    ) / completedInterviews.length
    
    return Math.round(average * 10) / 10
  }

  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
            <p className="mt-2 text-muted-foreground">Loading candidates...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Candidates</h1>
        <p className="text-muted-foreground mt-2">
          Track candidate applications and AI interview progress
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search candidates, jobs, or companies..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        <div className="sm:w-48">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger>
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="applied">Applied</SelectItem>
              <SelectItem value="screening">Screening</SelectItem>
              <SelectItem value="interviewing">Interviewing</SelectItem>
              <SelectItem value="offered">Offered</SelectItem>
              <SelectItem value="hired">Hired</SelectItem>
              <SelectItem value="rejected">Rejected</SelectItem>
              <SelectItem value="withdrawn">Withdrawn</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Candidates List */}
      <div className="space-y-4">
        {filteredCandidates.length === 0 ? (
          <Card>
            <CardContent className="flex items-center justify-center h-32">
              <div className="text-center text-muted-foreground">
                <User className="h-8 w-8 mx-auto mb-2" />
                <p>No candidates found matching your criteria</p>
              </div>
            </CardContent>
          </Card>
        ) : (
          filteredCandidates.map((candidate) => (
            <Card key={candidate.id} className="overflow-hidden">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold text-lg">
                        {candidate.first_name[0]}{candidate.last_name[0]}
                      </div>
                      <div>
                        <h3 className="text-xl font-semibold">
                          {candidate.first_name} {candidate.last_name}
                        </h3>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Mail className="h-3 w-3" />
                            {candidate.email}
                          </span>
                          <span className="flex items-center gap-1">
                            <Phone className="h-3 w-3" />
                            {candidate.phone}
                          </span>
                          {candidate.experience_years && (
                            <span className="flex items-center gap-1">
                              <Briefcase className="h-3 w-3" />
                              {candidate.experience_years} years exp.
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Skills */}
                    <div className="mb-4">
                      <div className="flex flex-wrap gap-1">
                        {candidate.skills.slice(0, 5).map((skill, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {skill}
                          </Badge>
                        ))}
                        {candidate.skills.length > 5 && (
                          <Badge variant="outline" className="text-xs">
                            +{candidate.skills.length - 5} more
                          </Badge>
                        )}
                      </div>
                    </div>

                    {/* Applications */}
                    <div className="space-y-3">
                      {candidate.applications.map((application, index) => (
                        <div key={application.id} className="border border-gray-200 rounded-lg p-4">
                          <div className="flex items-center justify-between mb-3">
                            <div>
                              <h4 className="font-medium">{application.job.title}</h4>
                              <p className="text-sm text-muted-foreground">
                                {application.job.company} • Applied {new Date(application.applied_at).toLocaleDateString()}
                              </p>
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge className={getApplicationStatus(application)}>
                                {application.status.charAt(0).toUpperCase() + application.status.slice(1)}
                              </Badge>
                              {getOverallScore(application.interviews) && (
                                <div className="flex items-center gap-1 text-sm">
                                  <Star className="h-3 w-3 text-yellow-500" />
                                  {getOverallScore(application.interviews)}/10
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Interview Progress */}
                          {application.interviews.length > 0 && (
                            <div className="space-y-2">
                              <div className="flex items-center justify-between text-sm">
                                <span className="text-muted-foreground">Interview Progress</span>
                                <span className="text-muted-foreground">
                                  {application.interviews.filter(i => i.status === 'completed').length} / {application.interviews.length} completed
                                </span>
                              </div>
                              <Progress value={getInterviewProgress(application.interviews)} className="h-2" />
                              
                              <div className="flex flex-wrap gap-2 mt-3">
                                {application.interviews.map((interview, idx) => (
                                  <div key={interview.id} className="flex items-center gap-1 text-xs">
                                    {interview.status === 'completed' ? (
                                      <CheckCircle className="h-3 w-3 text-green-500" />
                                    ) : interview.status === 'in_progress' ? (
                                      <PlayCircle className="h-3 w-3 text-blue-500" />
                                    ) : interview.status === 'cancelled' ? (
                                      <XCircle className="h-3 w-3 text-red-500" />
                                    ) : (
                                      <Clock className="h-3 w-3 text-gray-400" />
                                    )}
                                    <span className="text-muted-foreground">
                                      {interview.step_name}
                                      {interview.scores?.overall && ` (${interview.scores.overall}/10)`}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="ml-6">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="outline" onClick={() => setSelectedCandidate(candidate)}>
                          <Eye className="h-4 w-4 mr-2" />
                          View Details
                        </Button>
                      </DialogTrigger>
                    </Dialog>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Candidate Details Modal */}
      {selectedCandidate && (
        <Dialog open={!!selectedCandidate} onOpenChange={() => setSelectedCandidate(null)}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold">
                  {selectedCandidate.first_name[0]}{selectedCandidate.last_name[0]}
                </div>
                {selectedCandidate.first_name} {selectedCandidate.last_name}
              </DialogTitle>
              <DialogDescription>
                Detailed candidate profile and application history
              </DialogDescription>
            </DialogHeader>

            <Tabs defaultValue="overview" className="mt-6">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="experience">Experience</TabsTrigger>
                <TabsTrigger value="certifications">Certifications</TabsTrigger>
                <TabsTrigger value="interviews">Interviews</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <User className="h-5 w-5" />
                      Personal Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm font-medium text-muted-foreground">Email</Label>
                      <p className="text-sm">{selectedCandidate.email}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-muted-foreground">Phone</Label>
                      <p className="text-sm">{selectedCandidate.phone}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-muted-foreground">Experience</Label>
                      <p className="text-sm">{selectedCandidate.experience_years || 'Not specified'} years</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-muted-foreground">LinkedIn</Label>
                      <p className="text-sm">
                        {selectedCandidate.linkedin_url ? (
                          <a href={selectedCandidate.linkedin_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                            View Profile
                          </a>
                        ) : (
                          'Not provided'
                        )}
                      </p>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <FileText className="h-5 w-5" />
                      Resume & Cover Letter
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {selectedCandidate.resume_url && (
                      <div>
                        <Label className="text-sm font-medium text-muted-foreground">Resume</Label>
                        <div className="mt-1">
                          <Button variant="outline" size="sm" asChild>
                            <a href={selectedCandidate.resume_url} target="_blank" rel="noopener noreferrer">
                              <FileText className="h-4 w-4 mr-2" />
                              View Resume
                            </a>
                          </Button>
                        </div>
                      </div>
                    )}
                    {selectedCandidate.cover_letter && (
                      <div>
                        <Label className="text-sm font-medium text-muted-foreground">Cover Letter</Label>
                        <div className="mt-1 p-3 bg-gray-50 rounded-md text-sm">
                          {selectedCandidate.cover_letter}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Skills</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {selectedCandidate.skills.map((skill, index) => (
                        <Badge key={index} variant="secondary">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="experience" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Briefcase className="h-5 w-5" />
                      Work Experience
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {selectedCandidate.work_experience.length > 0 ? (
                      <div className="space-y-4">
                        {selectedCandidate.work_experience.map((exp, index) => (
                          <div key={index} className="border-l-2 border-gray-200 pl-4 pb-4">
                            <h4 className="font-medium">{exp.position}</h4>
                            <p className="text-sm text-muted-foreground">{exp.company}</p>
                            <p className="text-xs text-muted-foreground">
                              {new Date(exp.start_date).toLocaleDateString()} - {exp.end_date ? new Date(exp.end_date).toLocaleDateString() : 'Present'}
                            </p>
                            <p className="text-sm mt-2">{exp.description}</p>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-muted-foreground">No work experience provided</p>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <GraduationCap className="h-5 w-5" />
                      Education
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {selectedCandidate.education.length > 0 ? (
                      <div className="space-y-4">
                        {selectedCandidate.education.map((edu, index) => (
                          <div key={index} className="border-l-2 border-gray-200 pl-4 pb-4">
                            <h4 className="font-medium">{edu.degree} in {edu.field_of_study}</h4>
                            <p className="text-sm text-muted-foreground">{edu.institution}</p>
                            <p className="text-xs text-muted-foreground">Graduated {edu.graduation_year}</p>
                            {edu.gpa && <p className="text-xs text-muted-foreground">GPA: {edu.gpa}</p>}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-muted-foreground">No education information provided</p>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="certifications" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Award className="h-5 w-5" />
                      Professional Certifications
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {selectedCandidate.certifications.length > 0 ? (
                      <div className="space-y-4">
                        {selectedCandidate.certifications.map((cert, index) => (
                          <div key={index} className="flex items-start justify-between p-4 border rounded-lg">
                            <div>
                              <h4 className="font-medium">{cert.name}</h4>
                              <p className="text-sm text-muted-foreground">Issued by {cert.issuer}</p>
                              <p className="text-xs text-muted-foreground">
                                Obtained: {new Date(cert.date_obtained).toLocaleDateString()}
                                {cert.expiry_date && ` • Expires: ${new Date(cert.expiry_date).toLocaleDateString()}`}
                              </p>
                              {cert.credential_id && (
                                <p className="text-xs text-muted-foreground">ID: {cert.credential_id}</p>
                              )}
                            </div>
                            <Badge variant="outline">
                              {cert.expiry_date && new Date(cert.expiry_date) < new Date() ? 'Expired' : 'Valid'}
                            </Badge>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-muted-foreground">No certifications provided</p>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="interviews" className="space-y-6">
                {selectedCandidate.applications.map((application) => (
                  <Card key={application.id}>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <PhoneCall className="h-5 w-5" />
                        {application.job.title} - {application.job.company}
                      </CardTitle>
                      <CardDescription>
                        Application Status: <Badge className={getApplicationStatus(application)}>
                          {application.status.charAt(0).toUpperCase() + application.status.slice(1)}
                        </Badge>
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      {application.interviews.length > 0 ? (
                        <div className="space-y-4">
                          {application.interviews.map((interview, index) => (
                            <div key={interview.id} className="border rounded-lg p-4">
                              <div className="flex items-center justify-between mb-3">
                                <div>
                                  <h4 className="font-medium">{interview.step_name}</h4>
                                  <p className="text-sm text-muted-foreground">Agent: {interview.agent_name}</p>
                                </div>
                                <Badge variant={
                                  interview.status === 'completed' ? 'default' :
                                  interview.status === 'in_progress' ? 'secondary' :
                                  interview.status === 'cancelled' ? 'destructive' : 'outline'
                                }>
                                  {interview.status}
                                </Badge>
                              </div>

                              {interview.status === 'completed' && interview.scores && (
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4">
                                  <div className="text-center p-2 bg-gray-50 rounded">
                                    <div className="text-lg font-semibold">{formatScore(interview.scores.technical_skills)}</div>
                                    <div className="text-xs text-muted-foreground">Technical</div>
                                  </div>
                                  <div className="text-center p-2 bg-gray-50 rounded">
                                    <div className="text-lg font-semibold">{formatScore(interview.scores.communication)}</div>
                                    <div className="text-xs text-muted-foreground">Communication</div>
                                  </div>
                                  <div className="text-center p-2 bg-gray-50 rounded">
                                    <div className="text-lg font-semibold">{formatScore(interview.scores.cultural_fit)}</div>
                                    <div className="text-xs text-muted-foreground">Culture Fit</div>
                                  </div>
                                  <div className="text-center p-2 bg-gray-50 rounded">
                                    <div className="text-lg font-semibold">{formatScore(interview.scores.enthusiasm)}</div>
                                    <div className="text-xs text-muted-foreground">Enthusiasm</div>
                                  </div>
                                  <div className="text-center p-2 bg-gray-50 rounded">
                                    <div className="text-lg font-semibold">{formatScore(interview.scores.experience_relevance)}</div>
                                    <div className="text-xs text-muted-foreground">Experience</div>
                                  </div>
                                  <div className="text-center p-2 bg-blue-50 rounded border border-blue-200">
                                    <div className="text-lg font-semibold text-blue-700">{formatScore(interview.scores.overall)}</div>
                                    <div className="text-xs text-blue-600">Overall</div>
                                  </div>
                                </div>
                              )}

                              {interview.summary && (
                                <div className="mb-3">
                                  <Label className="text-sm font-medium text-muted-foreground">Summary</Label>
                                  <p className="text-sm mt-1">{interview.summary}</p>
                                </div>
                              )}

                              {interview.feedback && (
                                <div className="mb-3">
                                  <Label className="text-sm font-medium text-muted-foreground">Feedback</Label>
                                  <p className="text-sm mt-1">{interview.feedback}</p>
                                </div>
                              )}

                              <div className="flex justify-between items-center text-xs text-muted-foreground">
                                <span>
                                  {interview.scheduled_at && `Scheduled: ${new Date(interview.scheduled_at).toLocaleString()}`}
                                  {interview.completed_at && ` • Completed: ${new Date(interview.completed_at).toLocaleString()}`}
                                </span>
                                {interview.duration_minutes && (
                                  <span>{interview.duration_minutes} minutes</span>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-muted-foreground">No interviews scheduled yet</p>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </TabsContent>
            </Tabs>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}
