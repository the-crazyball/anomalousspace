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

    res.send('Welcome to the guild endpoint.')
  })

  /* Our guild create endpoint */
  router.post('/get', (req, res) => {
    client.game.getGuild(req.body.guild)
      .then((guild) => {
        res.json({ status: 'success', guild: { prefix: guild.prefix }})
      })
      .catch(e => {
        res.json({ status: 'error', reason: `${e}` })
      })
  })

  /* Our guild create endpoint */
  router.post('/delete', (req, res) => {
    client.game.deleteGuild(req.body.guild)
      .then(() => {
        res.json({ status: 'success' })
      })
      .catch(e => {
        res.json({ status: 'error', reason: `${e}` })
      })
  })

  /* Our guild create endpoint */
  router.post('/create', (req, res) => {
    client.engine.createGuild(req.body.guid)
      .then(() => {
        res.json({ status: 'success' })
      })
      .catch(e => {
        res.json({ status: 'error', reason: `${e}` })
      })
  })

  return router
}