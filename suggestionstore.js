var mysql = require('mysql')
var config = require('./config.js')
var debug = require('debug')('suggestion')

var action = function (options) {
  return new Promise(function (resolve, reject) {
    if (options.action === 'desc') {
      resolve({
        label: { en: 'WFM MainStatements' },
        description: { en: 'Add main statments to publication items from WikiFactMine' },
        icon: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/50/WikiFactMine_terrible_logo.svg/200px-WikiFactMine_terrible_logo.svg.png'
      })
    } else if (options.action === 'tiles') {
      getTiles(resolve, reject, options.num)
    } else if (options.action === 'log_action') {
      logAction(resolve, reject, options.decision, options.tile, options.user)
    } else {
      reject(new Error('unknown action'))
    }
  })
}

function getConnection () {
  return mysql.createConnection({
    host: config.mysqlServer,
    user: config.mysqlUser,
    password: config.mysqlPass,
    database: config.mysqlDb
  })
}

function logAction (resolve, reject, decision, id, user) {
  var status
  if (decision === 'yes') {
    status = 'accepted'
  } else if (decision === 'no') {
    status = 'rejected'
  } else {
    reject(new Error('Decision must be yes or no'))
    return
  }
  if (!user) {
    reject(new Error('User must be set'))
    return
  }
  if (!Number.isInteger(parseInt(id))) {
    reject(new Error('tile must be an integer'))
    return
  }
  var connection = getConnection()
  var query = connection.query('UPDATE `suggestions` SET `DONE` = ?, `BYUSER` = ? WHERE ID = ?', [status, user, parseInt(id)], function (err, results) {
    connection.end()
    if (err) reject(err)
    else {
      resolve({status: results})
    }
  })
  debug('Executing SQL: ' + query.sql)
}

var getTiles = function (resolve, reject, number) {
  if (!Number.isInteger(Number(number))) {
    reject(new Error('number passed was not an integer'))
  }
  var connection = getConnection()
  var query = connection.query('select * from `suggestions` where `DONE` is null ORDER BY score DESC LIMIT ?', parseInt(number), function (err, results) {
    connection.end()
    if (err) reject(err)
    else {
      var response = { tiles: results.map(function (x) {
        return {
          id: x.ID,
          sections: [
            {type: 'item', q: x.PAPERID},
            {type: 'text', text: 'Is the main subject of the paper this: '},
            {type: 'item', q: x.MSID}
          ],
          controls: [
            {
              type: 'buttons',
              entries: [
                {
                  decision: 'yes',
                  label: 'Is Main Subject',
                  api_action: {
                    action: 'wbcreateclaim',
                    entity: x.PAPERID,
                    property: config.MainSubjectProperty,
                    snaktype: 'value',
                    value: '{"entity-type":"item","numeric-id":"' + x.MSID.slice(1) + '"}'
                  }
                },
                { type: 'white', decision: 'skip', label: 'Dunno' },
                { type: 'blue', decision: 'no', label: 'Nope' }
              ]
            }
          ]
        }
      }
    )}
      resolve(response)
    }
  })
  debug('Executing SQL: ' + query.sql)
}

module.exports.action = action
