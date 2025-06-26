import * as XLSX from 'xlsx'
import JSZip from 'jszip'
import { saveAs } from 'file-saver'

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms))

class FileProcessingService {
  async validateFile(file) {
    await delay(200)
    
    const validTypes = [
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-excel'
    ]
    
    const validExtensions = ['.xlsx', '.xls']
    const fileExtension = file.name.toLowerCase().slice(file.name.lastIndexOf('.'))
    
    if (!validTypes.includes(file.type) && !validExtensions.includes(fileExtension)) {
      throw new Error('Please upload a valid Excel file (.xlsx or .xls)')
    }
    
    if (file.size > 50 * 1024 * 1024) { // 50MB limit
      throw new Error('File size must be less than 50MB')
    }
    
    return true
  }

  async analyzeWorkbook(file) {
    await delay(300)
    
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      
      reader.onload = (e) => {
        try {
          const data = new Uint8Array(e.target.result)
          const workbook = XLSX.read(data, { type: 'array' })
          
          const worksheets = workbook.SheetNames.map((name, index) => {
            const sheet = workbook.Sheets[name]
            const range = XLSX.utils.decode_range(sheet['!ref'] || 'A1:A1')
            
            return {
              name,
              index,
              rowCount: range.e.r + 1,
              columnCount: range.e.c + 1,
              hasData: !!sheet['!ref']
            }
          })
          
          resolve({
            file: {
              Id: Date.now(),
              name: file.name,
              size: file.size,
              uploadTime: new Date().toISOString(),
              status: 'analyzed'
            },
            worksheets,
            workbook
          })
        } catch (error) {
          reject(new Error('Failed to read Excel file. Please ensure it is not corrupted.'))
        }
      }
      
      reader.onerror = () => {
        reject(new Error('Failed to read file'))
      }
      
      reader.readAsArrayBuffer(file)
    })
  }

  async processWorksheets(workbook, worksheets, onProgress) {
    await delay(500)
    
    const zip = new JSZip()
    const totalSheets = worksheets.length
    
    for (let i = 0; i < worksheets.length; i++) {
      const worksheet = worksheets[i]
      
      // Create new workbook with single sheet
      const newWorkbook = XLSX.utils.book_new()
      const sheet = workbook.Sheets[worksheet.name]
      
      XLSX.utils.book_append_sheet(newWorkbook, sheet, worksheet.name)
      
      // Generate Excel buffer
      const excelBuffer = XLSX.write(newWorkbook, {
        bookType: 'xlsx',
        type: 'array'
      })
      
      // Add to zip with clean filename
      const fileName = `${worksheet.name.replace(/[\/\\:*?"<>|]/g, '_')}.xlsx`
      zip.file(fileName, excelBuffer)
      
      // Update progress
      const progress = Math.round(((i + 1) / totalSheets) * 100)
      if (onProgress) {
        onProgress(progress)
      }
      
      await delay(100) // Small delay for progress visualization
    }
    
    return zip
  }

  async generateDownload(zip, originalFileName) {
    await delay(300)
    
    const zipBlob = await zip.generateAsync({ type: 'blob' })
    const baseName = originalFileName.replace(/\.[^/.]+$/, '')
    const zipFileName = `${baseName}_split_worksheets.zip`
    
    return {
      blob: zipBlob,
      fileName: zipFileName,
      size: zipBlob.size
    }
  }

  downloadFile(blob, fileName) {
    saveAs(blob, fileName)
  }
}

export default new FileProcessingService()