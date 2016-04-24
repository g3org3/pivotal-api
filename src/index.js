'use strict';

// Dependencies
import Needle from 'needle'
import Q from 'q'

// Declare internals
const Internals = {}

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
      },
      open_timeout: 60*1000
   }

   /*
    * Get My Info
    * - Gets pivotal tracker personal info of the token provided
    */
   this.getMyInfo = (callback) => {
      return Internals.apiCall('/me', callback)
   }

   /*
    * Get Accounts
    */
   this.getAccounts = (callback) => {
      return Internals.apiCall('/accounts', callback)
   }

   /*
    * Get Projects
    */
   this.getProjects = (callback) => {
      return Internals.apiCall('/projects', callback)
   }

   /*
    * Get Account Memberships
    */
   this.getAccountMemberships = (id, callback) => {
      return Internals.apiCall(`/accounts/${id}/memberships`, callback)
   }

   /*
    * Get Account Memberships
    */
   this.getAccountsMemberships = (accounts) => {

      let getAccounts = []
      for (var i = 0; i < accounts.length; i++) {
         getAccounts.push(this.getAccountMemberships(accounts[i].id))
      }
      return Q.all(getAccounts)
   }

   /*
    * Get Project Memberships
    */
   this.getProjectMemberships = (id, callback) => {
      return Internals.apiCall(`/projects/${id}/memberships`, callback)
   }

   /*
    * Get Project Memberships
    */
   this.getProjectsMemberships = (projects) => {

      let getProjects = []
      for (var i = 0; i < projects.length; i++) {
         getProjects.push(this.getProjectMemberships(projects[i].id))
      }
      return Q.all(getProjects)
   }

   this.getStories = (options, callback) => {
		const { month, year } = options.filter;
      const { before_year, before_month, after_year, after_month } = Internals.getMonthParams(month, year)

		let params = `&accepted_before=${before_year}-${before_month}-01T00:00:00.000Z`
		params += `&accepted_after=${after_year}-${after_month}-01T00:00:00.000Z`
		const url = `/projects/${options.projectId}/stories?with_state=accepted${params}`

		// return callback(null, {url})
      console.log(url)
		Internals.apiCall(url, function(err, stories) {
			if (err) return callback(err);
			return callback(null, { size:  stories.length, stories: stories })
		});
	}

   this.getStoriesCurrentState = (options, callback) => {
      const params = "with_state="+options.state;
      const url = `/projects/${options.projectId}/stories?${params}`
      Internals.apiCall(url, function(err, stories) {
			if (err) return callback(err);
			return callback(null, { size:  stories.length, stories: stories })
		});
   }

   this.getAllStories = () => {

   }

	/*
	 * Get Stories' Activities
	 */
	this.getStoryActivities = (projectId, stories) => {
		var getActivities = []

		for (var i = 0; i < stories.length; i++) {
			getActivities.push(this.getStoryActivity(projectId, stories[i].id))
		};

		return Q.all(getActivities)
	}

	/*
	 * Get Story's Activity
	 */
	this.getStoryActivity = (projectId, storyId, callback) => {

		const _url = `/projects/${projectId}/stories/${storyId}/activity`;
      return Internals.apiCall(_url, callback)
	}

   /*
    * Get Project Details
    */
   this.getProjectDetails = (id, callback) => {
      return Internals.apiCall(`/projects/${id}`, callback)
   }

   /*
    * General
    */
   this.call = (url, callback) => {
      return Internals.apiCall(url, callback)
   }
}

/*
 *
 */
Internals.apiCall = (url, callback) => {
   if (typeof callback == 'function') {
      return Internals._apiCall(url, callback)
   }
   else {
      return Internals._apiCallQ(url)
   }
}

/*
 * Api Call Main Method
 */
Internals._apiCall = (url, callback) => {

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
Internals._apiCallQ = (url, callback) => {

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

Internals.getMonthParams = (month, year) => {
   month = Number(month)
   year = Number(year)
   month++;

   let after_year, after_month, before_year, before_month;

   after_year = year;
   after_month = (month < 9)? '0'+month: month;

   // feb 2015 - dec 2015 - jan 2016
   month++;
   before_year = year;
   before_month = (month < 9)? '0'+month: month;


   if (month==13) {
      before_year = year+1;
      before_month = '01'
   }

   return { after_year, after_month, before_year, before_month }
}

module.exports = PivotalAPI;
