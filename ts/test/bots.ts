import {
    AmongusClient,
    HatID,
    MasterServers,
    Game,
    PlayerClient
} from "../index.js"

const usernames = ["cutizzard", "sidesea", "usesure", "trippabs", "noveldim", "borummall", "blowspoke", "mownye", "plainsite", "taskcoven", "pabsbadly", "learnquit", "railwitty", "musicdesk", "voteentry", "bowerhome", "agosquod", "momvast", "tntpomach", "warghire", "cawncrowl", "centrough", "disneyrod", "ledcup", "tailwhirl", "impedepie", "tixtwang", "trackskin", "tosswide", "tripcouch"];

const sleep = ms => new Promise(r => setTimeout(r, ms));

(async () => {
    for (let i = 0; i < 50; i++) {
        (async () => {
            const client = new AmongusClient;

            const server = MasterServers.EU[0];

            await client.connect("86.126.96.243", 22023, "weakeyes");

            const game = await client.join(process.argv[2]);

            await game.awaitSpawns();

            game.host.Player.CustomNetworkTransform.on("move", transform => {
                game.me.move(transform.position, transform.velocity);
            });
        })();

        await sleep(500);
    }
})();