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

    res.send('Welcome to the user endpoint.')
  })

  /* Our guild create endpoint */
  router.post('/get', (req, res) => {
    client.game.getUser(req.body.user)
      .then((user) => {
        res.json({ status: 'success', user })
      })
      .catch(e => {
        res.json({ status: 'error', reason: `${e}` })
      })
  })

  return router
}