import Busboy from 'busboy'
import fs from 'fs'
import XlsxPopulate from 'xlsx-populate'
import { IncomingHttpHeaders } from 'http'
import { processAPIRequest } from './process-file'
import { Context } from 'koa'
import StorageClient from '../storage/storage-client'

export async function receiveFile(ctx: Context, next: () => Promise<any>) {
  const {
    vtex: { logger },
    clients: { storage },
  } = ctx
  try {
    const headers = ctx.req.headers as IncomingHttpHeaders & {
      'content-type': string
    }
    if (!headers['content-type']) {
      throw new Error('Missing content-type header')
    }
    const busboy = new Busboy({ headers })

    busboy.on('file', (_fieldname, file, filename, _encoding, _mimetype) => {
      const tempFilePath = `/tmp/${filename}`
      const writeStream = fs.createWriteStream(tempFilePath)
      file.pipe(writeStream)

      file.on('error', (err) => {
        logger.error('File upload error:', err)
        ctx.status = 500
        ctx.body = { message: 'File upload error', error: err }
      })

      file.on('end', async () => {
        const workbook = await XlsxPopulate.fromFileAsync(tempFilePath)
        const sheet = workbook.sheet(0)

        const storageClient = new StorageClient(storage, logger)

        await processAPIRequest(
          sheet,
          ctx.request.headers,
          logger,
          storageClient
        )

        fs.unlinkSync(tempFilePath)
      })
    })

    busboy.on('finish', async () => {
      logger.log('File upload complete')

      ctx.body = {
        message: 'File received and processed successfully',
      }

      await next()
    })

    ctx.status = 200
    ctx.body = {
      message: 'File received',
    }

    ctx.req.pipe(busboy)
  } catch (error) {
    logger.error('Error processing file upload:', error)
    ctx.status = 500
    ctx.body = { message: 'Internal server error', error: error }
  }
}
