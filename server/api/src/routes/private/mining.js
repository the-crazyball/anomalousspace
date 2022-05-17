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

    res.send('Welcome to the mining endpoint.')
  })

  /* Our guild create endpoint */
  router.post('/mine', (req, res) => {
    client.game.mine(req.body.user, req.body.blueprint)
      .then((sector) => {
        res.json({ status: 'success', result: sector })
      })
      .catch(e => {
        res.json({ status: 'error', reason: `${e}` })
      })
  })

  return router
}