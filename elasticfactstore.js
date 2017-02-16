var elasticsearch = require('elasticsearch')
var config = require('./config.js')
var _ = require('lodash')

var ESFactStore = function () {

}

var getESClient = function () {
  var client = new elasticsearch.Client({
    host: config.elasticServer
  })
  return client
}

var convertFactsToOutputForm = function (facts) {
  return _.map(facts, convertESLine2OutputForm)
}

var convertESLine2OutputForm = function (line) {
  if (line) {
    var lineOut = line._source
    return lineOut
  }
  return null
}

ESFactStore.prototype.getByDate = function (date) {
  var allResults = []

  var getRemainingResults = function (results) {
    allResults = _.concat(allResults, results.hits.hits)
    return new Promise(function (resolve, reject) {
      if (results.hits.total > allResults.length) {
        getESClient().scroll({
          method: 'GET',
          scrollId: results._scroll_id,
          scroll: '30s'
        })
        .then((newResults) => { resolve(getRemainingResults(newResults)) })
      } else {
        resolve(allResults)
      }
    })
  }

  return new Promise(function (resolve, reject) {
    getESClient().search({
      index: config.elasticFactIndex,
      method: 'GET',
      body: {
        query: {
          bool: {
            must: {
              range: {
                ingestionDate: {
                  gte: date + '||/d',
                  lt: date + '||+1d/d'
                }
              }
            }
          }
        }
      },
      scroll: '30s'
    })
    .then(getRemainingResults)
    .then(function (facts) {
      console.log(facts.length)
      resolve(convertFactsToOutputForm(facts))
    })
    .catch(console.log)
  })
}

module.exports = ESFactStore
