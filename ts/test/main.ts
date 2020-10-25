import {
    AmongusClient,
    MasterServers,
    ColourID,
    PetID,
    HatID,
    SkinID,
    SpawnID
} from "../index.js"
import { PlayerClient } from "../lib/struct/PlayerClient.js";

const client = new AmongusClient({
    debug: false
});

const server = MasterServers.EU[0];

await client.connect(server[0], server[1], "weakeyes");

const game = await client.join(process.argv[2], {
    doSpawn: true
});

game.me.on("spawn", async player => {
    game.me.setColour(ColourID.Red);
    game.me.setName("strong eyes");

    game.on("setImposters", imposters => {
        
    });
});