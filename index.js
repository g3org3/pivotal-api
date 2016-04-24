'use strict';

// Dependencies

var _needle = require('needle');

var _needle2 = _interopRequireDefault(_needle);

var _q = require('q');

var _q2 = _interopRequireDefault(_q);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// Declare internals
var Internals = {};

/*
 * Pivotal API module.
 * @param {string} _token pivotaltracker api token
 * @author George <7jagjag@gmail.com>
 */
function PivotalAPI(_token) {
   var _this = this;

   if (!(this instanceof PivotalAPI)) return new PivotalAPI(_token);
   if (typeof _token == 'undefined') throw new Error('No token provided');

   Internals.baseUrl = 'https://www.pivotaltracker.com/services/v5';
   Internals.options = {
      headers: {
         'X-TrackerToken': _token
      },
      open_timeout: 60 * 1000
   };

   /*
    * Get My Info
    * - Gets pivotal tracker personal info of the token provided
    */
   this.getMyInfo = function (callback) {
      return Internals.apiCall('/me', callback);
   };

   /*
    * Get Accounts
    */
   this.getAccounts = function (callback) {
      return Internals.apiCall('/accounts', callback);
   };

   /*
    * Get Projects
    */
   this.getProjects = function (callback) {
      return Internals.apiCall('/projects', callback);
   };

   /*
    * Get Account Memberships
    */
   this.getAccountMemberships = function (id, callback) {
      return Internals.apiCall('/accounts/' + id + '/memberships', callback);
   };

   /*
    * Get Account Memberships
    */
   this.getAccountsMemberships = function (accounts) {

      var getAccounts = [];
      for (var i = 0; i < accounts.length; i++) {
         getAccounts.push(_this.getAccountMemberships(accounts[i].id));
      }
      return _q2.default.all(getAccounts);
   };

   /*
    * Get Project Memberships
    */
   this.getProjectMemberships = function (id, callback) {
      return Internals.apiCall('/projects/' + id + '/memberships', callback);
   };

   /*
    * Get Project Memberships
    */
   this.getProjectsMemberships = function (projects) {

      var getProjects = [];
      for (var i = 0; i < projects.length; i++) {
         getProjects.push(_this.getProjectMemberships(projects[i].id));
      }
      return _q2.default.all(getProjects);
   };

   this.getStories = function (options, callback) {
      var _options$filter = options.filter;
      var month = _options$filter.month;
      var year = _options$filter.year;

      var _Internals$getMonthPa = Internals.getMonthParams(month, year);

      var before_year = _Internals$getMonthPa.before_year;
      var before_month = _Internals$getMonthPa.before_month;
      var after_year = _Internals$getMonthPa.after_year;
      var after_month = _Internals$getMonthPa.after_month;


      var params = '&accepted_before=' + before_year + '-' + before_month + '-01T00:00:00.000Z';
      params += '&accepted_after=' + after_year + '-' + after_month + '-01T00:00:00.000Z';
      var url = '/projects/' + options.projectId + '/stories?with_state=accepted' + params;

      // return callback(null, {url})
      console.log(url);
      Internals.apiCall(url, function (err, stories) {
         if (err) return callback(err);
         return callback(null, { size: stories.length, stories: stories });
      });
   };

   this.getStoriesCurrentState = function (options, callback) {
      var params = "with_state=" + options.state;
      var url = '/projects/' + options.projectId + '/stories?' + params;
      Internals.apiCall(url, function (err, stories) {
         if (err) return callback(err);
         return callback(null, { size: stories.length, stories: stories });
      });
   };

   this.getAllStories = function () {};

   /*
    * Get Stories' Activities
    */
   this.getStoryActivities = function (projectId, stories) {
      var getActivities = [];

      for (var i = 0; i < stories.length; i++) {
         getActivities.push(_this.getStoryActivity(projectId, stories[i].id));
      };

      return _q2.default.all(getActivities);
   };

   /*
    * Get Story's Activity
    */
   this.getStoryActivity = function (projectId, storyId, callback) {

      var _url = '/projects/' + projectId + '/stories/' + storyId + '/activity';
      return Internals.apiCall(_url, callback);
   };

   /*
    * Get Project Details
    */
   this.getProjectDetails = function (id, callback) {
      return Internals.apiCall('/projects/' + id, callback);
   };

   /*
    * General
    */
   this.call = function (url, callback) {
      return Internals.apiCall(url, callback);
   };
}

/*
 *
 */
Internals.apiCall = function (url, callback) {
   if (typeof callback == 'function') {
      return Internals._apiCall(url, callback);
   } else {
      return Internals._apiCallQ(url);
   }
};

/*
 * Api Call Main Method
 */
Internals._apiCall = function (url, callback) {

   _needle2.default.get(Internals.baseUrl + url, Internals.options, function (err, resp) {

      if (err) {
         return callback(err);
      }
      if (resp.statusCode != 200) {
         resp.body.statusCode = resp.statusCode;
         var error = new Error(JSON.stringify(resp.body, null, 4));
         error.statusCode = resp.statusCode;
         return callback(error);
      }
      return callback(null, resp.body);
   });
};

/*
 * Api Call with promise
 */
Internals._apiCallQ = function (url, callback) {

   var NeedleGetQ = _q2.default.denodeify(_needle2.default.get);
   var defer = _q2.default.defer();

   NeedleGetQ(Internals.baseUrl + url, Internals.options).then(function (results) {
      if (results[0].statusCode != 200) {
         results[0].body.statusCode = results[0].statusCode;
         var error = new Error(JSON.stringify(results[0].body, null, 4));
         error.statusCode = results[0].statusCode;
         defer.reject(error);
      } else {
         defer.resolve(results[0].body);
      }
   }).fail(function (err) {
      defer.reject(err);
   });
   return defer.promise;
};

Internals.getMonthParams = function (month, year) {
   month = Number(month);
   year = Number(year);
   month++;

   var after_year = void 0,
       after_month = void 0,
       before_year = void 0,
       before_month = void 0;

   after_year = year;
   after_month = month < 9 ? '0' + month : month;

   // feb 2015 - dec 2015 - jan 2016
   month++;
   before_year = year;
   before_month = month < 9 ? '0' + month : month;

   if (month == 13) {
      before_year = year + 1;
      before_month = '01';
   }

   return { after_year: after_year, after_month: after_month, before_year: before_year, before_month: before_month };
};

module.exports = PivotalAPI;