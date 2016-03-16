'use strict';

var _regenerator = require('babel-runtime/regenerator');

var _regenerator2 = _interopRequireDefault(_regenerator);

var _asyncToGenerator2 = require('babel-runtime/helpers/asyncToGenerator');

var _asyncToGenerator3 = _interopRequireDefault(_asyncToGenerator2);

var _promise = require('babel-runtime/core-js/promise');

var _promise2 = _interopRequireDefault(_promise);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var spawn = require('child_process').spawn;
var Chart = require('cli-chart');

var runCommandAsync = function runCommandAsync(cmd, options) {
  cmd = spawn(cmd, options);
  return new _promise2.default(function (resolve, reject) {
    cmd.stdout.on('data', function (data) {
      resolve(data);
    });

    cmd.stderr.on('data', function (data) {
      reject(data);
    });

    cmd.on('close', function (code) {
      if (code !== 0) {
        throw new Error('run ', cmd, options, 'failed, Error Code: ', code);
      }
    });
  });
};

var getLineChanges = function getLineChanges(log) {
  var lines = log.split('\n');
  var len = lines.length - 1;

  var skipCommitTitle = /^\s\d+\sfile/;
  var isInsertion = /(\d+)\sinsertion/;
  var isDeletion = /(\d+)\sdeletion/;

  var sum = 0;
  var valueArray = [];
  for (var i = len - 1; i > 0; i--) {
    var line = lines[i];
    if (skipCommitTitle.test(line)) {
      var matchInsertion = line.match(isInsertion);
      var matchDeletion = line.match(isDeletion);
      if (matchInsertion) {
        sum = sum + parseInt(matchInsertion[1]);
      }
      if (matchDeletion) {
        sum = sum - parseInt(matchDeletion[1]);
      }
      valueArray.push(sum);
    }
  }
  return valueArray;
};

var plotChanges = function plotChanges(changes) {
  var chart = new Chart({
    xlabel: 'commit',
    ylabel: 'code lines',
    direction: 'y',
    width: changes.length * 2,
    height: 10,
    lmargin: 15,
    step: 2
  });

  for (var i = 0; i < changes.length; i++) {
    chart.addBar(parseInt(changes[i]));
  }

  chart.draw();
};

var main = function () {
  var ref = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee() {
    var log, changes;
    return _regenerator2.default.wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            _context.next = 2;
            return runCommandAsync('git', ['log', '--shortstat', '--oneline']);

          case 2:
            log = _context.sent;
            changes = getLineChanges(log.toString());

            plotChanges(changes);

          case 5:
          case 'end':
            return _context.stop();
        }
      }
    }, _callee, undefined);
  }));
  return function main() {
    return ref.apply(this, arguments);
  };
}();

(0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee2() {
  return _regenerator2.default.wrap(function _callee2$(_context2) {
    while (1) {
      switch (_context2.prev = _context2.next) {
        case 0:
          _context2.prev = 0;
          _context2.next = 3;
          return main();

        case 3:
          process.exit(0);
          _context2.next = 9;
          break;

        case 6:
          _context2.prev = 6;
          _context2.t0 = _context2['catch'](0);

          console.log(_context2.t0.stack);

        case 9:
        case 'end':
          return _context2.stop();
      }
    }
  }, _callee2, undefined, [[0, 6]]);
}))();
