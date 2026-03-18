import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { AlertTriangle, ArrowRight, Upload } from 'lucide-react'
import { WORKFLOW_ACTIONS } from '@/lib/constants'

export default function WorkflowActions({ project, profile, onAction }) {
  const [confirmAction, setConfirmAction] = useState(null)
  const [fileAction, setFileAction] = useState(null)
  const [selectedFile, setSelectedFile] = useState(null)

  const actions = WORKFLOW_ACTIONS[project.status] || []
  const visibleActions = actions.filter(a => a.roles.includes(profile?.role))

  if (visibleActions.length === 0) return null

  function handleClick(action) {
    if (action.confirm) {
      setConfirmAction(action)
    } else if (action.requireFile) {
      setFileAction(action)
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
              <AlertTriangle className="h-5 w-5 text-amber-500" />
              확인
            </DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            "{confirmAction?.label}" 을(를) 진행하시겠습니까?
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmAction(null)}>취소</Button>
            <Button
              variant={confirmAction?.variant || 'default'}
              onClick={handleConfirm}
            >
              확인
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* File Upload Dialog */}
      <Dialog open={!!fileAction} onOpenChange={() => { setFileAction(null); setSelectedFile(null) }}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Upload className="h-5 w-5" />
              {fileAction?.label}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <Label>파일 첨부 (선택)</Label>
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
