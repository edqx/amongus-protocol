import {
    AmongusClient,
    HatID,
    MasterServers,
    Game,
    PlayerClient
} from "../index.js"

const usernames = ["cutizzard", "sidesea", "usesure", "trippabs", "noveldim", "borummall", "blowspoke", "mownye", "plainsite", "taskcoven", "pabsbadly", "learnquit", "railwitty", "musicdesk", "voteentry", "bowerhome", "agosquod", "momvast", "tntpomach", "warghire", "cawncrowl", "centrough", "disneyrod", "ledcup", "tailwhirl", "impedepie", "tixtwang", "trackskin", "tosswide", "tripcouch"];

for (let i = 0; i < 5; i++) {
    (async () => {
        const client = new AmongusClient;

        const server = MasterServers.EU[0];

        await client.connect(server[0], server[1], "weakeyes");

        const game = await client.join(process.argv[2]);

        await game.awaitSpawns();

        game.me.setName("Kaby");
        game.me.setColour(Math.floor(Math.random() * 13));
        game.me.setHat(Math.floor(Math.random() * 90));

        const foxnews = await game.findPlayer("Fox News");

        foxnews.Player.CustomNetworkTransform.on("move", transform => {
            game.me.move(transform.position, transform.velocity);
        });

        game.on("start", () => {
            setTimeout(function () {
                for (let i = 0; i < game.me.tasks.length; i++) game.me.completeTask(i);
            }, 7500);
        });

        game.on("meeting", () => {
            game.me.chat("I'm pretty sure that these are the imposters: " + game.imposters.map(imposter => imposter.PlayerData.name).join(", "));

            setTimeout(function () {
                game.me.vote(game.imposters[Math.floor(Math.random() * game.imposters.length)]);
            }, (game.options.discussionTime + 5) * 1000);
        })
    })();
}