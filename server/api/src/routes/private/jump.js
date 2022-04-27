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

    res.send('Welcome to the jump endpoint.')
  })

  /* Our warp to endpoint */
  router.post('/to', (req, res) => {
    client.game.jumpTo(req.body.user, req.body.blueprint)
      .then((result) => {
        res.json({ status: 'success', result: result })
      })
      .catch(e => {
        res.json({ status: 'error', reason: `${e}` })
      })
  })

  return router
}