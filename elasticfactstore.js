var elasticsearch = require('elasticsearch')
var ESSanitize = require('elasticsearch-sanitize')
var config = require('./config.js')
var _ = require('lodash')

var ESFactStore = function () {

}

var getESClient = function () {
  var client = new elasticsearch.Client({
    host: config.elasticServer,
    log: 'trace'
  })
  return client
}

var convertFactsToOutputForm = function (facts) {
  return _.map(facts.hits.hits, convertESLine2OutputForm)
}

var convertESLine2OutputForm = function (line) {
  if (line) {
    var lineOut = line._source
    return lineOut
  }
  return null
}

ESFactStore.prototype.getByDate = function (date) {
  return new Promise(function(resolve, reject) {
    //console.log('reading from file')
    console.log(date)
    getESClient().search({
      index: config.elasticFactIndex,
      method: "GET",
        body: {
        query: {
          bool: {
            must: {
              range: {
                ingestionDate: {
                  gte: date+'||/d',
                  lt: date+'||+1d/d'
                }
              }
            }
          }
        }
      }
    })
    .then(function(facts) {
      resolve(convertFactsToOutputForm(facts))
    })
    .catch(console.log)
  })
}

module.exports = ESFactStore
