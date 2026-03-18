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
import { useProject, useUpdateProject } from '@/hooks/useProjects'
import { useFiles, useUploadFile, getSignedUrl } from '@/hooks/useFiles'
import { useAuth } from '@/contexts/AuthContext'
import { notifyProjectMembers } from '@/lib/notify'
import { PROJECT_STATUS, TRACK_TYPES } from '@/lib/constants'

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
  const [dragOver, setDragOver] = useState(false)

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
    notifyProjectMembers({
      projectId: project.id,
      excludeUserId: user.id,
      eventType: 'file_upload',
      title: 'New File Uploaded',
      message: `${profile?.name} uploaded ${droppedFiles.length} file(s)`,
      link: `/projects/${project.id}`,
    })
  }, [project, uploadFile, user, profile])

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
    notifyProjectMembers({
      projectId: project.id,
      excludeUserId: user.id,
      eventType: 'file_upload',
      title: 'New File Uploaded',
      message: `${profile?.name} uploaded ${selectedFiles.length} file(s)`,
      link: `/projects/${project.id}`,
    })
  }, [project, uploadFile, user, profile])

  async function handleDownload(file) {
    const { data, error } = await getSignedUrl(file.storage_path)
    if (!error && data?.signedUrl) {
      window.open(data.signedUrl, '_blank')
    }
  }

  if (isLoading) return <div className="p-6 text-muted-foreground">Loading...</div>
  if (!project) return <div className="p-6 text-muted-foreground">Project not found</div>

  const status = PROJECT_STATUS[project.status]
  const track = TRACK_TYPES[project.track_type]

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
      <div className="p-6 space-y-6">
        {/* Project Info */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-wrap gap-6 text-sm">
              <div>
                <span className="text-muted-foreground">Track: </span>
                <span>{track?.icon} {track?.label}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Conference: </span>
                {project.conference?.name}
              </div>
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
            <div className="mt-4">
              <Select
                value={project.status}
                onValueChange={(v) => updateProject.mutate({ id: project.id, status: v })}
              >
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(PROJECT_STATUS).map(([key, { label }]) => (
                    <SelectItem key={key} value={key}>{label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

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
                  <label>
                    <input type="file" multiple className="hidden" onChange={handleFileSelect} />
                    <Button variant="outline" size="sm" asChild>
                      <span>Browse Files</span>
                    </Button>
                  </label>
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
      </div>
    </>
  )
}
