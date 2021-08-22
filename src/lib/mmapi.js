const debug = require('debug')('node-fetch')
const fetch = require('node-fetch')

const BASE_URL = 'https://api-gdn.paas.macrometa.io/'

function wrap(opts) {
  let values = Object.assign({}, opts || {})
  values.headers = values.headers || {}

  values.headers['Content-Type'] = 'application/json'

  return values
}

function wrapAuth(config, opts) {
  let wrapped = wrap(opts || {})
  wrapped.headers.Authorization = `Bearer ${config.authJWT}`
  return wrapped
}

module.exports = {
  getJWT: async function (username, password) {
    let resp = await fetch(BASE_URL + '_open/auth', wrap({
      method: 'POST',
      body: JSON.stringify({
        email: username,
        password: password,
      }),
    }))

    switch (resp.status) {
    case 401:
      throw new Error('Invalid credentials provided.')

    case 429:
      throw new Error('Too many login attempts.')

    default:
      var body
      try {
        body = await resp.json()
      } catch (error) {
        debug(error)
        throw new Error('Could not communicate with Macrometa API.')
      }

      if (body.error) {
        debug(resp.status, body)
        throw new Error('Could not communicate with Macrometa API.')
      } else {
        return body
      }
    }
  },

  getCollections: async function (config) {
    let resp = await fetch(BASE_URL + '_fabric/_system/_api/collection', wrapAuth(config))

    switch (resp.status) {
    case 401:
      throw new Error('No access to _system fabric.')

    default:
      var body
      try {
        body = await resp.json()
      } catch (error) {
        debug(error)
        throw new Error('Could not communicate with Macrometa API.')
      }

      return body.result
    }
  },

  getUser: async function (config, username) {
    let resp = await fetch(BASE_URL + `_fabric/_system/_api/user/${username}`, wrapAuth(config))

    switch (resp.status) {
    case 401:
      throw new Error('No access to _system fabric.')

    case 403:
      throw new Error('No system access. Please try logging in again (mmctl login).')

    default:
      var body
      try {
        body = await resp.json()
      } catch (error) {
        debug(error)
        throw new Error('Could not communicate with Macrometa API.')
      }

      return body
    }
  },
}
