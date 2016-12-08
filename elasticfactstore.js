var elasticsearch = require('elasticsearch')
var ESSanitize = require('elasticsearch-sanitize')
var _ = require('lodash')

var ESFactStore = function () {

}

var getESClient = function () {
  var client = new elasticsearch.Client({
    host: 'localhost:9200',
    log: 'trace'
  })
  return client
}

ESFactStore.prototype.getByDate = function (date) {
  return new Promise(function(resolve, reject) {
    //console.log('reading from file')
    console.log(date)
    getESClient().search({
      index: 'facts',
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
    .then(function (facts) {
      resolve(facts.hits.hits)
    })
  })
}

module.exports = ESFactStore
