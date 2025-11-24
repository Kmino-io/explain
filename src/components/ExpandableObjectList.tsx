import { useState } from 'react'
import { ChevronDown, ChevronRight } from 'lucide-react'
import { ObjectChange } from '../types/transaction'

interface ExpandableObjectListProps {
  objects: ObjectChange[]
  title: string
  count: number
}

export function ExpandableObjectList({ objects, title, count: _count }: ExpandableObjectListProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  return (
    <div className="inline-block">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="inline-flex items-center gap-1 text-sui-blue font-semibold hover:text-blue-300 transition-colors underline decoration-dotted cursor-pointer"
      >
        {isExpanded ? (
          <ChevronDown className="w-4 h-4" />
        ) : (
          <ChevronRight className="w-4 h-4" />
        )}
        <span>{title}</span>
      </button>
      
      {isExpanded && (
        <div className="mt-2 ml-6 space-y-2 animate-in slide-in-from-top-2 duration-200">
          {objects.slice(0, 10).map((obj, index) => (
            <div key={index} className="p-3 bg-white/5 rounded-lg border border-white/10 text-sm">
              <div className="flex items-start justify-between gap-2 mb-1">
                <span className="text-purple-300 font-medium break-all">
                  {obj.objectType}
                </span>
              </div>
              <div className="space-y-1 text-xs text-gray-400">
                <p className="font-mono break-all">
                  <span className="text-gray-500">ID:</span> {obj.objectId}
                </p>
                {obj.version && (
                  <p>
                    <span className="text-gray-500">Version:</span> {obj.version}
                  </p>
                )}
                {obj.owner && (
                  <p className="break-all">
                    <span className="text-gray-500">Owner:</span> {obj.owner}
                  </p>
                )}
              </div>
            </div>
          ))}
          {objects.length > 10 && (
            <p className="text-xs text-gray-400 italic">
              ... and {objects.length - 10} more
            </p>
          )}
        </div>
      )}
    </div>
  )
}

