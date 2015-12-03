var request = require('request');
var Promise = require('bluebird');

var apiEndpoint = 'https://www.inoreader.com/reader/api/0/';

function Inoreader(appId, appKey, appName) {
	this.appId = appId;
	this.appKey = appKey;
	this.appName = appName || '';

	this.headers: {
		'User-Agent': this.appName,
		AppId: self.appId,
		AppKey: self.appKey,
		Authorization : 'GoogleLogin auth=' + self.token
	};
};

Inoreader.prototype.login = function(email, password) {
	var self = this;
	return new Promise(function(resolve,reject){

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

Inoreader.prototype.getUserInfo = function(callback) {

	var options = {
		uri: apiEndpoint + 'user-info',
		headers: {
			AppId: this.appId,
			AppKey: this.appKey
		}
	};

	request.get(options, function(err, res, body) {
		if (err) {
			console.log('got error back')
			console.log(err);
		} else {
			console.log(res.statusCode);
			console.log(res.headers);
			callback(body);
		}
	})
};

Inoreader.prototype.getItems = function(numberOfItems) {
	var numberOfItems = numberOfItems || 1000;
	var self = this;
	var nowTimeStamp = Math.floor(Date.now() / 1000);
	var startTime = nowTimeStamp - 600; // 10 minutes ago
	return new Promise(function(resolve,reject){
		var options = {
			uri: apiEndpoint + 'stream/contents/s=user/-/state/com.google/fresh?ot=' + startTime + '&n=' + numberOfItems,
			headers: self.headers
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

Inoreader.prototype.markAllRead = function() {
	var self = this;
	var timeStamp = Math.floor(Date.now() / 1000);
	return new Promise(function(resolve,reject){
		var options = {
			uri: apiEndpoint + 'mark-all-as-read?s=user/-/state/com.google/fresh&ts=' + timeStamp,
			headers: self.headers
		};

		request.post(options, function(err, res, body) {
			if (err) {
				reject(err);
			} else {
				if ( res.statusCode !== 200 ){
					reject( new Error(body) );
				} else {
					resolve(body);
				}
			}
		})
	});
};

Inoreader.prototype.markAsRead = function(ids) {
	var self = this;
	
	return new Promise(function(resolve,reject){
		var options = {
			uri: apiEndpoint + 'mark-all-as-read?ts=' + timeStamp,
			headers: self.headers
		};

		request.post(options, function(err, res, body) {
			if (err) {
				reject(err);
			} else {
				console.log(res.statusCode);
				//console.log(res.headers);
				console.log(body);
				resolve(body);
			}
		})
	});
};

Inoreader.prototype.listSubscriptions = function() {
	var self = this;
	return new Promise(function(resolve,reject){
		var options = {
			uri: apiEndpoint + 'subscription/list',
			headers: self.headers
		};

		request.get(options, function(err, res, body) {
			if (err) {
				reject(err);
			} else {
				if ( res.statusCode !== 200 ){
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
	return new Promise(function(resolve,reject){
		var options = {
			uri: apiEndpoint + 'subscription/quickadd?quickadd=' + encodeURIComponent(feedId),
			headers: self.headers
		};

		request.post(options, function(err, res, body) {
			if (err) {
				reject(err);
			} else {
				if ( res.statusCode !== 200 ){
					console.log(res.statusCode);
					console.log('*' + feedId + '*');
					console.log(body);
					reject(new Error(body));
				} else {
					resolve(JSON.parse(body));
				}
			}
		})
	});
};

module.exports = new Inoreader;