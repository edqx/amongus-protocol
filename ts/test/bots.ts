import {
    AmongusClient,
    HatID,
    MasterServers,
    Game,
    PlayerClient
} from "../index.js"

for (let i = 0; i < 8; i++) {
    (async () => {
        const client = new AmongusClient({
            debug: false
        });

        const servers = MasterServers.EU[0];

        await client.connect("lolkode.gleeze.com", 22023, "weakeyes");

        const game = await client.join(process.argv[2]);

        await game.awaitSpawns();

        await game.me.setName(Math.random().toString(36).substr(2, 7));

        await game.me.chat("/report hacking anti 'being silly'");
    })();
}