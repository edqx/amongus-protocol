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

const server = MasterServers.NA[0];

const client = new AmongusClient({
    debug: false
});

await client.connect(server[0], server[1], "weakeyes");

const game = await client.join(process.argv[2]);

game.me.on("spawn", () => {
    game.me.setName("strong eyes");
    game.me.setColour(ColourID.Black);
    game.me.setHat(HatID.Plague);
});