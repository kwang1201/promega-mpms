import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { TRACK_TYPE_CONFIG } from '@/lib/constants'

export default function TypeSpecificFields({ trackType, metadata = {}, onChange }) {
  const config = TRACK_TYPE_CONFIG[trackType]
  if (!config?.fields?.length) return null

  function handleFieldChange(key, value) {
    onChange({ ...metadata, [key]: value })
  }

  return (
    <div className="space-y-3 border-t pt-3 mt-3">
      <p className="text-xs text-muted-foreground font-medium">상세 정보</p>
      {config.fields.map(field => (
        <div key={field.key} className="space-y-1">
          <Label htmlFor={field.key} className="text-sm">
            {field.label}
            {field.required && <span className="text-red-500 ml-0.5">*</span>}
          </Label>

          {field.type === 'textarea' && (
            <textarea
              id={field.key}
              className="flex min-h-[60px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              value={metadata[field.key] || ''}
              onChange={e => handleFieldChange(field.key, e.target.value)}
              placeholder={field.placeholder || ''}
              required={field.required}
            />
          )}

          {field.type === 'text' && (
            <Input
              id={field.key}
              value={metadata[field.key] || ''}
              onChange={e => handleFieldChange(field.key, e.target.value)}
              placeholder={field.placeholder || ''}
              required={field.required}
            />
          )}

          {field.type === 'number' && (
            <Input
              id={field.key}
              type="number"
              value={metadata[field.key] || ''}
              onChange={e => handleFieldChange(field.key, e.target.value)}
              placeholder={field.placeholder || ''}
              required={field.required}
            />
          )}

          {field.type === 'date' && (
            <Input
              id={field.key}
              type="date"
              value={metadata[field.key] || ''}
              onChange={e => handleFieldChange(field.key, e.target.value)}
              required={field.required}
            />
          )}

          {field.type === 'select' && (
            <Select
              value={metadata[field.key] || ''}
              onValueChange={v => handleFieldChange(field.key, v)}
            >
              <SelectTrigger>
                <SelectValue placeholder={`Select ${field.label}`} />
              </SelectTrigger>
              <SelectContent>
                {field.options?.map(opt => (
                  <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}

          {field.type === 'checkbox' && (
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={metadata[field.key] || false}
                onChange={e => handleFieldChange(field.key, e.target.checked)}
                className="rounded border-gray-300"
              />
              <span className="text-sm">{field.label}</span>
            </label>
          )}
        </div>
      ))}
    </div>
  )
}
