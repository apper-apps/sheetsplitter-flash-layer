import { Outlet } from 'react-router-dom'
import ApperIcon from '@/components/ApperIcon'

const Layout = () => {
  return (
    <div className="h-screen flex flex-col overflow-hidden">
      {/* Header */}
      <header className="flex-shrink-0 bg-white border-b border-surface-200 px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <div className="flex items-center space-x-3">
            <div className="bg-primary text-white p-2 rounded-lg">
              <ApperIcon name="FileSpreadsheet" size={24} />
            </div>
            <div>
              <h1 className="text-xl font-bold text-surface-900">SheetSplitter</h1>
              <p className="text-sm text-surface-600">Excel Worksheet Separator</p>
            </div>
          </div>
          <div className="hidden sm:block">
            <div className="bg-surface-50 px-3 py-1 rounded-full text-sm text-surface-600">
              v1.0.0
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto bg-surface-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Outlet />
        </div>
      </main>
    </div>
  )
}

export default Layout