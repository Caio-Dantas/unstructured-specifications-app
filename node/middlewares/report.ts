import axios from 'axios'
import { SpecificationExport } from '../interface/specification-export'
import { IncomingHttpHeaders } from 'http'

export async function generateReport(ctx: Context, next: () => Promise<any>) {
  const {
    clients: { janusClient: myJanusClient },
  } = ctx

  if (!ctx.request.headers['x-vtex-account'])
    return ctx.throw(400, 'Missing account or environment headers')
  const accountName = ctx.request.headers['x-vtex-account'].toString()

  const {
    vtex: {
      route: { params },
      logger,
    },
  } = ctx

  const { brandId } = params
  if (!brandId) {
    ctx.status = 400
    ctx.body = { message: 'Missing brandId parameter' }
    return
  }

  try {
    const response = await myJanusClient.getProductList(
      brandId.toString(),
      logger
    )

    if (!response) {
      ctx.status = 204
      ctx.body = {}
      return
    }

    const skuIDs: string[] = Object.values(
      response.data.data
    ).flat() as string[]

    const specificationsExport: SpecificationExport[] = []

    const specificationsPromises = skuIDs.map(async (skuID) => {
      const specifications = await getSpecificationsFromSkuID(
        accountName,
        skuID,
        ctx.request.headers,
        logger
      )

      if (specifications && specifications.length > 0) {
        specificationsExport.push(...specifications)
      }
    })

    await Promise.allSettled(specificationsPromises)

    ctx.status = 200
    ctx.body = specificationsExport
  } catch (error) {
    ctx.status = error.response ? error.response.status : 500
    ctx.body = { message: 'Error fetching brand list' }
  }

  await next()
}

async function getSpecificationsFromSkuID(
  accountName: string,
  skuID: string,
  headers: IncomingHttpHeaders,
  logger: any
) {
  try {
    const response = await axios.get(
      `http://api.vtexcommercestable.com.br/api/catalog/pvt/stockkeepingunit/${skuID}/attribute?an=${accountName}`,
      {
        headers: {
          'x-vtex-caller': headers['x-vtex-caller'],
          'x-vtex-caller-role': headers['x-vtex-caller-role'],
          'Content-type': 'application/json',
          VtexIdclientAutCookie: headers['x-vtex-credential'],
        },
      }
    )
    console.log(response.data)
    const res = response.data.map((spec: any) => ({
      skuId: spec.SkuId,
      specificationId: spec.Id,
      specificationName: spec.SpecificationName,
      specificationValue: spec.SpecificationValue,
      isVisible: spec.IsVisible,
    })) as SpecificationExport[]

    console.log(res)
    return res
  } catch (error) {
    logger.error('Error fetching specifications:', error)
    throw error
  }
}
