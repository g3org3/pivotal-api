## Pivotal-Tracker Api Module.

Interact with pivotal-tracker's api

## Add it to your project
```sh
$ npm i --save https://github.com/g3org3/pivotal-api
```

```javascript
  // Dependency
  const PivotalApi = require('pivotal-api')

  // User Token
  const Api = new PivotalApi(process.env.PIVOTAL_TOKEN)
```

## Api

+ getMyinfo
+ getProjects
+ getAccounts
+ getAccountMembership

## Get my info
```javascript
  Api.getMyinfo((err, info) => {
    if (err) console.log(err);
    else console.log(info);
  });

  // Or if you like promises
  Api.getMyinfo()
  .then(res => console.log(res.name) )
  .fail(err => console.log(err) );
```
