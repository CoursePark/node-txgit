# node-txgit
Micro node app for listening to Transifex web hooks, automatically committing it to git and pushing to a remote.

[![Build Status](https://travis-ci.org/CoursePark/node-txgit.svg?branch=master)](https://travis-ci.org/CoursePark/node-txgit)
[![Dependency Status](https://david-dm.org/CoursePark/node-txgit.svg)](https://david-dm.org/CoursePark/node-txgit)
[![devDependency Status](https://david-dm.org/CoursePark/node-txgit/dev-status.svg)](https://david-dm.org/CoursePark/node-txgit#info=devDependencies)

# Running Locally

Server runs on port `8000` by default, but will use the port set
on the environment variable `PORT` if set.

1. Run `npm install` for the initial setup.
1. Run `npm start` to start the server.

# Tests

To execute all the tests, just run:

```
npm test
