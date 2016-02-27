
const PivotalAPi = require('./index')
const API = PivotalAPi(process.env.PIVOTAL_TOKEN)

API.getMyinfo(function (err, res) {
	if (err) {
		console.log('Error> ', err.message)
	}
	else {
		console.log(res.name)
	}
})

API.getMyinfo()
.then(res => console.log(res.name))
.fail(err => console.log(err))
