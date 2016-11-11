var express = require('express')
var app = express()
var router = express.Router()
var factstore = require('./dummyfactstore')
var port = process.env.PORT || 8080;
var bodyParser = require( 'body-parser' );
var subpath = express();
var swagger = require('swagger-node-express').createNew(subpath);


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


app.use(bodyParser());
app.use(express.static('dist'));
//app.use("/v1", subpath);
app.use('/api', router)
app.get('/', function (req, res) {
  res.sendFile(__dirname + '/dist/index.html');
});


app.listen(port)
