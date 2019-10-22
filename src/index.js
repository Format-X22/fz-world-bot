const Main = require('./Main');

const main = new Main();

main.init().catch(error => {
    console.error(error);
    process.exit(1);
});

return;

const TelegramBot = require('node-telegram-bot-api');

const bot = new TelegramBot(process.env.FZ_BOT_KEY, { polling: true });

bot.on('message', msg => {
    //const chatId = msg.chat.id;

    const chatId = msg.chat.id;
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
    });

    //bot.sendGame(chatId, 'fzWorldBot');
});

bot.on('callback_query', function onCallbackQuery(callbackQuery) {
    bot.answerCallbackQuery(callbackQuery.id, { url: 'https://fz-world-bot.herokuapp.com/' });
});
