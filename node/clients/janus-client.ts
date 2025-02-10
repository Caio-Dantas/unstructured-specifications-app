import type { InstanceOptions, IOContext } from '@vtex/api'
import { JanusClient } from '@vtex/api'

export default class MyJanusClient extends JanusClient {
  constructor(ctx: IOContext, options?: InstanceOptions) {
    super(ctx, {
      ...options,
      headers: {
        Accept: 'application/json',
        VtexIdclientAutCookie: ctx.authToken ?? '',
        'x-vtex-user-agent': ctx.userAgent,
        ...options?.headers,
      },
    })
  }

  public getBrandList = async (logger: any) => {
    try {
      const response = await this.http.getRaw<any>(
        this.routes.brandList(),
        undefined
      )
      return response
    } catch (error) {
      logger.error(`Error fetching brand list: ${error}`)
      return null
    }
  }

  public getProductList = async (brandID: string, logger: any) => {
    try {
      const response = await this.http.getRaw<any>(
        this.routes.productListFromBrand(brandID),
        undefined
      )
      return response
    } catch (error) {
      logger.error(
        `Error fetching product list for brand ${brandID}: ${error}`
      )
      return null
    }
  }

  private get routes() {
    const base = '/api/catalog_system/pvt'

    return {
      brandList: () => `${base}/brand/list`,
      productListFromBrand: (brandID: string) =>
        `${base}/products/GetProductAndSkuIds?brandId=${brandID}`,
    }
  }
}
