var express = require('express')
var app = express()
var router = express.Router()
var Factstore = require('./elasticfactstore')
var port = process.env.PORT || 8080
var bodyParser = require('body-parser')
var path = require('path')

var factStore = new Factstore()
router.get('/date/:date', function (req, res) {
  factStore.getByDate(req.params.date)
  .then(function (facts) {
    res.json(facts)
  })
  .catch(function (err) {
    res.send(err)
  })
})

// app.use(modRewrite([
//   '^/wikifactmine-api(.*) /$1'
// ]))
app.use(bodyParser.json())

// enable cors
app.use(function (req, res, next) {
  res.header('Access-Control-Allow-Origin', '*')
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept')
  next()
})

app.use('/api', router)
app.use('/wikifactmine-api/api', router)
app.get('/wikifactmine-api', function (req, res) {
  res.sendFile(path.join(__dirname, '/dist/index.html'))
})
app.get('/', function (req, res) {
  res.sendFile(path.join(__dirname, '/dist/index.html'))
})
app.use(express.static('dist'))
app.use('/wikifactmine-api/', express.static('dist'))

app.listen(port)
