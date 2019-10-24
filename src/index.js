const Main = require('./Main');

const main = new Main();

main.init().catch(error => {
    console.error(error);
    process.exit(1);
});
