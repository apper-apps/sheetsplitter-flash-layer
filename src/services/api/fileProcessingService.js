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
    
    // Extract table-level formatting patterns
    const tableStyles = this.extractTableStyles(sheet)
    
    // Extract formatting from each cell
    Object.keys(sheet).forEach(cellRef => {
      if (cellRef.startsWith('!')) return // Skip metadata
      
      const cell = sheet[cellRef]
      if (!cell) return
      
      const cellFormatting = {}
      const cellCoords = XLSX.utils.decode_cell(cellRef)
      
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
        
        // Enhanced text color extraction
        const textColor = this.extractColor(cell.s.font.color)
        if (textColor) {
          cellFormatting.textColor = textColor
        }
      }
      
      // Enhanced background color extraction
      let bgColor = null
      if (cell.s && cell.s.fill) {
        // Try different fill color properties
        bgColor = this.extractColor(cell.s.fill.bgColor) || 
                 this.extractColor(cell.s.fill.fgColor) ||
                 this.extractColor(cell.s.fill.patternForegroundColor)
      }
      
      // Apply table-level banded row coloring if no explicit cell color
      if (!bgColor && tableStyles.bandedRows) {
        const isEvenRow = cellCoords.r % 2 === 0
        if (isEvenRow && tableStyles.evenRowColor) {
          bgColor = tableStyles.evenRowColor
        } else if (!isEvenRow && tableStyles.oddRowColor) {
          bgColor = tableStyles.oddRowColor
        }
      }
      
      // Apply table background color as fallback
      if (!bgColor && tableStyles.tableBackgroundColor) {
        bgColor = tableStyles.tableBackgroundColor
      }
      
      if (bgColor) {
        cellFormatting.bgColor = bgColor
      }
      
      if (Object.keys(cellFormatting).length > 0) {
        formatting[cellRef] = cellFormatting
      }
    })
    
    return formatting
  }

  extractTableStyles(sheet) {
    const styles = {
      bandedRows: false,
      evenRowColor: null,
      oddRowColor: null,
      tableBackgroundColor: null
    }
    
    // Detect banded rows by analyzing row patterns
    const cells = Object.keys(sheet).filter(ref => !ref.startsWith('!'))
    const rowGroups = {}
    
    cells.forEach(cellRef => {
      const coords = XLSX.utils.decode_cell(cellRef)
      if (!rowGroups[coords.r]) rowGroups[coords.r] = []
      rowGroups[coords.r].push(cellRef)
    })
    
    // Check for alternating row colors
    const rowColors = {}
    Object.keys(rowGroups).forEach(rowNum => {
      const row = parseInt(rowNum)
      const rowCells = rowGroups[row]
      
      // Get predominant background color for this row
      const colors = []
      rowCells.forEach(cellRef => {
        const cell = sheet[cellRef]
        if (cell && cell.s && cell.s.fill) {
          const color = this.extractColor(cell.s.fill.bgColor) || 
                       this.extractColor(cell.s.fill.fgColor)
          if (color) colors.push(color)
        }
      })
      
      if (colors.length > 0) {
        // Use most common color in row
        const colorCounts = {}
        colors.forEach(color => {
          const colorKey = color.join(',')
          colorCounts[colorKey] = (colorCounts[colorKey] || 0) + 1
        })
        
        const mostCommonColor = Object.keys(colorCounts).reduce((a, b) => 
          colorCounts[a] > colorCounts[b] ? a : b
        )
        rowColors[row] = mostCommonColor.split(',').map(Number)
      }
    })
    
    // Detect banded pattern
    const rowNums = Object.keys(rowColors).map(Number).sort((a, b) => a - b)
    if (rowNums.length >= 4) {
      let bandedPattern = true
      let evenColor = null
      let oddColor = null
      
      for (let i = 0; i < rowNums.length - 1; i++) {
        const currentRow = rowNums[i]
        const nextRow = rowNums[i + 1]
        
        if (nextRow - currentRow === 1) { // Consecutive rows
          const currentColor = rowColors[currentRow]
          const nextColor = rowColors[nextRow]
          
          if (currentRow % 2 === 0) {
            if (!evenColor) evenColor = currentColor
            if (!oddColor) oddColor = nextColor
          } else {
            if (!oddColor) oddColor = currentColor
            if (!evenColor) evenColor = nextColor
          }
          
          // Check if pattern holds
          const expectedEvenColor = evenColor ? evenColor.join(',') : null
          const expectedOddColor = oddColor ? oddColor.join(',') : null
          const actualCurrentColor = currentColor ? currentColor.join(',') : null
          const actualNextColor = nextColor ? nextColor.join(',') : null
          
          if (currentRow % 2 === 0) {
            if (actualCurrentColor !== expectedEvenColor || actualNextColor !== expectedOddColor) {
              bandedPattern = false
              break
            }
          } else {
            if (actualCurrentColor !== expectedOddColor || actualNextColor !== expectedEvenColor) {
              bandedPattern = false
              break
            }
          }
        }
      }
      
      if (bandedPattern && evenColor && oddColor) {
        styles.bandedRows = true
        styles.evenRowColor = evenColor
        styles.oddRowColor = oddColor
      }
    }
    
    return styles
  }

  extractColor(colorObj) {
    if (!colorObj) return null
    
    // Handle RGB color
    if (colorObj.rgb) {
      const rgb = colorObj.rgb.startsWith('#') ? colorObj.rgb.slice(1) : colorObj.rgb
      if (rgb.length === 6) {
        return [
          parseInt(rgb.substr(0, 2), 16),
          parseInt(rgb.substr(2, 2), 16),
          parseInt(rgb.substr(4, 2), 16)
        ]
      } else if (rgb.length === 8) {
        // ARGB format - skip alpha channel
        return [
          parseInt(rgb.substr(2, 2), 16),
          parseInt(rgb.substr(4, 2), 16),
          parseInt(rgb.substr(6, 2), 16)
        ]
      }
    }
    
    // Handle indexed colors (Excel's default palette)
    if (typeof colorObj.indexed === 'number') {
      const indexedColors = {
        0: [0, 0, 0],        // Black
        1: [255, 255, 255],  // White
        2: [255, 0, 0],      // Red
        3: [0, 255, 0],      // Green
        4: [0, 0, 255],      // Blue
        5: [255, 255, 0],    // Yellow
        6: [255, 0, 255],    // Magenta
        7: [0, 255, 255],    // Cyan
        8: [128, 0, 0],      // Dark Red
        9: [0, 128, 0],      // Dark Green
        10: [0, 0, 128],     // Dark Blue
        64: [128, 128, 128], // Gray 50%
        65: [192, 192, 192], // Gray 25%
        // Add more indexed colors as needed
      }
      return indexedColors[colorObj.indexed] || null
    }
    
    // Handle theme colors with tint
    if (typeof colorObj.theme === 'number') {
      const themeColors = {
        0: [255, 255, 255],  // Background 1
        1: [0, 0, 0],        // Text 1
        2: [238, 236, 225],  // Background 2
        3: [31, 73, 125],    // Text 2
        4: [79, 129, 189],   // Accent 1
        5: [192, 80, 77],    // Accent 2
        6: [155, 187, 89],   // Accent 3
        7: [128, 100, 162],  // Accent 4
        8: [75, 172, 198],   // Accent 5
        9: [247, 150, 70],   // Accent 6
      }
      
      let baseColor = themeColors[colorObj.theme]
      if (baseColor && colorObj.tint) {
        // Apply tint to theme color
        const tint = colorObj.tint
        baseColor = baseColor.map(channel => {
          if (tint < 0) {
            return Math.round(channel * (1 + tint))
          } else {
            return Math.round(channel * (1 - tint) + 255 * tint)
          }
        })
      }
      return baseColor || null
    }
    
    return null
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