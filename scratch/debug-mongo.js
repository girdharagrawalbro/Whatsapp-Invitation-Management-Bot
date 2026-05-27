const MongoStore = require('connect-mongo');
console.log('MongoStore:', MongoStore);
console.log('Type of MongoStore.create:', typeof MongoStore.create);
if (MongoStore.default) {
    console.log('Type of MongoStore.default.create:', typeof MongoStore.default.create);
}
