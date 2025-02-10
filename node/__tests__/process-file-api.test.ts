import { processAPIRequest } from '../middlewares/process-file'
import { IncomingHttpHeaders } from 'http'
import Storage from '../storage/storage-client'

jest.mock('../storage/storage-client')
jest.mock('../api/specifications-api')

describe('processAPIRequest', () => {
  let mockSheet: any
  let mockHeaders: IncomingHttpHeaders
  let mockStorage: jest.Mocked<Storage>
  let loggerMock: any

  beforeEach(() => {
    mockSheet = {
      usedRange: jest.fn().mockReturnThis(),
      value: jest.fn(),
    }

    mockHeaders = {
      'x-vtex-caller': 'test-caller',
    }

    mockStorage = {
      addValue: jest.fn(),
      updateProgress: jest.fn(),
      getValue: jest.fn(),
      getValuesByCaller: jest.fn(),
    } as unknown as jest.Mocked<Storage>

    loggerMock = {
      error: jest.fn(),
      log: jest.fn(),
      warn: jest.fn(),
    } as unknown
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('should process API request successfully', async () => {
    mockSheet.value.mockReturnValue([
      ['skuId', 'id', 'name', 'value', 'isVisible'], // header row
      [1, 1, 'Name1', 'Value1', true],
      [2, 2, 'Name2', 'Value2', false],
    ])

    await processAPIRequest(mockSheet, mockHeaders, loggerMock, mockStorage)

    expect(mockStorage.addValue).toHaveBeenCalled()
    expect(mockStorage.updateProgress).toHaveBeenCalledWith(expect.any(Object))
  })

  it('should handle empty sheet', async () => {
    mockSheet.value.mockReturnValue([])

    await expect(
      processAPIRequest(mockSheet, mockHeaders, loggerMock, mockStorage)
    ).rejects.toThrow('Empty sheet or exceeded row limit')

    expect(mockStorage.updateProgress).toHaveBeenCalledWith(expect.any(Object))
  })

  it('should handle exceeded row limit', async () => {
    mockSheet.value.mockReturnValue(
      Array(100001).fill([1, 1, 'Name1', 'Value1', true])
    )

    await expect(
      processAPIRequest(mockSheet, mockHeaders, loggerMock, mockStorage)
    ).rejects.toThrow('Empty sheet or exceeded row limit')

    expect(mockStorage.updateProgress).toHaveBeenCalledWith(expect.any(Object))
  })

  it('should handle missing caller in headers', async () => {
    const headersWithoutCaller = {}

    await expect(
      processAPIRequest(
        mockSheet,
        headersWithoutCaller as IncomingHttpHeaders,
        loggerMock,
        mockStorage
      )
    ).rejects.toThrow('Caller not found in headers')
  })
})
