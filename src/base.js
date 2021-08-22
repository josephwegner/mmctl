const {Command} = require('@oclif/command')
const debug = require('debug')('base')
const fs = require('fs-extra')
const path = require('path')

let userConfigToWrite = {}
let userConfig = null
const configProxy = {
  set: function (target, prop, value) {
    userConfigToWrite[prop] = value
    userConfig[prop] = value
    return true
  },
}

class Base extends Command {
  async init() {
    this.setFlags()
    await this.getConfig()

    if (this.requireAuth) {
      if (!this.isAuthenticated) {
        this.error('Not logged in. Please run `mmctl login`.')
        this.exit()
      }
    }
  }

  get isAuthenticated() {
    return Boolean(this.userConfig.authJWT)
  }

  async finally() {
    await this.saveConfig()
  }

  async getConfig() {
    if (userConfig === null) {
      try {
        const configValues = await fs.readJSON(path.join(this.config.configDir, 'config.json'))
        userConfig = Object.assign({}, userConfig, configValues)
      } catch (error) {
        debug('Could not open config file', error)
        userConfig = {}
      }
    }

    this.userConfig = new Proxy(userConfig, configProxy)
  }

  async saveConfig() {
    if (Object.keys(userConfigToWrite).length === 0) {
      return true
    }

    const configPath = path.join(this.config.configDir, 'config.json')
    let existingValues = {}
    try {
      existingValues = await fs.readJSON(configPath)
    } catch (error) {
      debug('Config file does not exist. Will attempt to create', error)
      const directoryExists = await fs.exists(this.config.configDir)
      if (!directoryExists) {
        await fs.mkdir(this.config.configDir, {recursive: true})
      }
    }

    await fs.writeJSON(configPath, Object.assign({}, existingValues, userConfigToWrite), {flag: 'w+'})
    userConfigToWrite = {}
  }

  setFlags() {
    this.flags = this.parse(this.constructor)
  }
}

module.exports = Base
