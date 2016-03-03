
const PivotalAPi = require('./index')
const Api = PivotalAPi(process.env.PIVOTAL_TOKEN)
const Purdy = require('purdy')
const defaultErr = err => console.error(err)
const _ = require('lodash')
const Internals = {}

Internals.array2Object = (array, key) => {
	return _.reduce(array, (_u, obj) => {
		_u[obj[key]] = obj;
		return _u;
	}, {})
}

Internals.getProjects = () => {
	Api.getMyinfo()
	.then(me => {
		// Purdy(me)
		Internals.myId = me.id
		return Api.getAccounts()
	})
	.then(accounts => {

		// Purdy(_.map(accounts, (account) => {
		// 	return { id: account.id, name: account.name }
		// }))

		Internals.accounts = _.map(accounts, (account) => {
			return { id: account.id, name: account.name }
		})

		return Api.getAccountsMemberships(accounts)
	})
	.then(response => {

		for (var i = 0; i < response.length; i++) {

			response[i] = _.reduce(response[i], (_response, res) => {
				if (res.id == Internals.myId) {
					_response = {
						id: res.id,
						person: JSON.stringify(res.person),
						owner: res.owner,
						admin: res.admin,
						project_creator: res.project_creator
					}
				}
				return _response
			}, {})


			response[i].name = Internals.accounts[i].name
			response[i].accountId = Internals.accounts[i].id
		}
		response = Internals.array2Object(response, 'accountId')
		Internals.memberships = response;
		// Purdy(response)
		return Api.call('/projects')
	})
	.then(projects => {

		var validProjects = []
		for (var i = 0; i < projects.length; i++) {
			var membership = Internals.memberships[projects[i].account_id]
			if (membership && (membership.owner || membership.admin) ) {
				validProjects.push(projects[i])
			}
		}

		// Purdy(validProjects)
		return Api.getProjectsMemberships(validProjects)
	})
	.then(memberships => {
		Purdy(memberships)
	})
	.fail(defaultErr)
}

Internals.getProjects()
