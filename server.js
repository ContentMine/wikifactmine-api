var express = require('express')
var app = express()
var router = express.Router()
var factstore = require('./dummyfactstore')
var port = process.env.PORT || 8080;

factStore = new factstore()
router.get('/date/:date', (req, res) => {
  factStore.getByDate(req.params.date)
  .then((facts) => {
    res.json(facts)
  })
  .catch((err) => {
    res.send(err)
  })
})

app.use('/api', router)
app.listen(port)
