import { extractSpecificationRows } from '../middlewares/process-file'

jest.mock('../storage/storage-client')
jest.mock('../api/specifications-api')

describe('extractSpecificationRows', () => {
  it('should extract specification rows correctly', () => {
    const mockSheet = {
      usedRange: () => ({
        value: () => [
          ['skuId', 'id', 'name', 'value', 'isVisible'], // header row
          [1, 1, 'Name1', 'Value1', true],
          [2, 2, 'Name2', 'Value2', false],
        ],
      }),
    }

    const expectedRows = [
      {
        skuId: 1,
        specificationId: 1,
        name: 'Name1',
        value: 'Value1',
        isVisible: true,
      },
      {
        skuId: 2,
        specificationId: 2,
        name: 'Name2',
        value: 'Value2',
        isVisible: false,
      },
    ]

    const result = extractSpecificationRows(mockSheet)
    expect(result).toEqual(expectedRows)
  })

  it('should skip header row and rows with undefined first cell', () => {
    const mockSheet = {
      usedRange: () => ({
        value: () => [
          ['skuId', 'id', 'name', 'value', 'isVisible'], // header row
          [undefined, 1, 'Name1', 'Value1', true],
          [2, 2, 'Name2', 'Value2', false],
        ],
      }),
    }

    const expectedRows = [
      {
        skuId: 2,
        specificationId: 2,
        name: 'Name2',
        value: 'Value2',
        isVisible: false,
      },
    ]

    const result = extractSpecificationRows(mockSheet)
    expect(result).toEqual(expectedRows)
  })

  it('should return an empty array if no data rows are present', () => {
    const mockSheet = {
      usedRange: () => ({
        value: () => [
          ['skuId', 'id', 'name', 'value', 'isVisible'], // header row
        ],
      }),
    }

    const result = extractSpecificationRows(mockSheet)
    expect(result).toEqual([])
  })
})
