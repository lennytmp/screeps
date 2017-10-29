# Screeps Private Server

## Setup on the new machine
```bash
$ curl -o- https://raw.githubusercontent.com/creationix/nvm/v0.32.1/install.sh | bash
$ nvm ls-remote
$ nvm install lts/*
$ npm install screeps
$ node ./node_modules/screeps/bin/screeps.js init # this will ask for your Steam API Key, it is expected
```

## Config
```javascript
mods.json
    {
      "mods": [
        "example-mods/tick-duration.js" // defines minimal tick duration
      ],
      "bots": {
        "simplebot": "node_modules/@screeps/simplebot/src",
        "vbobot": "/home/vbo/screepsbot/dist" // should point to screeps repository dist folder
      }
    }
```

## Running the server
```bash
$ node ./node_modules/screeps/bin/screeps.js start
```

## Server CLI interface
```bash
$ node ./node_modules/screeps/bin/screeps.js cli
```

### Generating a room
```bash
map.removeRoom("W1N7")
map.generateRoom("W1N7", {sources: 3, controller: true, keeperLairs: false})
```

### Joining your bot to the room
```bash
bots.spawn("vbobot", "W1N7", {username: "vbouser", x: 25, y: 25})
```

### Extracting info about your bot from the DB
```bash
storage.env.get(storage.env.keys.GAMETIME)
storage.db.users.findOne({username: "vbouser"})
storage.db["rooms.objects"].find({room: "W1N7"})
storage.db.users.findOne({username: "vbouser"}).then(U => storage.db["rooms.objects"].find({user: U._id}))
storage.db.users.findOne({username: "vbouser"}).then(U => storage.db["rooms.objects"].count({$and: [{user: U._id}, {type: 'creep'}]}))
storage.db.users.findOne({username: "vbouser"}).then(U => storage.db["rooms.objects"].findOne({$and: [{user: U._id}, {type: 'controller'}]}))
storage.db.users.findOne({username: "vbouser"}).then(U => storage.db["rooms.objects"].find({$and: [{user: U._id}, {type: 'constructionSite'}]}))
storage.db.users.findOne({username: "vbouser"}).then(U => storage.db["rooms.objects"].find({$and: [{user: U._id}, {type: 'extension'}]}))
```

### Bot console log
```bash
storage.db.users.findOne({username: "vbouser"}).then(U => storage.pubsub.subscribe("user:" + U._id + "/console", print))
```

### Reloading bot code
```bash
bots.reload("vbobot")
```

### Cleaning up
```bash
system.resetAllData()
```
