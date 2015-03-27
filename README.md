![App Logo](https://raw.githubusercontent.com/CoursePark/node-txgit/master/app/media/logo-small.png) node-txgit
=========================
[![Build Status](https://travis-ci.org/CoursePark/node-txgit.svg?branch=master)](https://travis-ci.org/CoursePark/node-txgit)
[![Dependency Status](https://david-dm.org/CoursePark/node-txgit.svg)](https://david-dm.org/CoursePark/node-txgit)
[![devDependency Status](https://david-dm.org/CoursePark/node-txgit/dev-status.svg)](https://david-dm.org/CoursePark/node-txgit#info=devDependencies)

Micro node app for listening to Transifex web hooks, automatically committing it to git and pushing to a remote.

# Running on Heroku

First just deploy a free instance of the app on heroku using the button then just follow the steps below. 

[![Deploy](https://www.herokucdn.com/deploy/button.png)](https://heroku.com/deploy)

1. Set `GIT_REPO_URL` to the repo url. If credentials are required provide them via basic auth.
	- **NOTE:** If you place `{{TRANSIFEX_PROJECT}}` or `{{TRANSIFEX_RESOURCE}}` in the url they will be dynamically replaced with the return from Transifex.
		- For example: `https://username:password@github.com/{{TRANSIFEX_PROJECT}}/{{TRANSIFEX_RESOURCE}}`
1. Set `TRANSIFEX_USERNAME` and `TRANSIFEX_PASSWORD` so the app can pull down the translations needed.
1. Set `TRANSIFEX_FORMAT` to the language format you are expecting from Transifex.
1. Set `LOCALE_DIR` to the path relative to your repo where your want your locale files committed into.
1. Set `LOCALE_SOURCE` the source language name so we can ignore requests about it. We only want to save updates to translations.
1. Set `LOCALE_EXT` to be the the file extention used for the locale files that are created.
1. Set `GIT_NAME` and `GIT_EMAIL` which will be used when committing to the repo.

# Running Locally

Server runs on port `8000` by default, but will use the port set
on the environment variable `PORT` if set.

1. Run `npm install` for the initial setup.
1. Run `npm start` to start the server.

# Tests

To execute all the tests, just run:

```
npm test
```
