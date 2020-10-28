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

for (let i = 0; i < 9; i++) {
    (async () => {
        const server = MasterServers.NA[0];

        const client = new AmongusClient({
            debug: false
        });

        await client.connect(server[0], server[1], "weakeyes");

        const game = await client.join(process.argv[2]);
        game.me.setName(Math.random().toString().substr(2, 7));
        game.me.setHat(HatID.Plague);

        console.log("Joined game!");
    })();
}