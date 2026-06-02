import { useRef, useState, type DragEvent, type ReactNode } from 'react'
import { FileText, Upload, X } from 'lucide-react'
import { Button } from '../ui/Button'
import type { UploadedFile } from '../../types/eventForm'

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

function toUploadedFile(file: File): UploadedFile {
  return {
    file,
    name: file.name,
    size: file.size,
    type: file.type,
  }
}

interface FileUploadBoxProps {
  label: string
  helperText?: string
  accept: string
  file: UploadedFile | null
  onChange: (file: UploadedFile | null) => void
  compact?: boolean
}

export function FileUploadBox({
  label,
  helperText,
  accept,
  file,
  onChange,
  compact = false,
}: FileUploadBoxProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [isDragging, setIsDragging] = useState(false)

  const handleFiles = (files: FileList | null) => {
    const selected = files?.[0]
    if (selected) onChange(toUploadedFile(selected))
  }

  const onDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault()
    setIsDragging(false)
    handleFiles(event.dataTransfer.files)
  }

  const acceptedTypes = accept
    .split(',')
    .filter((type) => type.startsWith('.'))
    .join(', ')

  return (
    <div className={compact ? 'space-y-2' : 'space-y-3'}>
      <div>
        <p className="text-sm font-medium text-gray-700">{label}</p>
        {helperText && <p className="mt-1 text-xs text-gray-500">{helperText}</p>}
      </div>

      {file ? (
        <div className="flex items-center gap-3 rounded-xl border border-gray-200 bg-gray-50 p-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-50 text-brand-600">
            <FileText className="h-5 w-5" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-gray-900">{file.name}</p>
            <p className="text-xs text-gray-500">{formatFileSize(file.size)}</p>
          </div>
          <button
            type="button"
            onClick={() => onChange(null)}
            className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-white hover:text-gray-600"
            aria-label="Remove file"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ) : (
        <div
          onDragOver={(event) => {
            event.preventDefault()
            setIsDragging(true)
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={onDrop}
          className={`rounded-xl border-2 border-dashed p-6 text-center transition-colors ${
            isDragging
              ? 'border-brand-400 bg-brand-50'
              : 'border-gray-200 bg-gray-50/50 hover:border-gray-300 hover:bg-gray-50'
          } ${compact ? 'p-4' : 'p-8'}`}
        >
          <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-sm">
            <Upload className="h-5 w-5 text-brand-600" />
          </div>
          <p className="text-sm font-medium text-gray-700">
            Drag and drop your file here
          </p>
          <p className="mt-1 text-xs text-gray-500">or</p>
          <Button
            variant="secondary"
            size="sm"
            className="mt-3"
            onClick={() => inputRef.current?.click()}
          >
            Browse files
          </Button>
          {acceptedTypes && (
            <p className="mt-3 text-xs text-gray-400">Accepted: {acceptedTypes}</p>
          )}
        </div>
      )}

      <input
        ref={inputRef}
        type="file"
        accept={accept}
        className="hidden"
        onChange={(event) => handleFiles(event.target.files)}
      />
    </div>
  )
}

interface RepeaterFieldProps {
  children: ReactNode
  onAdd: () => void
  addLabel: string
  secondaryAction?: ReactNode
}

export function RepeaterField({
  children,
  onAdd,
  addLabel,
  secondaryAction,
}: RepeaterFieldProps) {
  return (
    <div className="space-y-4">
      {children}
      <div className="flex flex-wrap gap-3">
        <Button variant="secondary" size="sm" onClick={onAdd}>
          {addLabel}
        </Button>
        {secondaryAction}
      </div>
    </div>
  )
}
