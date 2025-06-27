import { motion } from "framer-motion";
import React from "react";
import ApperIcon from "@/components/ApperIcon";
import FileProcessor from "@/components/organisms/FileProcessor";

const Home = () => {
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
          <h1 className="text-4xl md:text-5xl font-bold text-surface-900 leading-relaxed">
            Split Excel Worksheets
            <span className="block text-primary leading-relaxed">Into Separate Files</span>
          </h1>
          <p className="text-xl text-surface-600 max-w-2xl mx-auto">
            Upload your multi-sheet Excel workbook and automatically split each worksheet 
            into individual Excel files. Download everything as a organized ZIP archive.
          </p>
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
          <div className="space-y-4">
            <h2 className="text-3xl md:text-4xl font-bold text-surface-900 leading-relaxed" style={{ fontFamily: 'Verdana, sans-serif', fontSize: '2.125rem' }}>
              How It <span className="text-primary">Works</span>
            </h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">
            <div className="space-y-4">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto">
                <ApperIcon name="Upload" size={24} className="text-primary" />
              </div>
              <h3 className="font-medium text-surface-900">Upload File</h3>
              <p className="text-sm text-surface-600">
                Select your Excel workbook with multiple worksheets
              </p>
            </div>
            
            <div className="space-y-4">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto">
                <ApperIcon name="Settings" size={24} className="text-primary" />
              </div>
              <h3 className="font-medium text-surface-900">Process</h3>
              <p className="text-sm text-surface-600">
                We automatically detect and split each worksheet
              </p>
            </div>
            
            <div className="space-y-4">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto">
                <ApperIcon name="Download" size={24} className="text-primary" />
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
          
          {/* Privacy Statement */}
          <div className="border-t border-surface-200 pt-6 mt-8">
            <div className="flex items-center justify-center space-x-2 text-sm text-surface-600">
              <ApperIcon name="Shield" size={16} className="text-green-600" />
              <span>Your data never leaves the browser and is never stored, ensuring complete data safety.</span>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  )
}

export default Home