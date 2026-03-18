import { Button } from '@/components/ui/button'

export default function EmptyState({ icon: Icon, title, description, action, actionLabel }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 animate-in fade-in duration-500">
      {Icon && (
        <div className="h-16 w-16 rounded-2xl bg-[#F1F1F1] flex items-center justify-center mb-4">
          <Icon className="h-8 w-8 text-[#515151]" />
        </div>
      )}
      <h3 className="text-lg font-semibold text-foreground mb-1">{title}</h3>
      {description && (
        <p className="text-sm text-muted-foreground text-center max-w-sm mb-4">{description}</p>
      )}
      {action && actionLabel && (
        <Button onClick={action} className="bg-[#13294B] hover:bg-[#13294B]/90">
          {actionLabel}
        </Button>
      )}
    </div>
  )
}
