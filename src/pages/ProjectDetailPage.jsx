import { useState, useCallback } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { ArrowLeft, Upload, Download, FileIcon, Files, ClipboardCheck, MessageSquare, Trash2 } from 'lucide-react'
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
import { useProject, useUpdateProject, useDeleteProject, useAgencyUsers } from '@/hooks/useProjects'
import { useFiles, useUploadFile, useDeleteFile, getSignedUrl } from '@/hooks/useFiles'
import { useLogActivity } from '@/hooks/useActivityLog'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { AlertTriangle } from 'lucide-react'
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
  const deleteFile = useDeleteFile()
  const logActivity = useLogActivity()
  const { data: brandAssets = [] } = useBrandAssets('all')
  const deleteProject = useDeleteProject()
  const navigate = useNavigate()
  const { data: agencyUsers = [] } = useAgencyUsers()
  const [dragOver, setDragOver] = useState(false)
  const [showAssetPicker, setShowAssetPicker] = useState(false)
  const [showAgencySelect, setShowAgencySelect] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [showRevisionPicker, setShowRevisionPicker] = useState(false)
  const [revisionFile, setRevisionFile] = useState(null)
  const [expandedVersions, setExpandedVersions] = useState({})

  const handleWorkflowAction = useCallback(async ({ targetStatus, actionKey, file, fileCategory, agencyId }) => {
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

    // Build update payload
    const updatePayload = { id: project.id, status: targetStatus }
    if (agencyId) updatePayload.agency_id = agencyId

    // Update project status (and agency if selected)
    await updateProject.mutateAsync(updatePayload)

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
      send_to_owner: 'User 검토 요청',
      skip_to_quotation: '견적 요청 진행',
      return_to_draft: '초안으로 반려됨',
      approve_to_quotation: '승인, 견적 요청 진행',
      request_changes: '수정 요청',
      submit_quotation: '견적서 제출됨',
      send_for_approval: 'User 승인 요청',
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
        <div className="flex items-center gap-2">
          <Link to={project.conference_id ? `/conferences/${project.conference_id}` : '/requests'}>
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-1" />
              {project.conference_id ? 'Back to Conference' : 'Back to Requests'}
            </Button>
          </Link>
          {(profile?.role === 'ms_manager' || profile?.role === 'ms_staff') && (
            <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive" onClick={() => setShowDeleteConfirm(true)}>
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
        </div>
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
              {project.requester && (
                <div>
                  <span className="text-muted-foreground">Requester: </span>
                  <span className="font-medium">{project.requester.name}</span>
                </div>
              )}
              {project.assignee && (
                <div>
                  <span className="text-muted-foreground">Assignee: </span>
                  <span className="font-medium">{project.assignee.name}</span>
                </div>
              )}
              {project.assigned_agency && (
                <div>
                  <span className="text-muted-foreground">Agency: </span>
                  <span className="font-medium">{project.assigned_agency.name}{project.assigned_agency.company ? ` (${project.assigned_agency.company})` : ''}</span>
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
          files={files || []}
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
                  <div className="flex gap-2 justify-center flex-wrap">
                    <Button variant="outline" size="sm" onClick={() => document.getElementById('file-input').click()}>
                      New File
                    </Button>
                    <input id="file-input" type="file" multiple className="hidden" onChange={handleFileSelect} />
                    {files?.length > 0 && (
                      <Button variant="outline" size="sm" onClick={() => {
                        setRevisionFile(null)
                        setShowRevisionPicker(true)
                      }}>
                        Upload Revision
                      </Button>
                    )}
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
                ) : (() => {
                  // Group files by original_name, show latest version by default
                  const grouped = {}
                  files.forEach(f => {
                    const key = f.original_name
                    if (!grouped[key]) grouped[key] = []
                    grouped[key].push(f)
                  })
                  // Sort each group by version desc
                  Object.values(grouped).forEach(arr => arr.sort((a, b) => b.version - a.version))
                  const fileGroups = Object.entries(grouped)

                  return (
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
                        {fileGroups.map(([origName, versions]) => {
                          const latest = versions[0]
                          const hasOlderVersions = versions.length > 1
                          const isExpanded = expandedVersions[origName]
                          const displayFiles = (isExpanded && profile?.role !== 'agency') ? versions : [latest]

                          return displayFiles.map((file, idx) => (
                            <TableRow key={file.id} className={idx > 0 ? 'bg-muted/30' : ''}>
                              <TableCell className="font-medium">
                                <div className="flex items-center gap-2">
                                  <FileIcon className="h-4 w-4 text-muted-foreground" />
                                  <span className={idx > 0 ? 'text-muted-foreground text-xs' : ''}>
                                    {file.original_name}
                                  </span>
                                  {idx === 0 && hasOlderVersions && profile?.role !== 'agency' && (
                                    <button
                                      className="text-xs text-[#199AC2] hover:underline"
                                      onClick={() => setExpandedVersions(prev => ({ ...prev, [origName]: !prev[origName] }))}
                                    >
                                      {isExpanded ? '이전 버전 숨기기' : `+${versions.length - 1} older`}
                                    </button>
                                  )}
                                </div>
                              </TableCell>
                              <TableCell>
                                <Badge variant="outline" className="text-xs capitalize">
                                  {file.file_category || 'general'}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                <Badge variant={idx === 0 ? 'default' : 'outline'} className={idx === 0 ? 'bg-[#199AC2]' : ''}>
                                  v{file.version}
                                </Badge>
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
                                <div className="flex gap-1">
                                  <Button variant="ghost" size="sm" onClick={() => handleDownload(file)}>
                                    <Download className="h-4 w-4" />
                                  </Button>
                                  {(profile?.role === 'ms_staff' || profile?.role === 'ms_manager') && (
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className="text-destructive hover:text-destructive"
                                      onClick={() => deleteFile.mutate({ id: file.id, storagePath: file.storage_path })}
                                    >
                                      <Trash2 className="h-4 w-4" />
                                    </Button>
                                  )}
                                </div>
                              </TableCell>
                            </TableRow>
                          ))
                        })}
                      </TableBody>
                    </Table>
                  )
                })()}
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

        {/* Activity Log - hidden for agency */}
        {profile?.role !== 'agency' && (
          <Card>
            <CardContent className="pt-6">
              <ActivityLog projectId={id} />
            </CardContent>
          </Card>
        )}
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

      {/* Revision Upload Dialog */}
      <Dialog open={showRevisionPicker} onOpenChange={() => { setShowRevisionPicker(false); setRevisionFile(null) }}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>수정본 업로드</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground mb-2">교체할 기존 파일을 선택하세요:</p>
              {(() => {
                // Get unique latest files (exclude quotation/invoice)
                const grouped = {}
                files?.forEach(f => {
                  if (f.file_category === 'quotation' || f.file_category === 'invoice') return
                  if (!grouped[f.original_name] || f.version > grouped[f.original_name].version) {
                    grouped[f.original_name] = f
                  }
                })
                const latestFiles = Object.values(grouped)
                return latestFiles.length === 0 ? (
                  <p className="text-sm text-muted-foreground">교체 가능한 파일이 없습니다</p>
                ) : (
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {latestFiles.map(f => (
                      <div
                        key={f.id}
                        className={`flex items-center gap-3 p-2 rounded-lg border cursor-pointer transition-colors ${
                          revisionFile?.targetName === f.original_name
                            ? 'border-[#199AC2] bg-[#199AC2]/5'
                            : 'hover:bg-accent/50'
                        }`}
                        onClick={() => setRevisionFile(prev => ({ ...prev, targetName: f.original_name }))}
                      >
                        <FileIcon className="h-4 w-4 text-muted-foreground" />
                        <div className="flex-1">
                          <p className="text-sm font-medium">{f.original_name}</p>
                          <p className="text-xs text-muted-foreground">v{f.version} • {f.uploader?.name}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )
              })()}
            </div>
            {revisionFile?.targetName && (
              <div>
                <p className="text-sm font-medium mb-2">수정본 파일 선택:</p>
                <div className="flex items-center gap-3">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => document.getElementById('revision-file-input').click()}
                  >
                    <Upload className="h-4 w-4 mr-1" />
                    파일 찾기
                  </Button>
                  <input
                    id="revision-file-input"
                    type="file"
                    className="hidden"
                    onChange={(e) => setRevisionFile(prev => ({ ...prev, file: e.target.files[0] }))}
                  />
                  <span className="text-sm text-muted-foreground">
                    {revisionFile?.file ? revisionFile.file.name : '선택된 파일 없음'}
                  </span>
                </div>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setShowRevisionPicker(false); setRevisionFile(null) }}>취소</Button>
            <Button
              className="bg-[#13294B] hover:bg-[#13294B]/90"
              disabled={!revisionFile?.targetName || !revisionFile?.file}
              onClick={async () => {
                if (!revisionFile?.file || !project) return
                // Upload as revision — use the original file's name so versioning auto-increments
                const renamedFile = new File([revisionFile.file], revisionFile.targetName, { type: revisionFile.file.type })
                await uploadFile.mutateAsync({
                  projectId: project.id,
                  conferenceId: project.conference_id,
                  file: renamedFile,
                })
                await logActivity.mutateAsync({
                  projectId: project.id,
                  userId: user.id,
                  action: 'file_upload',
                  details: { filename: revisionFile.targetName, type: 'revision' },
                })
                setShowRevisionPicker(false)
                setRevisionFile(null)
              }}
            >
              수정본 업로드
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              프로젝트 삭제
            </DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            "{project?.title}"을(를) 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteConfirm(false)}>취소</Button>
            <Button
              variant="destructive"
              onClick={async () => {
                await deleteProject.mutateAsync(project.id)
                setShowDeleteConfirm(false)
                navigate(project.conference_id ? `/conferences/${project.conference_id}` : '/requests')
              }}
            >
              삭제
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
