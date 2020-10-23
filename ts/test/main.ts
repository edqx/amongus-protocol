import {
    AmongusClient,
    MasterServers,
    ColourID,
    PetID,
    HatID,
    SkinID,
    SpawnID
} from "../index.js"

const client = new AmongusClient({
    debug: true
});

const server = MasterServers.EU[0];

await client.connect(server[0], server[1], "weakeyes");

const game = await client.join(process.argv[2], {
    doSpawn: true
});

game.me.on("spawn", player => {
    game.me.setColour(ColourID.Blue);
    game.me.setName("weakeyes");
    game.me.setPet(PetID.Crewmate);
    game.me.setHat(HatID.Plague);
    game.me.setSkin(SkinID.Military);

    game.me.chat("Hello");
});