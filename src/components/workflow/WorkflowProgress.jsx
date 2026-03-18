import { PROJECT_STATUS, PROJECT_STATUS_ORDER } from '@/lib/constants'
import { Check, SkipForward } from 'lucide-react'

export default function WorkflowProgress({ currentStatus, skippedSteps = [] }) {
  const currentIndex = PROJECT_STATUS_ORDER.indexOf(currentStatus)

  return (
    <div className="w-full overflow-x-auto">
      <div className="flex items-center min-w-[700px] px-4 py-3">
        {PROJECT_STATUS_ORDER.map((status, index) => {
          const info = PROJECT_STATUS[status]
          const isCompleted = index < currentIndex
          const isCurrent = index === currentIndex
          const isSkipped = skippedSteps.includes(status)
          const isOptional = status === 'owner_review'

          return (
            <div key={status} className="flex items-center flex-1 last:flex-none">
              {/* Step circle + label */}
              <div className="flex flex-col items-center gap-1 min-w-[60px]">
                <div
                  className={`
                    w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold transition-all
                    ${isCompleted
                      ? 'bg-[#FDB813] text-white'
                      : isCurrent
                        ? 'bg-[#13294B] text-white ring-4 ring-[#13294B]/20'
                        : isSkipped
                          ? 'bg-gray-200 text-gray-400 line-through'
                          : 'bg-[#EBE7E3] text-gray-500'
                    }
                    ${isOptional && !isCompleted && !isCurrent ? 'border-2 border-dashed border-gray-300 bg-transparent' : ''}
                  `}
                >
                  {isCompleted ? (
                    <Check className="h-4 w-4" />
                  ) : isSkipped ? (
                    <SkipForward className="h-3 w-3" />
                  ) : (
                    info.step
                  )}
                </div>
                <span
                  className={`text-[10px] text-center leading-tight max-w-[70px] ${
                    isCurrent ? 'font-bold text-[#13294B]'
                      : isCompleted ? 'text-[#946d00] font-medium'
                        : 'text-gray-400'
                  }`}
                >
                  {info.label}
                </span>
              </div>

              {/* Connector line */}
              {index < PROJECT_STATUS_ORDER.length - 1 && (
                <div
                  className={`flex-1 h-0.5 mx-1 ${
                    index < currentIndex ? 'bg-[#FDB813]' : 'bg-[#EBE7E3]'
                  }`}
                />
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
