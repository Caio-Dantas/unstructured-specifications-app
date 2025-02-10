import { IncomingHttpHeaders } from 'http'
import { SpecificationRow } from '../interface/specification-row'
import axios from 'axios'

export async function createSpecification(
  specification: SpecificationRow,
  headers: IncomingHttpHeaders,
  logger: any
) {
  await axios
    .post(
      `http://api.vtexcommercestable.com.br/api/catalog/pvt/stockkeepingunit/${specification.skuId}/attribute?an=${headers['x-vtex-account']}`,
      {
        SpecificationName: specification.name,
        SpecificationValue: specification.value,
        IsVisible: specification.isVisible,
      },
      {
        headers: {
          'x-vtex-caller': headers['x-vtex-caller'],
          'x-vtex-caller-role': headers['x-vtex-caller-role'],
          'Content-type': 'application/json',
          VtexIdclientAutCookie: headers['x-vtex-credential'],
        },
      }
    )
    .catch((error) => {
      logger.error(
        `Error creating specification ${specification.specificationId}:`,
        error.response.data
      )
      throw error
    })
}

export async function updateSpecification(
  specification: SpecificationRow,
  headers: IncomingHttpHeaders,
  logger: any
) {
  await axios
    .put(
      `http://api.vtexcommercestable.com.br/api/catalog/pvt/stockkeepingunit/${specification.skuId}/attribute/${specification.specificationId}?an=${headers['x-vtex-account']}`,
      {
        SpecificationName: specification.name,
        SpecificationValue: specification.value,
        IsVisible: specification.isVisible,
      },
      {
        headers: {
          'x-vtex-caller': headers['x-vtex-caller'],
          'x-vtex-caller-role': headers['x-vtex-caller-role'],
          'Content-type': 'application/json',
          VtexIdclientAutCookie: headers['x-vtex-credential'],
        },
      }
    )
    .catch((error) => {
      logger.error(
        `Error updating specification ${specification.specificationId}:`,
        error.response.data
      )
      throw error
    })
}
