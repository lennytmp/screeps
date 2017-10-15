# Screeps AI

## Setup

### Installing the required packages

Run the following to setup the enviornment in the working directory:

```bash
$ curl -o- https://raw.githubusercontent.com/creationix/nvm/v0.32.1/install.sh | bash
$ nvm ls-remote
$ nvm install lts/*
$ sudo apt-get install npm
$ npm install
```
**NOTE**: You may *optionally* install gulp globally with `npm install gulp -g`

### Set up your crededentials

Create a copy of `screeps.example.js` and call it `screeps.js`
**NOTE**: This contains your crededentials. Do not commit this at all costs! This is covered in the default `.gitignore`, so never remove it.

In the new file, change `email`, `password`, `branch`, `host`, `port` and `secure` to your liking.

## Building your code

To build, tree-shake & rollup your code run:
```bash
$ npm run build
```
(you can also use `gulp build` if you have it installed globally)

To build, tree-shake, rollup, and deploy, run:
```bash
$ npm run deploy
```
(you can also use `gulp push` if you have it installed globally)
