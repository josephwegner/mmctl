const Base = require('../base.js')
const cli = require('cli-ux').cli
const Macrometa = require('../lib/mmapi.js')

class LoginCommand extends Base {
  async run() {
    const username = await cli.prompt('Username')
    const password = await cli.prompt('Password', {type: 'hide'})
    this.log()

    let credentials
    try {
      credentials = await Macrometa.getJWT(username, password)
      this.userConfig.authJWT = credentials.jwt
      this.userConfig.authTenant = credentials.tenant
      this.userConfig.authUsername = credentials.username
      this.log(`Logged in to ${credentials.tenant} as ${credentials.username}`)
    } catch (error) {
      this.error(error.message)
    }
  }
}

LoginCommand.description = 'Login with your Macrometa Credentials'

module.exports = LoginCommand
