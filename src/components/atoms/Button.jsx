import { motion } from 'framer-motion'
import ApperIcon from '@/components/ApperIcon'

const Button = ({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  icon, 
  iconPosition = 'left',
  loading = false,
  disabled = false,
  className = '',
  onClick,
  ...props 
}) => {
  const baseClasses = 'inline-flex items-center justify-center font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed'
  
  const variants = {
    primary: 'bg-primary text-white hover:bg-blue-700 focus:ring-primary shadow-sm hover:shadow-md',
    secondary: 'bg-surface-200 text-surface-900 hover:bg-surface-300 focus:ring-surface-500',
    success: 'bg-success text-white hover:bg-green-600 focus:ring-success shadow-sm hover:shadow-md',
    outline: 'border-2 border-primary text-primary hover:bg-primary hover:text-white focus:ring-primary',
    ghost: 'text-surface-700 hover:bg-surface-100 focus:ring-surface-500'
  }
  
  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg'
  }
  
  const buttonClasses = `${baseClasses} ${variants[variant]} ${sizes[size]} ${className}`
  
  const hoverProps = disabled || loading ? {} : {
    whileHover: { scale: 1.02 },
    whileTap: { scale: 0.98 }
  }

  return (
    <motion.button
      className={buttonClasses}
      disabled={disabled || loading}
      onClick={onClick}
      {...hoverProps}
      {...props}
    >
      {loading && (
        <ApperIcon name="Loader2" size={16} className="animate-spin mr-2" />
      )}
      
      {!loading && icon && iconPosition === 'left' && (
        <ApperIcon name={icon} size={16} className="mr-2" />
      )}
      
      {children}
      
      {!loading && icon && iconPosition === 'right' && (
        <ApperIcon name={icon} size={16} className="ml-2" />
      )}
    </motion.button>
  )
}

export default Button