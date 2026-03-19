import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { AlertTriangle, ArrowRight, Upload, Users, FileCheck } from 'lucide-react'
import { WORKFLOW_ACTIONS } from '@/lib/constants'
import { useAgencyUsers } from '@/hooks/useProjects'

export default function WorkflowActions({ project, profile, files = [], onAction }) {
  const [confirmAction, setConfirmAction] = useState(null)
  const [fileAction, setFileAction] = useState(null)
  const [selectedFile, setSelectedFile] = useState(null)
  const [agencyAction, setAgencyAction] = useState(null)
  const [selectedAgencyId, setSelectedAgencyId] = useState('')
  const { data: agencyUsers = [] } = useAgencyUsers()

  const actions = WORKFLOW_ACTIONS[project.status] || []
  const visibleActions = actions.filter(a => a.roles.includes(profile?.role))

  if (visibleActions.length === 0) return null

  // Actions that move to quotation_request need agency selection
  const needsAgencySelect = (action) =>
    action.target === 'quotation_request' && !project.agency_id

  function handleClick(action) {
    if (needsAgencySelect(action)) {
      setAgencyAction(action)
    } else if (action.confirm) {
      setConfirmAction(action)
    } else if (action.requireFile) {
      // If files already uploaded, show confirm dialog instead of file upload
      if (files.length > 0) {
        setConfirmAction({ ...action, hasFiles: true })
      } else {
        setFileAction(action)
      }
    } else {
      onAction({ targetStatus: action.target, actionKey: action.key })
    }
  }

  function handleConfirm() {
    if (confirmAction) {
      onAction({ targetStatus: confirmAction.target, actionKey: confirmAction.key })
      setConfirmAction(null)
    }
  }

  function handleFileSubmit() {
    if (fileAction) {
      onAction({
        targetStatus: fileAction.target,
        actionKey: fileAction.key,
        file: selectedFile,
        fileCategory: fileAction.requireFile,
      })
      setFileAction(null)
      setSelectedFile(null)
    }
  }

  function handleAgencySubmit() {
    if (agencyAction && selectedAgencyId) {
      onAction({
        targetStatus: agencyAction.target,
        actionKey: agencyAction.key,
        agencyId: selectedAgencyId,
      })
      setAgencyAction(null)
      setSelectedAgencyId('')
    }
  }

  return (
    <>
      <Card className="border-[#FDB813]/30 bg-[#FDB813]/5">
        <CardContent className="pt-4 pb-4">
          <div className="flex flex-wrap items-center gap-3">
            <span className="text-sm font-medium text-muted-foreground mr-2">Actions:</span>
            {visibleActions.map((action) => (
              <Button
                key={action.key}
                variant={action.variant}
                size="sm"
                onClick={() => handleClick(action)}
                className={action.variant === 'default' ? 'bg-[#13294B] hover:bg-[#13294B]/90' : ''}
              >
                <ArrowRight className="h-4 w-4 mr-1" />
                {action.label}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Confirm Dialog */}
      <Dialog open={!!confirmAction} onOpenChange={() => setConfirmAction(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {confirmAction?.hasFiles ? (
                <FileCheck className="h-5 w-5 text-[#199AC2]" />
              ) : (
                <AlertTriangle className="h-5 w-5 text-amber-500" />
              )}
              확인
            </DialogTitle>
          </DialogHeader>
          {confirmAction?.hasFiles ? (
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">
                첨부된 파일 {files.length}개가 있습니다. 이대로 진행하시겠습니까?
              </p>
              <div className="text-xs text-muted-foreground bg-muted rounded-lg p-2 space-y-1">
                {files.slice(0, 3).map(f => (
                  <p key={f.id}>📎 {f.original_name} (v{f.version})</p>
                ))}
                {files.length > 3 && <p>...외 {files.length - 3}개</p>}
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              "{confirmAction?.label}" 을(를) 진행하시겠습니까?
            </p>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmAction(null)}>취소</Button>
            <Button
              variant={confirmAction?.hasFiles ? 'default' : (confirmAction?.variant || 'default')}
              className={confirmAction?.hasFiles ? 'bg-[#13294B] hover:bg-[#13294B]/90' : ''}
              onClick={handleConfirm}
            >
              확인
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Agency Selection Dialog */}
      <Dialog open={!!agencyAction} onOpenChange={() => { setAgencyAction(null); setSelectedAgencyId('') }}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              협력업체 선택
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <Label>견적을 요청할 협력업체를 선택하세요</Label>
            <Select value={selectedAgencyId} onValueChange={setSelectedAgencyId}>
              <SelectTrigger>
                <SelectValue placeholder="협력업체 선택..." />
              </SelectTrigger>
              <SelectContent>
                {agencyUsers.map(agency => (
                  <SelectItem key={agency.id} value={agency.id}>
                    {agency.name}{agency.company ? ` (${agency.company})` : ''}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {agencyUsers.length === 0 && (
              <p className="text-xs text-destructive">
                등록된 협력업체가 없습니다. 협력업체가 먼저 회원가입해야 합니다.
              </p>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setAgencyAction(null); setSelectedAgencyId('') }}>취소</Button>
            <Button
              className="bg-[#13294B] hover:bg-[#13294B]/90"
              onClick={handleAgencySubmit}
              disabled={!selectedAgencyId}
            >
              견적 요청 발송
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* File Upload Dialog (only when no files exist) */}
      <Dialog open={!!fileAction} onOpenChange={() => { setFileAction(null); setSelectedFile(null) }}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Upload className="h-5 w-5" />
              {fileAction?.label}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <Label>파일 첨부</Label>
            <Input
              type="file"
              onChange={(e) => setSelectedFile(e.target.files[0])}
            />
            <p className="text-xs text-muted-foreground">
              파일 없이 진행하려면 그대로 확인을 누르세요.
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setFileAction(null); setSelectedFile(null) }}>취소</Button>
            <Button className="bg-[#13294B] hover:bg-[#13294B]/90" onClick={handleFileSubmit}>
              확인
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
