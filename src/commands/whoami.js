const Base = require('../base.js')
const Macrometa = require('../lib/mmapi.js')

class WhoAmICommand extends Base {
  async run() {
    let user = await Macrometa.getUser(this.userConfig, this.userConfig.authUsername)

    this.log(`Logged in to ${user.tenant} as ${user.user} (${user.email})`)
  }
}

WhoAmICommand.description = 'Check the currently logged in user'
WhoAmICommand.prototype.requireAuth = true

module.exports = WhoAmICommand
