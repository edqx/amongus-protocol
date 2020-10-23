import { AmongusClient, MasterServers } from "../index.js"
import { ColourID, SpawnID } from "../lib/constants/Enums.js";

const client = new AmongusClient({
    debug: true
});

const server = MasterServers.NA[0];

await client.connect(server[0], server[1], "weakeyes");

const game = await client.join(process.argv[2], {
    doSpawn: true
});

game.me.on("spawn", player => {
    game.me.setColour(ColourID.Blue);
    game.me.setName("weakeyes");

    game.me.chat("Hello");
});