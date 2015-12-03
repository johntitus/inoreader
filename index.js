var request = require('request');
var Promise = require('bluebird');

var apiEndpoint = 'https://www.inoreader.com/reader/api/0/';

function Inoreader(appId, appKey, appName) {
	this.appId = appId;
	this.appKey = appKey;
	this.appName = appName || '';

	this.headers = function() {
		var result = {
			AppId: this.appId,
			AppKey: this.appKey
		}
		if (this.appName) {
			result['User-Agent'] = this.appName;
		}
		if (this.token) {
			result['Authorization'] = 'GoogleLogin auth=' + this.token;
		}
		return result;
	};
};

Inoreader.prototype.login = function(email, password) {
	var self = this;
	return new Promise(function(resolve, reject) {

		request.post('https://www.inoreader.com/accounts/ClientLogin?Email=' + email + '&Passwd=' + password, function(err, res, body) {
			if (err) {
				reject(err);
			} else {
				var lines = body.split('\n');
				var authLine = lines[2];
				var token = authLine.split('=')[1];
				self.token = token;
				resolve();
			}
		});
	});
};

Inoreader.prototype.getUserInfo = function() {
	var self = this;
	return new Promise(function(resolve, reject) {
		var options = {
			uri: apiEndpoint + 'user-info',
			headers: self.headers()
		};

		request.get(options, function(err, res, body) {
			if (err) {
				reject(err);
			} else {
				if (res.statusCode !== 200) {
					reject(new Error(body));
				} else {
					resolve(JSON.parse(body));
				}
			}
		});
	});
};

Inoreader.prototype.streamContents = function(streamId, options) {

	var self = this;

	var uri = apiEndpoint + 'stream/contents/' + streamId;

	var qs = [];
	for (var p in options) {
		if (options.hasOwnProperty(p)) {
			qs.push(encodeURIComponent(p) + "=" + encodeURIComponent(options[p]));
		}
	}
	var query = qs.join('&');

	console.log(uri + '?' + query);

	return new Promise(function(resolve, reject) {
		var options = {
			uri: uri + '?' + query,
			headers: self.headers()
		};

		request.get(options, function(err, res, body) {
			if (err) {
				reject(err);
			} else {
				resolve(JSON.parse(body));
			}
		})
	});
};

Inoreader.prototype.markAllRead = function(stream, timeStamp){
	var self = this;
	var timeStamp = timestamp || Math.floor(Date.now() / 1000);
	return new Promise(function(resolve, reject) {
		var options = {
			uri: apiEndpoint + 'mark-all-as-read?s=' + stream + '&ts=' + timeStamp,
			headers: self.headers
		};

		request.post(options, function(err, res, body) {
			if (err) {
				reject(err);
			} else {
				if (res.statusCode !== 200) {
					reject(new Error(body));
				} else {
					resolve(body);
				}
			}
		})
	});
};

Inoreader.prototype.listSubscriptions = function() {
	var self = this;
	return new Promise(function(resolve, reject) {
		var options = {
			uri: apiEndpoint + 'subscription/list',
			headers: self.headers()
		};

		request.get(options, function(err, res, body) {
			if (err) {
				reject(err);
			} else {
				if (res.statusCode !== 200) {
					reject(new Error(body));
				} else {
					resolve(JSON.parse(body));
				}
			}
		})
	});
};

Inoreader.prototype.addSubscription = function(feedId) {
	var self = this;
	return new Promise(function(resolve, reject) {
		var options = {
			uri: apiEndpoint + 'subscription/quickadd?quickadd=' + encodeURIComponent(feedId),
			headers: self.headers()
		};

		request.post(options, function(err, res, body) {
			if (err) {
				reject(err);
			} else {
				if (res.statusCode !== 200) {
					reject(new Error(body));
				} else {
					resolve(JSON.parse(body));
				}
			}
		})
	});
};

module.exports = function(appId, appKey, appName) {
	return new Inoreader(appId, appKey, appName);
}