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

const server = MasterServers.EU[0];

const client = new AmongusClient({
    debug: true
});
await client.connect(server[0], server[1], "weakeyes");

const game = await client.join(process.argv[2]);

game.me.on("spawn", () => {
    game.me.setName("oliver smale");
    game.me.setColour(ColourID.Black);
    game.me.setHat(HatID.Plague);
});