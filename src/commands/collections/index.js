const debug = require('debug')('collections')
const cli = require('cli-ux').cli
const Base = require('../../base.js')
const Macrometa = require('../../lib/mmapi.js')

class CollectionsCommand extends Base {
  async run() {
    let collections
    try {
      collections = await Macrometa.getCollections(this.userConfig)
    } catch (error) {
      debug(error)
      this.error(error.message)
    }

    collections = collections.filter(collection => {
      return !collection.isSystem
    }).map(collection => {
      let data = {
        name: collection.name,
        distribution: collection.isLocal ? 'Local' : 'Global',
        collectionStream: collection.hasStream ? 'Enabled' : 'Disabled',
        searchable: collection.searchEnabled ? 'Yes' : 'No',
      }

      switch (collection.collectionModel) {
      case 'DOC':
        data.dataModel = collection.type === 3 ? 'Graph Edge' : 'Document'
        break

      case 'DYNAMO':
        data.dataModel = 'Dynamo'
        break

      case 'KV':
        data.dataModel = 'Key/Value'
        break
      }

      return data
    })

    if (collections.length > 0) {
      cli.table(collections, {
        name: {header: 'Name'},
        dataModel: {header: 'Data Model'},
        distribution: {header: 'Distribution'},
        collectionStream: {header: 'Collection Stream'},
        searchable: {header: 'Searchable'},
      })
    } else {
      this.log('No collections found')
    }
  }
}

CollectionsCommand.description = 'List the collections in your account'
CollectionsCommand.prototype.requireAuth = true

module.exports = CollectionsCommand
