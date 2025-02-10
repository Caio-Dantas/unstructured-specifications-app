import { MasterDataEntity } from '@vtex/clients/build/clients/masterData/MasterDataEntity'
import { StorageData } from 'caiodantasdemo.unstructured-specifications-app'

class StorageClient {
  private logger: any
  private masterdata: MasterDataEntity<StorageData>

  constructor(masterdata: MasterDataEntity<StorageData>, logger: any) {
    this.masterdata = masterdata
    this.logger = logger
  }

  updateProgress(data: StorageData): void {
    this.masterdata.update(data.processId.toString(), {
      ...data,
    })
  }

  addValue(data: StorageData): void {
    this.masterdata.saveOrUpdate({
      ...data,
      id: data.processId.toString(),
    })
  }

  async getValue(key: string): Promise<StorageData | undefined> {
    try {
      const response: StorageData = await this.masterdata.get(key, ['_all'])
      return response
    } catch (error) {
      this.logger.error(`Error fetching storage data by key ${key}: ${error}`)
      return undefined
    }
  }

  async getValuesByCaller(caller: string): Promise<StorageData[] | undefined> {
    try {
      const response: StorageData[] = await this.masterdata.search(
        {
          page: 1,
          pageSize: 100,
        },
        ['_all']
      )
      return response
    } catch (error) {
      this.logger.error(
        `Error fetching storage data by caller ${caller}: ${error}`
      )
      return undefined
    }
  }
}

export default StorageClient
