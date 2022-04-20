'use strict'

/**
 * Dependencies
 */
const express = require('express')
const router = express.Router()

module.exports = client => {
  /* Our main index endpoint */
  router.get('/', (req, res) => {
    // filterXSS('string')  manual xss filtering

    res.send('Welcome to the warp endpoint.')
  })

  /* Our warp start endpoint */
  router.post('/start', (req, res) => {
    client.game.warpStart(req.body.user)
      .then((user) => {
        res.json({ status: 'success', user })
      })
      .catch(e => {
        res.json({ status: 'error', reason: `${e}` })
      })
  })

  /* Our warp to endpoint */
  router.post('/to', (req, res) => {
    client.game.warpTo(req.body.user, req.body.blueprint)
      .then((result) => {
        res.json({ status: 'success', result: result })
      })
      .catch(e => {
        res.json({ status: 'error', reason: `${e}` })
      })
  })

  return router
}