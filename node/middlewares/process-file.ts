import { IncomingHttpHeaders } from 'http'
import { SpecificationRow } from '../interface/specification-row'
import { randomUUID } from 'crypto'
import {
  createSpecification,
  updateSpecification,
} from '../api/specifications-api'
import { retryRequest } from '../utils/retry-request'
import StorageClient from '../storage/storage-client'

const ROW_LIMIT = 100000
const RETRY_DELAY = 1000
const RETRY_ATTEMPTS = 3
const UPDATE_PROGRESS_INTERVAL_PERCENTAGE = 5

export async function processAPIRequest(
  sheet: any,
  headers: IncomingHttpHeaders,
  logger: any,
  storage: StorageClient
) {
  try {
    const callerHeader = headers['x-vtex-caller']

    if (!callerHeader) {
      logger.error('Caller not found in headers')
      throw new Error('Caller not found in headers')
    }

    const caller = callerHeader.toString()

    const uuid = randomUUID()
    const results: SpecificationRow[] = []

    const startTime = new Date().toString()

    storage.addValue({
      caller: caller.toString(),
      processId: uuid,
      progress: 0,
      results: results,
      date: startTime,
    })

    const sheetRows = sheet.usedRange().value()

    if (sheetRows.length === 0 || sheetRows.length > ROW_LIMIT) {
      logger.error(
        'Error processing API request: Empty sheet or exceeded row limit with length:',
        sheetRows.length
      )

      results.push({
        error:
          'Empty sheet or exceeded row limit with length: ' + sheetRows.length,
      })
      storage.updateProgress({
        caller: caller.toString(),
        processId: uuid,
        progress: 100,
        results: results,
        date: startTime,
      })

      throw new Error('Empty sheet or exceeded row limit')
    }

    const specificationRows = extractSpecificationRows(sheet)

    logger.log(`Processing data with rows length: ${specificationRows.length}`)
    console.log(`Processing rows`)
    console.log(specificationRows)

    let lastProgress = 0

    for (let i = 0; i < specificationRows.length; i++) {
      const specificationRow = specificationRows[i]
      const action = specificationRow.specificationId
        ? updateSpecification
        : createSpecification

      const result = await retryRequest(
        () => action(specificationRow, headers, logger),
        RETRY_ATTEMPTS,
        RETRY_DELAY
      )

      result.success
        ? results.push(specificationRow)
        : results.push({
            ...specificationRow,
            error: result.error,
          })

      const progress = Math.floor(((i + 1) / specificationRows.length) * 100)
      if (progress - lastProgress >= UPDATE_PROGRESS_INTERVAL_PERCENTAGE) {
        storage.updateProgress({
          caller: caller.toString(),
          processId: uuid,
          progress: progress,
          results: results,
          date: startTime,
        })
        lastProgress = progress
        logger.log(`Updated progress: ${progress}% for process ${uuid}`)
      }
    }
  } catch (error) {
    logger.error('Error processing API request:', error)
    throw error
  }
}

export function extractSpecificationRows(sheet: any): SpecificationRow[] {
  const rows: SpecificationRow[] = []
  sheet
    .usedRange()
    .value()
    .forEach((row: any[], rowIndex: number) => {
      if (rowIndex === 0 || row[0] === undefined) return // Skip header row

      const specificationRow: SpecificationRow = {
        skuId: row[0],
        specificationId: row[1],
        name: row[2]?.toString(),
        value: row[3]?.toString(),
        isVisible: row[4],
      }

      rows.push(specificationRow)
    })
  return rows
}
