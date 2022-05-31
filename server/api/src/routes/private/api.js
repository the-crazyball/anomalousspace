'use strict'

/**
 * Dependencies
 */
const express = require('express')
const router = express.Router()

module.exports = client => {
  /* Our main index endpoint */
  router.get('/', (req, res) => {
    res.send('Welcome to the API endpoint.')
  })

  router.post('/', (req, res) => {
      client.game[req.body.method](req.body)
      .then((result) => {
        res.json({ status: 'success', result })
      })
      .catch(e => {
        res.json({ status: 'error', reason: `${e}` })
      })
  })

  return router
}