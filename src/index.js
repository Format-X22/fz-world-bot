const pug = require('pug');
const express = require('express');
const app = express();
const port = process.env.PORT || 4000;
const uiPath = __dirname + '/ui/pages/';

app.use(express.static(__dirname + '/static'));

app.get('/', profile);
app.get('/profile.html', profile);
app.get('/editProfile.html', editProfile);
app.get('/join.html', join);
app.get('/search.html', search);

app.listen(port, () => console.log(`On port ${port}!`));

function profile(req, res) {
    res.send(
        pug.renderFile(`${uiPath}profile.pug`, {
            name: 'Steve Jobs',
            nick: '@steveJobs',
            description: 'Играю в ФЗ 10 лет, люблю продукцию Apple!',
        })
    );
}

function editProfile(req, res) {
    res.send(
        pug.renderFile(page('editProfile'), {
            description: 'Играю в ФЗ 10 лет, люблю продукцию Apple!',
        })
    );
}

function join(req, res) {
    res.send(pug.renderFile(page('join'), {}));
}

function search(req, res) {
    res.send(pug.renderFile(page('search'), {}));
}

function unregistered(req, res) {
    res.send(pug.renderFile(page('unregistered'), {}));
}

function page(name) {
    return `${uiPath}${name}.pug`;
}

const TelegramBot = require('node-telegram-bot-api');

const bot = new TelegramBot(process.env.FZ_BOT_KEY, { polling: true });

bot.on('message', msg => {
    const chatId = msg.chat.id;

    // send a message to the chat acknowledging receipt of their message
    bot.sendGame(chatId, 'fzWorldBot');
});

bot.on('callback_query', function onCallbackQuery(callbackQuery) {
    bot.answerCallbackQuery(callbackQuery.id, { url: 'https://fz-world-bot.herokuapp.com/' });
});
