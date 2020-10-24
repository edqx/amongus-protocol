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

const server = MasterServers.NA[0];

await client.connect(server[0], server[1], "weakeyes");

const game = await client.join(process.argv[2], {
    doSpawn: true
});

const loop = "poo head ".split("")

game.me.on("spawn", async player => {
    await game.me.setName(loop.join(""));

    setInterval(async () => {
        loop.push(loop.shift());

        await game.me.setName(loop.join(""));
    }, 100);
});