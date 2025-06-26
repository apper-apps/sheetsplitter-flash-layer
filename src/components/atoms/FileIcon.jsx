import { motion } from 'framer-motion'
import ApperIcon from '@/components/ApperIcon'

const FileIcon = ({ 
  type = 'excel', 
  size = 'md',
  animated = false,
  className = '' 
}) => {
  const sizes = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16',
    xl: 'w-24 h-24'
  }
  
  const iconSizes = {
    sm: 16,
    md: 24,
    lg: 32,
    xl: 48
  }
  
  const baseClasses = `${sizes[size]} ${className} excel-icon flex items-center justify-center rounded-lg`
  
  const variants = {
    excel: 'bg-green-100 text-green-700 border border-green-200'
  }
  
  const animationProps = animated ? {
    initial: { scale: 0.8, opacity: 0 },
    animate: { scale: 1, opacity: 1 },
    transition: { duration: 0.3, ease: 'easeOut' }
  } : {}

  return (
    <motion.div
      className={`${baseClasses} ${variants[type]}`}
      {...animationProps}
    >
      <ApperIcon name="FileSpreadsheet" size={iconSizes[size]} />
    </motion.div>
  )
}

export default FileIcon