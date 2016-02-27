'use strict';

// Dependencies
const Needle = require('needle');
const Q = require('q');

// Declare internals
const Internals = {};

/*
 * Pivotal API module.
 * @param {string} _token pivotaltracker api token
 * @author George <7jagjag@gmail.com>
 */
function PivotalAPI (_token) {

	if( !(this instanceof PivotalAPI) ) return new PivotalAPI(_token)
	if (typeof _token == 'undefined') throw new Error('No token provided');


	Internals.baseUrl = 'https://www.pivotaltracker.com/services/v5'
	Internals.options = {
		headers: {
			'X-TrackerToken': _token
		}
		// open_timeout: 20000
	}

	/*
	 * Get My Info
	 * - Gets pivotal tracker personal info of the token provided
	 */
	this.getMyinfo = (callback) => {

		if (typeof callback == 'function')
         return Internals.apiCall('/me', callback)
      return Internals.apiCallQ('/me')
 	}
}


/*
 * Api Call Main Method
 */
Internals.apiCall = (url, callback) => {

	Needle.get(Internals.baseUrl+url, Internals.options, function(err, resp) {

		if (err) {
			return callback(err)
		}
		if (resp.statusCode != 200) {
			resp.body.statusCode = resp.statusCode
			var error = new Error(JSON.stringify(resp.body, null, 4))
			error.statusCode = resp.statusCode
			return callback(error)
		}
		return callback(null, resp.body)
	});
}

/*
 * Api Call with promise
 */
Internals.apiCallQ = (url, callback) => {

	var NeedleGetQ = Q.denodeify(Needle.get)
	var defer = Q.defer()

	NeedleGetQ(Internals.baseUrl+url, Internals.options)
	.then(results => {
		if (results[0].statusCode != 200) {
			results[0].body.statusCode = results[0].statusCode
			var error = new Error(JSON.stringify(results[0].body, null, 4))
			error.statusCode = results[0].statusCode
			defer.reject(error);
		}
		else {
			defer.resolve(results[0].body);
		}

	})
	.fail(err => {
		defer.reject(err)
	})
	return defer.promise;
}

module.exports = PivotalAPI;
