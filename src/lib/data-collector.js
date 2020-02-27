'use strict';

var braintreeWebVersion = require('braintree-web/client').VERSION;
var constants = require('../constants');
var analytics = require('./analytics');
var assets = require('@braintree/asset-loader');
var Promise = require('./promise');

function DataCollector(config) {
  this._config = config;
}

DataCollector.prototype.initialize = function () {
  var self = this;

  return Promise.resolve().then(function () {
    if (global.braintree && global.braintree.dataCollector) {
      return Promise.resolve();
    }

    return assets.loadScript({
      src: 'https://js.braintreegateway.com/web/' + braintreeWebVersion + '/js/data-collector.min.js',
      id: constants.DATA_COLLECTOR_SCRIPT_ID
    });
  }).then(function () {
    // TODO use auth instead
    return global.braintree.dataCollector.create(self._config);
  }).then(function (instance) {
    self._instance = instance;
  }).catch(function (err) {
    analytics.sendEvent('data-collector.setup-failed');
    // log the Data Collector setup error
    // but do not prevent Drop-in from loading
    self.log(err);
  });
};

DataCollector.prototype.log = function (message) {
  console.log(message); // eslint-disable-line no-console
};

// TODO convert to async
DataCollector.prototype.getDeviceData = function () {
  if (!this._instance) {
    return '';
  }

  // TODO use async method instead
  return this._instance.deviceData;
};

DataCollector.prototype.teardown = function () {
  if (!this._instance) {
    return Promise.resolve();
  }

  return this._instance.teardown();
};

module.exports = DataCollector;
