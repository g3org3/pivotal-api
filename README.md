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
  Api.getMyinfo((err, myInfo) => {
    if (err) console.log(err);
    else console.log(myInfo.name);
  });

  // Or if you like promises
  Api.getMyinfo()
  .then(res => console.log(res.name) )
  .fail(err => console.log(err) );
```

## Get Projects
```javascript
  Api.getProjects((err, projects) => {
    if (err) console.log(err);
    else console.log(projects);
  });

  // Or if you like promises
  Api.getMyinfo()
  .then(res => console.log(res) )
  .fail(err => console.log(err) );
```

## Get Accounts
```javascript
  Api.getAccounts((err, accounts) => {
    if (err) console.log(err);
    else console.log(projects);
  });

  // Or if you like promises
  Api.getAccounts()
  .then(res => console.log(res) )
  .fail(err => console.log(err) );
```

## Get Account's Memberships
```javascript
  Api.getAccountMemberships(account_id, (err, memberships) => {
    if (err) console.log(err);
    else console.log(memberships);
  });

  // Or if you like promises
  Api.getAccountMemberships(account_id)
  .then(res => console.log(res) )
  .fail(err => console.log(err) );
```

## Get Accounts' Memberships
```javascript
  // array of accounts with { id }
  // you could use the getAccounts response 
  // just with promises
  Api.getAccountsMemberships(accounts)
  .then(res => console.log(res) )
  .fail(err => console.log(err) );
```
