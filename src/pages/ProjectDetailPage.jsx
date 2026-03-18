import { useState, useCallback } from 'react'
import { useParams, Link } from 'react-router-dom'
import { ArrowLeft, Upload, Download, FileIcon, Files, ClipboardCheck, MessageSquare } from 'lucide-react'
import { format } from 'date-fns'
import { ko } from 'date-fns/locale'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import Header from '@/components/layout/Header'
import ReviewPanel from '@/components/reviews/ReviewPanel'
import CommentList from '@/components/comments/CommentList'
import WorkflowProgress from '@/components/workflow/WorkflowProgress'
import WorkflowActions from '@/components/workflow/WorkflowActions'
import ActivityLog from '@/components/activity/ActivityLog'
import { useProject, useUpdateProject } from '@/hooks/useProjects'
import { useFiles, useUploadFile, getSignedUrl } from '@/hooks/useFiles'
import { useLogActivity } from '@/hooks/useActivityLog'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { useAuth } from '@/contexts/AuthContext'
import { notifyProjectMembers } from '@/lib/notify'
import { useBrandAssets, getBrandAssetUrl, archiveReleasedFiles } from '@/hooks/useBrandAssets'
import { PROJECT_STATUS, TRACK_TYPES, AGENCY_VISIBLE_STATUSES } from '@/lib/constants'

function formatFileSize(bytes) {
  if (!bytes) return '-'
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export default function ProjectDetailPage() {
  const { id } = useParams()
  const { user, profile } = useAuth()
  const { data: project, isLoading } = useProject(id)
  const { data: files, isLoading: filesLoading } = useFiles(id)
  const updateProject = useUpdateProject()
  const uploadFile = useUploadFile()
  const logActivity = useLogActivity()
  const { data: brandAssets = [] } = useBrandAssets('all')
  const [dragOver, setDragOver] = useState(false)
  const [showAssetPicker, setShowAssetPicker] = useState(false)

  const handleWorkflowAction = useCallback(async ({ targetStatus, actionKey, file, fileCategory }) => {
    if (!project || !user) return

    // Upload file if provided (for quotation/invoice actions)
    if (file) {
      await uploadFile.mutateAsync({
        projectId: project.id,
        conferenceId: project.conference_id,
        file,
        fileCategory,
      })
    }

    // Update project status
    await updateProject.mutateAsync({ id: project.id, status: targetStatus })

    // Auto-archive files to Brand Assets when releasing
    if (targetStatus === 'released') {
      archiveReleasedFiles({
        projectId: project.id,
        projectTitle: project.title,
        trackType: project.track_type,
        userId: user.id,
      }).catch(() => {}) // Don't block workflow on archive failure
    }

    // Log activity
    await logActivity.mutateAsync({
      projectId: project.id,
      userId: user.id,
      action: actionKey,
      details: {
        fromStatus: project.status,
        toStatus: targetStatus,
        filename: file?.name,
      },
    })

    // Notify project members
    const actionLabels = {
      submit_to_ms: 'MS팀에 제출됨',
      send_to_owner: 'Owner 검토 요청',
      skip_to_quotation: '견적 요청 진행',
      return_to_draft: '초안으로 반려됨',
      approve_to_quotation: '승인, 견적 요청 진행',
      request_changes: '수정 요청',
      submit_quotation: '견적서 제출됨',
      send_for_approval: 'Owner 승인 요청',
      approve_quotation: '견적 승인됨',
      reject_quotation: '견적 반려됨',
      start_production: '제작 시작',
      submit_invoice: '세금계산서 제출됨',
      complete_project: '프로젝트 완료',
    }

    notifyProjectMembers({
      projectId: project.id,
      excludeUserId: user.id,
      eventType: 'status_change',
      title: `[${project.title}] ${actionLabels[actionKey] || 'Status Updated'}`,
      message: `${profile?.name}님이 프로젝트 상태를 변경했습니다.`,
      link: `/projects/${project.id}`,
    })
  }, [project, user, profile, updateProject, uploadFile, logActivity])

  const handleDrop = useCallback(async (e) => {
    e.preventDefault()
    setDragOver(false)
    if (!project) return
    const droppedFiles = Array.from(e.dataTransfer.files)
    for (const file of droppedFiles) {
      await uploadFile.mutateAsync({
        projectId: project.id,
        conferenceId: project.conference_id,
        file,
      })
    }
    // Log file upload activity
    await logActivity.mutateAsync({
      projectId: project.id,
      userId: user.id,
      action: 'file_upload',
      details: { filename: droppedFiles.map(f => f.name).join(', '), count: droppedFiles.length },
    })
    notifyProjectMembers({
      projectId: project.id,
      excludeUserId: user.id,
      eventType: 'file_upload',
      title: 'New File Uploaded',
      message: `${profile?.name} uploaded ${droppedFiles.length} file(s)`,
      link: `/projects/${project.id}`,
    })
  }, [project, uploadFile, user, profile, logActivity])

  const handleFileSelect = useCallback(async (e) => {
    if (!project) return
    const selectedFiles = Array.from(e.target.files)
    for (const file of selectedFiles) {
      await uploadFile.mutateAsync({
        projectId: project.id,
        conferenceId: project.conference_id,
        file,
      })
    }
    e.target.value = ''
    // Log file upload activity
    await logActivity.mutateAsync({
      projectId: project.id,
      userId: user.id,
      action: 'file_upload',
      details: { filename: selectedFiles.map(f => f.name).join(', '), count: selectedFiles.length },
    })
    notifyProjectMembers({
      projectId: project.id,
      excludeUserId: user.id,
      eventType: 'file_upload',
      title: 'New File Uploaded',
      message: `${profile?.name} uploaded ${selectedFiles.length} file(s)`,
      link: `/projects/${project.id}`,
    })
  }, [project, uploadFile, user, profile, logActivity])

  async function handleDownload(file) {
    const { data, error } = await getSignedUrl(file.storage_path)
    if (!error && data?.signedUrl) {
      window.open(data.signedUrl, '_blank')
    }
  }

  if (isLoading) return <div className="p-6 text-muted-foreground">Loading...</div>
  if (!project) return <div className="p-6 text-muted-foreground">Project not found</div>

  // Agency access control: block access before quotation_request
  if (profile?.role === 'agency' && !AGENCY_VISIBLE_STATUSES.includes(project.status)) {
    return <div className="p-6 text-muted-foreground">This project is not yet available.</div>
  }

  const status = PROJECT_STATUS[project.status]
  const track = TRACK_TYPES[project.track_type]

  // Detect skipped steps (if owner_review was skipped: went from ms_review to quotation_request)
  const skippedSteps = []
  const currentStep = status?.step || 1
  if (currentStep >= 4) {
    // If we never went through owner_review, mark it as skipped
    // Simple heuristic: if status is past owner_review
    skippedSteps.push('owner_review')
  }

  return (
    <>
      <Header
        title={project.title}
        breadcrumbs={
          project.conference_id
            ? [
                { label: 'Conferences', href: '/conferences' },
                { label: project.conference?.name || 'Conference', href: `/conferences/${project.conference_id}` },
                { label: project.title }
              ]
            : [
                { label: 'Requests', href: '/requests' },
                { label: project.title }
              ]
        }
      >
        <Link to={project.conference_id ? `/conferences/${project.conference_id}` : '/requests'}>
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4 mr-1" />
            {project.conference_id ? 'Back to Conference' : 'Back to Requests'}
          </Button>
        </Link>
      </Header>
      <div className="p-6 space-y-4">
        {/* Workflow Progress Bar */}
        <Card>
          <CardContent className="pt-4 pb-2">
            <WorkflowProgress currentStatus={project.status} skippedSteps={skippedSteps} />
          </CardContent>
        </Card>

        {/* Project Info */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-wrap gap-6 text-sm">
              <div>
                <span className="text-muted-foreground">Track: </span>
                <span>{track?.icon} {track?.label}</span>
              </div>
              {project.conference?.name && (
                <div>
                  <span className="text-muted-foreground">Conference: </span>
                  {project.conference.name}
                </div>
              )}
              <div>
                <span className="text-muted-foreground">Status: </span>
                <Badge className={status?.color}>{status?.label}</Badge>
              </div>
              {project.deadline && (
                <div>
                  <span className="text-muted-foreground">Deadline: </span>
                  {format(new Date(project.deadline), 'yyyy.MM.dd', { locale: ko })}
                </div>
              )}
              {project.assignee && (
                <div>
                  <span className="text-muted-foreground">Assignee: </span>
                  {project.assignee.name}
                </div>
              )}
              {project.agency && (
                <div>
                  <span className="text-muted-foreground">Agency: </span>
                  {project.agency.name}
                </div>
              )}
            </div>
            {project.description && (
              <p className="mt-3 text-sm text-muted-foreground">{project.description}</p>
            )}
            {/* Emergency status override for ms_manager only */}
            {profile?.role === 'ms_manager' && (
              <div className="mt-4">
                <Select
                  value={project.status}
                  onValueChange={async (v) => {
                    await updateProject.mutateAsync({ id: project.id, status: v })
                    await logActivity.mutateAsync({
                      projectId: project.id,
                      userId: user.id,
                      action: 'status_change',
                      details: { fromStatus: project.status, toStatus: v, note: 'Manual override' },
                    })
                  }}
                >
                  <SelectTrigger className="w-56">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(PROJECT_STATUS).map(([key, { label }]) => (
                      <SelectItem key={key} value={key}>{label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground mt-1">MS Manager: 긴급 상태 변경</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Workflow Action Buttons */}
        <WorkflowActions
          project={project}
          profile={profile}
          onAction={handleWorkflowAction}
        />

        {/* Tabs: Files / Reviews / Comments */}
        <Tabs defaultValue="files">
          <TabsList>
            <TabsTrigger value="files" className="gap-1.5">
              <Files className="h-4 w-4" />
              Files
            </TabsTrigger>
            <TabsTrigger value="reviews" className="gap-1.5">
              <ClipboardCheck className="h-4 w-4" />
              Reviews
            </TabsTrigger>
            <TabsTrigger value="comments" className="gap-1.5">
              <MessageSquare className="h-4 w-4" />
              Comments
            </TabsTrigger>
          </TabsList>

          {/* Files Tab */}
          <TabsContent value="files">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">File Management</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div
                  className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                    dragOver ? 'border-[#FDB813] bg-[#FDB813]/5' : 'border-muted-foreground/25'
                  }`}
                  onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
                  onDragLeave={() => setDragOver(false)}
                  onDrop={handleDrop}
                >
                  <Upload className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                  <p className="text-sm text-muted-foreground mb-2">Drag files here or</p>
                  <div className="flex gap-2 justify-center">
                    <label>
                      <input type="file" multiple className="hidden" onChange={handleFileSelect} />
                      <Button variant="outline" size="sm" asChild>
                        <span>Browse Files</span>
                      </Button>
                    </label>
                    <Button variant="outline" size="sm" onClick={() => setShowAssetPicker(true)}>
                      Import from Brand Assets
                    </Button>
                  </div>
                  {uploadFile.isPending && (
                    <p className="text-sm text-[#199AC2] mt-2">Uploading...</p>
                  )}
                </div>

                {filesLoading ? (
                  <p className="text-sm text-muted-foreground">Loading files...</p>
                ) : files?.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">No files uploaded yet</p>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>File Name</TableHead>
                        <TableHead>Category</TableHead>
                        <TableHead>Version</TableHead>
                        <TableHead>Size</TableHead>
                        <TableHead>Uploader</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {files?.map(file => (
                        <TableRow key={file.id}>
                          <TableCell className="font-medium">
                            <div className="flex items-center gap-2">
                              <FileIcon className="h-4 w-4 text-muted-foreground" />
                              {file.original_name}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className="text-xs capitalize">
                              {file.file_category || 'general'}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">v{file.version}</Badge>
                          </TableCell>
                          <TableCell className="text-muted-foreground">
                            {formatFileSize(file.file_size)}
                          </TableCell>
                          <TableCell className="text-muted-foreground">
                            {file.uploader?.name || '-'}
                          </TableCell>
                          <TableCell className="text-muted-foreground">
                            {format(new Date(file.created_at), 'MM.dd HH:mm', { locale: ko })}
                          </TableCell>
                          <TableCell>
                            <Button variant="ghost" size="sm" onClick={() => handleDownload(file)}>
                              <Download className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Reviews Tab */}
          <TabsContent value="reviews">
            <Card>
              <CardContent className="pt-6">
                <ReviewPanel projectId={id} />
              </CardContent>
            </Card>
          </TabsContent>

          {/* Comments Tab */}
          <TabsContent value="comments">
            <Card>
              <CardContent className="pt-6">
                <CommentList projectId={id} />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Activity Log - Always visible at bottom */}
        <Card>
          <CardContent className="pt-6">
            <ActivityLog projectId={id} />
          </CardContent>
        </Card>
      </div>

      {/* Brand Assets Picker Dialog */}
      <Dialog open={showAssetPicker} onOpenChange={setShowAssetPicker}>
        <DialogContent className="max-w-lg max-h-[70vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Import from Brand Assets</DialogTitle>
          </DialogHeader>
          <div className="space-y-2">
            {brandAssets.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">No brand assets available</p>
            ) : (
              brandAssets.map(asset => (
                <div
                  key={asset.id}
                  className="flex items-center justify-between p-3 rounded-lg border hover:bg-accent/50 cursor-pointer"
                  onClick={async () => {
                    const { data } = await getBrandAssetUrl(asset.file_path)
                    if (data?.signedUrl) {
                      const res = await fetch(data.signedUrl)
                      const blob = await res.blob()
                      const fileName = asset.name.replace(/[[\]]/g, '').split(' ').pop() || asset.name
                      const file = new File([blob], fileName, { type: asset.mime_type })
                      await uploadFile.mutateAsync({
                        projectId: project.id,
                        conferenceId: project.conference_id,
                        file,
                      })
                      await logActivity.mutateAsync({
                        projectId: project.id,
                        userId: user.id,
                        action: 'file_upload',
                        details: { filename: asset.name, source: 'brand_assets' },
                      })
                      setShowAssetPicker(false)
                    }
                  }}
                >
                  <div>
                    <p className="text-sm font-medium">{asset.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {asset.category} • {formatFileSize(asset.file_size)}
                    </p>
                  </div>
                  <Badge variant="outline" className="text-xs capitalize">{asset.category}</Badge>
                </div>
              ))
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
