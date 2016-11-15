var express = require('express')
var app = express()
var router = express.Router()
var factstore = require('./dummyfactstore')
var port = process.env.PORT || 8080;
var bodyParser = require( 'body-parser' )
var modRewrite = require('connect-modrewrite')



factStore = new factstore()
router.get('/date/:date', function(req, res) {
  factStore.getByDate(req.params.date)
  .then(function(facts) {
    res.json(facts)
  })
  .catch(function(err) {
    res.send(err)
  })
})

app.use(modRewrite([
  '^/wikifactmine-api(.*) /$1'
]))
app.use(bodyParser.json())
app.use(express.static('dist'))
app.use('/api', router)
app.use('/wikifactmine-api/api', router)
app.get('/', function (req, res) {
  res.sendFile(__dirname + '/dist/index.html')
});


app.listen(port)
