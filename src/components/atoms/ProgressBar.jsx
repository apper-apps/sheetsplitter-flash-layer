import { motion } from 'framer-motion'

const ProgressBar = ({ 
  progress = 0, 
  stages = [],
  currentStage = 0,
  showPercentage = true,
  className = '' 
}) => {
  if (stages.length > 0) {
    return (
      <div className={`w-full ${className}`}>
        <div className="flex justify-between mb-2">
          {stages.map((stage, index) => (
            <div
              key={index}
              className={`text-sm font-medium transition-colors duration-300 ${
                index <= currentStage ? 'text-primary' : 'text-surface-400'
              }`}
            >
              {stage}
            </div>
          ))}
        </div>
        <div className="flex space-x-1">
          {stages.map((_, index) => (
            <div
              key={index}
              className="flex-1 h-2 bg-surface-200 rounded-full overflow-hidden"
            >
              <motion.div
                className={`h-full progress-segment ${
                  index < currentStage ? 'completed' : 
                  index === currentStage ? 'active' : ''
                }`}
                initial={{ width: 0 }}
                animate={{ 
                  width: index < currentStage ? '100%' :
                         index === currentStage ? `${progress}%` : '0%'
                }}
                transition={{ duration: 0.5, ease: 'easeOut' }}
              />
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className={`w-full ${className}`}>
      {showPercentage && (
        <div className="flex justify-between mb-2">
          <span className="text-sm font-medium text-surface-700">Progress</span>
          <span className="text-sm font-medium text-primary">{progress}%</span>
        </div>
      )}
      <div className="w-full bg-surface-200 rounded-full h-2 overflow-hidden">
        <motion.div
          className="h-full bg-gradient-to-r from-primary to-blue-600 rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
        />
      </div>
    </div>
  )
}

export default ProgressBar