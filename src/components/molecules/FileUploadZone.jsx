import { useState, useRef } from 'react'
import { motion } from 'framer-motion'
import ApperIcon from '@/components/ApperIcon'
import Button from '@/components/atoms/Button'

const FileUploadZone = ({ 
  onFileSelect, 
  disabled = false,
  acceptedTypes = '.xlsx,.xls',
  maxSize = 50 * 1024 * 1024,
  className = '' 
}) => {
  const [dragOver, setDragOver] = useState(false)
  const fileInputRef = useRef(null)

  const handleDragOver = (e) => {
    e.preventDefault()
    if (!disabled) {
      setDragOver(true)
    }
  }

  const handleDragLeave = (e) => {
    e.preventDefault()
    setDragOver(false)
  }

  const handleDrop = (e) => {
    e.preventDefault()
    setDragOver(false)
    
    if (disabled) return
    
    const files = Array.from(e.dataTransfer.files)
    if (files.length > 0) {
      onFileSelect(files[0])
    }
  }

  const handleFileInput = (e) => {
    const files = Array.from(e.target.files)
    if (files.length > 0) {
      onFileSelect(files[0])
    }
    // Reset input to allow selecting the same file again
    e.target.value = ''
  }

  const formatFileSize = (bytes) => {
    const mb = bytes / (1024 * 1024)
    return `${mb.toFixed(0)}MB`
  }

  return (
    <div className={className}>
      <motion.div
        className={`
          file-drop-zone border-2 border-dashed rounded-xl p-8 text-center transition-all duration-200
          ${dragOver ? 'drag-over' : 'border-surface-300'}
          ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:border-primary hover:bg-surface-50'}
        `}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => !disabled && fileInputRef.current?.click()}
        whileHover={disabled ? {} : { scale: 1.01 }}
        whileTap={disabled ? {} : { scale: 0.99 }}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={acceptedTypes}
          onChange={handleFileInput}
          className="hidden"
          disabled={disabled}
        />
        
        <div className="space-y-4">
          <motion.div
            className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center"
            animate={dragOver ? { scale: 1.1 } : { scale: 1 }}
            transition={{ duration: 0.2 }}
          >
            <ApperIcon 
              name={dragOver ? "FileUp" : "Upload"} 
              size={32} 
              className={`${dragOver ? 'text-primary' : 'text-surface-400'} transition-colors`}
            />
          </motion.div>
          
          <div className="space-y-2">
            <h3 className="text-lg font-medium text-surface-900">
              {dragOver ? 'Drop your Excel file here' : 'Upload your Excel workbook'}
            </h3>
            <p className="text-surface-600">
              Drag and drop your file here, or click to browse
            </p>
          </div>
          
          <div className="space-y-2">
            <Button
              variant="outline"
              size="md"
              icon="FolderOpen"
              disabled={disabled}
              onClick={(e) => {
                e.stopPropagation()
                fileInputRef.current?.click()
              }}
            >
              Choose File
            </Button>
            
            <div className="text-sm text-surface-500 space-y-1">
              <p>Supported formats: .xlsx, .xls</p>
              <p>Maximum file size: {formatFileSize(maxSize)}</p>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  )
}

export default FileUploadZone