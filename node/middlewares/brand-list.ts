export async function getBrands(ctx: Context, next: () => Promise<any>) {
  const {
    clients: { janusClient: myJanusClient },
    vtex: { logger },
  } = ctx

  if (!ctx.request.headers['x-vtex-account'])
    return ctx.throw(400, 'Missing account headers')

  try {
    const response = await myJanusClient.getBrandList(logger)
    if (!response) {
      ctx.status = 204
      ctx.body = {}
      return
    }
    ctx.status = 200
    ctx.body = response.data
  } catch (error) {
    ctx.status = error.response ? error.response.status : 500
    ctx.body = { message: 'Error fetching brand list' }
  }

  await next()
}
