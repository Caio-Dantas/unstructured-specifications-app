export interface StorageInfo {
  progress: number
  id: string
  date: string
}

export interface StorageDataInternal {
  caller: string
  progress: number
  rows: SpecificationRow[]
}

export interface StorageDataReceived {
  progress: number
  id: string
  results: SpecificationRow[]
  caller: string
}

interface SpecificationRow {
  skuId: number
  id?: number
  name: string
  value: string
  isVisible: boolean
  error?: string
}
