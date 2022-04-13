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

  /* Our guild create endpoint */
  router.post('/start', (req, res) => {
    client.game.warpStart(req.body.user)
      .then((user) => {
        res.json({ status: 'success', user })
      })
      .catch(e => {
        res.json({ status: 'error', reason: `${e}` })
      })
  })

  return router
}