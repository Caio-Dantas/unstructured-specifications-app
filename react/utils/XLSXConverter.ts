import * as XLSX from 'xlsx'

export function generateXLSXFromData(data: any) {
  // Convert data to a worksheet
  const worksheet = XLSX.utils.json_to_sheet(data)

  // Create a workbook
  const workbook = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Report')

  // Export the workbook as a binary string
  const binaryString = XLSX.write(workbook, {
    bookType: 'xlsx',
    type: 'binary',
  })

  // Convert binary string to a Blob
  const blob = new Blob(
    [
      new Uint8Array(
        binaryString.split('').map((char: any) => char.charCodeAt(0))
      ),
    ],
    {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    }
  )

  // Create a URL for the Blob and trigger download
  const url = URL.createObjectURL(blob)

  return url
}
