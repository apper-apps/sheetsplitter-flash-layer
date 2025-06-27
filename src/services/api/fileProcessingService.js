import * as XLSX from 'xlsx'
import JSZip from 'jszip'
import { saveAs } from 'file-saver'
import { jsPDF } from 'jspdf'
import 'jspdf-autotable'
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

async processWorksheets(workbook, selectedWorksheets, onProgress) {
    await delay(500)
    
    const zip = new JSZip()
    const totalSheets = selectedWorksheets.length
    
    for (let i = 0; i < selectedWorksheets.length; i++) {
      const worksheet = selectedWorksheets[i]
      
      // Get worksheet data with formatting
      const sheet = workbook.Sheets[worksheet.name]
      const jsonData = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: '', raw: false })
      
      // Extract cell formatting information
      const cellFormatting = this.extractCellFormatting(sheet)
      
      // Create PDF
      const pdf = new jsPDF('p', 'mm', 'a4')
      
      // Prepare table data with formatting
      const tableData = this.prepareTableData(jsonData, cellFormatting, sheet)
      
      if (tableData.body.length > 0) {
        // Generate table with preserved formatting
        pdf.autoTable({
          head: tableData.head.length > 0 ? [tableData.head] : undefined,
          body: tableData.body,
          startY: 10,
          styles: {
            fontSize: 9,
            cellPadding: 2,
            overflow: 'linebreak',
            halign: 'left'
          },
          headStyles: {
            fillColor: [240, 240, 240],
            textColor: [0, 0, 0],
            fontStyle: 'bold'
          },
          columnStyles: tableData.columnStyles,
          didParseCell: (data) => {
            // Apply cell-specific formatting
            const cellRef = XLSX.utils.encode_cell({ r: data.row.index, c: data.column.index })
            const formatting = cellFormatting[cellRef]
            
            if (formatting) {
              if (formatting.bold) {
                data.cell.styles.fontStyle = 'bold'
              }
              if (formatting.italic) {
                data.cell.styles.fontStyle = data.cell.styles.fontStyle === 'bold' ? 'bolditalic' : 'italic'
              }
              if (formatting.align) {
                data.cell.styles.halign = formatting.align
              }
              if (formatting.bgColor) {
                data.cell.styles.fillColor = formatting.bgColor
              }
              if (formatting.textColor) {
                data.cell.styles.textColor = formatting.textColor
              }
            }
          },
          margin: { top: 10, right: 10, bottom: 10, left: 10 },
          pageBreak: 'auto',
          showHead: tableData.head.length > 0
        })
      }
      
      // Generate PDF buffer
      const pdfBuffer = pdf.output('arraybuffer')
      
      // Add to zip with clean filename
      const fileName = `${worksheet.name.replace(/[\/\\:*?"<>|]/g, '_')}.pdf`
      zip.file(fileName, pdfBuffer)
      
      // Update progress
      const progress = Math.round(((i + 1) / totalSheets) * 100)
      if (onProgress) {
        onProgress(progress)
      }
      
      await delay(100) // Small delay for progress visualization
    }
    
    return zip
  }

  extractCellFormatting(sheet) {
    const formatting = {}
    
    // Extract formatting from each cell
    Object.keys(sheet).forEach(cellRef => {
      if (cellRef.startsWith('!')) return // Skip metadata
      
      const cell = sheet[cellRef]
      if (!cell) return
      
      const cellFormatting = {}
      
      // Extract alignment
      if (cell.s && cell.s.alignment) {
        const align = cell.s.alignment.horizontal
        if (align === 'center') cellFormatting.align = 'center'
        else if (align === 'right') cellFormatting.align = 'right'
        else cellFormatting.align = 'left'
      }
      
      // Extract font styling
      if (cell.s && cell.s.font) {
        if (cell.s.font.bold) cellFormatting.bold = true
        if (cell.s.font.italic) cellFormatting.italic = true
        if (cell.s.font.color && cell.s.font.color.rgb) {
          const rgb = cell.s.font.color.rgb
          cellFormatting.textColor = [
            parseInt(rgb.substr(2, 2), 16),
            parseInt(rgb.substr(4, 2), 16),
            parseInt(rgb.substr(6, 2), 16)
          ]
        }
      }
      
      // Extract background color
      if (cell.s && cell.s.fill && cell.s.fill.bgColor && cell.s.fill.bgColor.rgb) {
        const rgb = cell.s.fill.bgColor.rgb
        cellFormatting.bgColor = [
          parseInt(rgb.substr(2, 2), 16),
          parseInt(rgb.substr(4, 2), 16),
          parseInt(rgb.substr(6, 2), 16)
        ]
      }
      
      if (Object.keys(cellFormatting).length > 0) {
        formatting[cellRef] = cellFormatting
      }
    })
    
    return formatting
  }

  prepareTableData(jsonData, cellFormatting, sheet) {
    if (!jsonData || jsonData.length === 0) {
      return { head: [], body: [], columnStyles: {} }
    }
    
    // Calculate column widths based on content
    const columnWidths = {}
    const maxColumns = Math.max(...jsonData.map(row => row.length))
    
    for (let col = 0; col < maxColumns; col++) {
      let maxWidth = 20 // Minimum width
      for (let row = 0; row < jsonData.length; row++) {
        const cellValue = String(jsonData[row][col] || '')
        const estimatedWidth = Math.min(cellValue.length * 2.5, 60) // Max 60mm
        maxWidth = Math.max(maxWidth, estimatedWidth)
      }
      columnWidths[col] = { cellWidth: maxWidth }
    }
    
    // Determine if first row should be header
    const hasHeader = this.detectHeader(jsonData)
    
    let head = []
    let body = jsonData
    
    if (hasHeader && jsonData.length > 1) {
      head = jsonData[0].map(cell => String(cell || ''))
      body = jsonData.slice(1)
    }
    
    // Convert body to strings and handle empty cells
    body = body.map(row => 
      row.map(cell => String(cell || ''))
    )
    
    return {
      head,
      body,
      columnStyles: columnWidths
    }
  }

  detectHeader(jsonData) {
    if (!jsonData || jsonData.length < 2) return false
    
    const firstRow = jsonData[0]
    const secondRow = jsonData[1]
    
    // Simple heuristic: if first row has more text and second row has more numbers, likely header
    let textCount = 0
    let numberCount = 0
    
    firstRow.forEach(cell => {
      const str = String(cell || '')
      if (str && isNaN(str)) textCount++
    })
    
    secondRow.forEach(cell => {
      const str = String(cell || '')
      if (str && !isNaN(str)) numberCount++
    })
    
    return textCount > numberCount && textCount > 0
  }
async generateDownload(zip, originalFileName) {
    await delay(300)
    
    const zipBlob = await zip.generateAsync({ type: 'blob' })
    const baseName = originalFileName.replace(/\.[^/.]+$/, '')
    const zipFileName = `${baseName}_split_PDFs.zip`
    
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