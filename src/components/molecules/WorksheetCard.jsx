import { motion } from 'framer-motion'
import ApperIcon from '@/components/ApperIcon'

const WorksheetCard = ({ 
  worksheet, 
  index,
  className = '' 
}) => {
  const formatNumber = (num) => {
    return new Intl.NumberFormat().format(num)
  }

  return (
    <motion.div
      className={`worksheet-card bg-white rounded-lg border border-surface-200 p-4 ${className}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.1 }}
    >
      <div className="flex items-start space-x-3">
        <div className="flex-shrink-0 bg-green-100 text-green-700 p-2 rounded-lg">
          <ApperIcon name="Sheet" size={20} />
        </div>
        
        <div className="flex-1 min-w-0">
          <h4 className="font-medium text-surface-900 truncate">
            {worksheet.name}
          </h4>
          
          <div className="mt-2 flex items-center space-x-4 text-sm text-surface-600">
            <div className="flex items-center space-x-1">
              <ApperIcon name="Rows" size={14} />
              <span>{formatNumber(worksheet.rowCount)} rows</span>
            </div>
            
            <div className="flex items-center space-x-1">
              <ApperIcon name="Columns" size={14} />
              <span>{formatNumber(worksheet.columnCount)} columns</span>
            </div>
          </div>
          
          {!worksheet.hasData && (
            <div className="mt-2">
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-warning/10 text-warning border border-warning/20">
                <ApperIcon name="AlertTriangle" size={12} className="mr-1" />
                Empty sheet
              </span>
            </div>
          )}
        </div>
        
        <div className="flex-shrink-0">
          <div className="bg-surface-100 text-surface-600 px-2 py-1 rounded text-xs font-medium">
            Sheet {worksheet.index + 1}
          </div>
        </div>
      </div>
    </motion.div>
  )
}

export default WorksheetCard