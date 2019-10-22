const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const MongoClient = require('mongodb').MongoClient;
const port = process.env.PORT || 4000;
const ChatsController = require('./controllers/Chats');
const JoinController = require('./controllers/Join');
const ProfileController = require('./controllers/Profile');
const ReverseController = require('./controllers/Reverse');
const SearchController = require('./controllers/Search');
const UnregisteredController = require('./controllers/Unregistered');

class Main {
    constructor() {
        this._chatsController = new ChatsController();
        this._joinController = new JoinController();
        this._profileController = new ProfileController();
        this._reverseController = new ReverseController();
        this._searchController = new SearchController();
        this._unregisteredController = new UnregisteredController();
    }

    async init() {
        await this._initDb();
        await this._initWeb();
        await this._initTelegram();
    }

    async _initDb() {
        const client = await MongoClient.connect(process.env.FZ_DB_PATH || 'mongodb://localhost/');

        global.db = client.db(process.env.FZ_DB_NAME || 'admin');
    }

    async _initWeb() {
        app.use(express.static(__dirname + '/static'));
        app.use(bodyParser.urlencoded({ extended: false }));

        app.get('/', this._profileController.getProfilePage.bind(this._profileController));
        app.get('/profile', this._profileController.getProfilePage.bind(this._profileController));
        app.get('/editProfile', this._profileController.getEditPage.bind(this._profileController));
        app.post('/editProfile', this._profileController.edit.bind(this._profileController));

        app.get('/join', this._joinController.getPage.bind(this._joinController));
        app.post('/join', this._joinController.handleJoin.bind(this._joinController));

        app.get('/search', this._searchController.getPage.bind(this._searchController));
        app.post('/search', this._searchController.search.bind(this._searchController));

        app.get('/chats', this._chatsController.getPage.bind(this._chatsController));

        app.get('/reverse', this._reverseController.getPage.bind(this._reverseController));
        app.post('/reverse', this._reverseController.registerReverse.bind(this._reverseController));

        app.get(
            '/unregistered',
            this._unregisteredController.getPage.bind(this._unregisteredController)
        );

        app.listen(port, () => console.log(`On port ${port}!`));
    }

    async _initTelegram() {
        // TODO -
    }
}

module.exports = Main;
