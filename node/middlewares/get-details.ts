import StorageClient from '../storage/storage-client'
export async function getDetails(ctx: Context, next: () => Promise<any>) {
  const {
    vtex: {
      route: { params },
      logger,
    },
    clients: { storage },
  } = ctx
  const { id } = params

  if (!id) {
    ctx.status = 400
    ctx.body = { message: 'No id provided' }
    return
  }

  const storageClient = new StorageClient(storage, logger)
  const result = await storageClient.getValue(id.toString())

  console.log(result)

  ctx.status = 200
  ctx.body = result

  await next()
}
