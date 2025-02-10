import StorageClient from '../storage/storage-client'

export async function getProgress(ctx: Context, next: () => Promise<any>) {
  const {
    vtex: { logger },
    clients: { storage },
  } = ctx

  const storageClient = new StorageClient(storage, logger)
  const caller = ctx.request.headers['x-vtex-caller']

  const results = await storageClient.getValuesByCaller(caller as string)

  ctx.status = 200
  ctx.body = results?.map(({ processId, progress, date }) => ({
    id: processId,
    progress,
    date: date.toString().split(' GMT')[0] + ' GMT+0',
  }))

  await next()
}
