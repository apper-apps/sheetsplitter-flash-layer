import { motion } from 'framer-motion'
import FileProcessor from '@/components/organisms/FileProcessor'
import ApperIcon from '@/components/ApperIcon'

const Home = () => {
  const features = [
    {
      icon: 'Upload',
      title: 'Easy Upload',
      description: 'Drag and drop or click to upload your Excel workbook'
    },
    {
      icon: 'Layers',
      title: 'Auto Detection',
      description: 'Automatically detects and lists all worksheets in your file'
    },
    {
      icon: 'Scissors',
      title: 'Smart Splitting',
      description: 'Splits each worksheet into its own Excel file while preserving formatting'
    },
    {
      icon: 'Archive',
      title: 'ZIP Download',
      description: 'Downloads all separated files in a convenient ZIP archive'
    }
  ]

  return (
    <div className="space-y-12">
      {/* Hero Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center space-y-6"
      >
        <div className="space-y-4">
          <h1 className="text-4xl md:text-5xl font-bold text-surface-900">
            Split Excel Worksheets
            <span className="block text-primary">Into Separate Files</span>
          </h1>
          <p className="text-xl text-surface-600 max-w-2xl mx-auto">
            Upload your multi-sheet Excel workbook and automatically split each worksheet 
            into individual Excel files. Download everything as a organized ZIP archive.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-12">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="bg-white rounded-lg border border-surface-200 p-6 text-center"
            >
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                <ApperIcon name={feature.icon} size={24} className="text-primary" />
              </div>
              <h3 className="font-medium text-surface-900 mb-2">{feature.title}</h3>
              <p className="text-sm text-surface-600">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Main File Processor */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
      >
        <FileProcessor />
      </motion.div>

      {/* Info Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.4 }}
        className="bg-surface-50 rounded-xl p-8"
      >
        <div className="max-w-3xl mx-auto text-center space-y-6">
          <h2 className="text-2xl font-bold text-surface-900">
            How It Works
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="space-y-3">
              <div className="w-10 h-10 bg-primary text-white rounded-full flex items-center justify-center mx-auto font-bold">
                1
              </div>
              <h3 className="font-medium text-surface-900">Upload File</h3>
              <p className="text-sm text-surface-600">
                Select your Excel workbook with multiple worksheets
              </p>
            </div>
            
            <div className="space-y-3">
              <div className="w-10 h-10 bg-primary text-white rounded-full flex items-center justify-center mx-auto font-bold">
                2
              </div>
              <h3 className="font-medium text-surface-900">Process</h3>
              <p className="text-sm text-surface-600">
                We automatically detect and split each worksheet
              </p>
            </div>
            
            <div className="space-y-3">
              <div className="w-10 h-10 bg-primary text-white rounded-full flex items-center justify-center mx-auto font-bold">
                3
              </div>
              <h3 className="font-medium text-surface-900">Download</h3>
              <p className="text-sm text-surface-600">
                Get a ZIP file with all worksheets as separate Excel files
              </p>
            </div>
          </div>
          
          <div className="border-t border-surface-200 pt-6 mt-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-sm text-surface-600">
              <div className="flex items-center justify-center space-x-2">
                <ApperIcon name="Shield" size={16} className="text-green-600" />
                <span>Secure Processing</span>
              </div>
              <div className="flex items-center justify-center space-x-2">
                <ApperIcon name="Zap" size={16} className="text-yellow-600" />
                <span>Fast & Efficient</span>
              </div>
              <div className="flex items-center justify-center space-x-2">
                <ApperIcon name="FileCheck" size={16} className="text-blue-600" />
                <span>Format Preserved</span>
              </div>
              <div className="flex items-center justify-center space-x-2">
                <ApperIcon name="Download" size={16} className="text-purple-600" />
                <span>Easy Download</span>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  )
}

export default Home