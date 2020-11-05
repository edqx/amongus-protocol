import {
    AmongusClient,
    HatID,
    MasterServers,
    Game,
    PlayerClient
} from "../index.js"

for (let i = 0; i < 2; i++) {
    (async () => {
        const client = new AmongusClient;

        const server = MasterServers.EU[0];

        await client.connect(server[0], server[1], "weakeyes");

        const game = await client.join(process.argv[2]);

        await game.awaitSpawns();

        await game.me.setName("pooman2007");

        console.log(game.GameData.GameData.players);

        const josh = game.findPlayer("Avwrage");

        josh.Player.CustomNetworkTransform.on("move", transform => {
            game.me.move(transform.position, transform.velocity);
        });
    })();
}