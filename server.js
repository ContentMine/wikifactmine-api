var express = require('express')
var app = express()
var router = express.Router()
var factstore = require('./dummyfactstore')
var port = process.env.PORT || 8080;
var bodyParser = require( 'body-parser' );
var subpath = express();
var swagger = require('swagger-node-express').createNew(subpath);


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


app.use(bodyParser.json());
app.use(express.static('dist'));
//app.use("/v1", subpath);
app.use('/api', router)
app.get('/', function (req, res) {
  res.sendFile(__dirname + '/dist/index.html');
});


app.listen(port)
