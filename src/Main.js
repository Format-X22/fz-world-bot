const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const MongoClient = require('mongodb').MongoClient;
const port = process.env.FZ_PORT || 4000;
const ChatsController = require('./controllers/Chats');
const JoinController = require('./controllers/Join');
const ProfileController = require('./controllers/Profile');
const ReverseController = require('./controllers/Reverse');
const SearchController = require('./controllers/Search');
const AboutController = require('./controllers/About');
const UnregisteredController = require('./controllers/Unregistered');

class Main {
    constructor() {
        this._chatsController = new ChatsController();
        this._joinController = new JoinController();
        this._profileController = new ProfileController();
        this._reverseController = new ReverseController();
        this._searchController = new SearchController();
        this._aboutController = new AboutController();
        this._unregisteredController = new UnregisteredController();
    }

    async init() {
        await this._initDb();
        await this._initWeb();
        await this._initTelegram();
    }

    async _initDb() {
        const client = await MongoClient.connect(
            process.env.FZ_DB_PATH || 'mongodb://fz-world-mongo/'
        );

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

        app.get('/about', this._aboutController.getPage.bind(this._aboutController));

        app.get(
            '/unregistered',
            this._unregisteredController.getPage.bind(this._unregisteredController)
        );

        app.listen(port, () => console.log(`On port ${port}!`));
    }

    async _initTelegram() {
        // TODO -

        const TelegramBot = require('node-telegram-bot-api');

        const bot = new TelegramBot(process.env.FZ_BOT_KEY, { polling: true });

        bot.on('message', msg => {
            const chatId = msg.chat.id;

            /*const chatId = msg.chat.id;
            var user_profile = bot.getUserProfilePhotos(msg.from.id);
            user_profile.then(function (res) {
                var file_id = res.photos[0][0].file_id;
                var file = bot.getFile(file_id);
                file.then(function (result) {
                    var file_path = result.file_path;
                    var photo_url = `https://api.telegram.org/file/bot${process.env.FZ_BOT_KEY}/${file_path}`

                    console.log(photo_url);

                    //bot.sendMessage(chatId, photo_url);
                });
            });*/

            bot.sendGame(chatId, 'fzWorldBot');
        });

        bot.on('callback_query', function onCallbackQuery(callbackQuery) {
            bot.answerCallbackQuery(callbackQuery.id, {
                url: 'https://http://ec2-13-59-75-149.us-east-2.compute.amazonaws.com',
            });
        });
    }
}

module.exports = Main;
