import { IOClients } from '@vtex/api'
import { masterDataFor } from '@vtex/clients'

import { StorageData } from 'caiodantasdemo.unstructured-specifications-app'

import Status from './status'
import MyJanusClient from './janus-client'

// Extend the default IOClients implementation with our own custom clients.
export class Clients extends IOClients {
  public get status() {
    return this.getOrSet('status', Status)
  }

  public get janusClient() {
    return this.getOrSet('myJanusClient', MyJanusClient)
  }

  public get storage() {
    return this.getOrSet('entity', masterDataFor<StorageData>('storageData'))
  }
}
