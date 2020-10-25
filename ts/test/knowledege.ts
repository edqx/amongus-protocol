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

game.on("playerJoin", async client => {
    console.log("Joined", client.clientid);
});

game.on("playerLeave", async client => {
    console.log("Left", client.clientid);
});

game.on("startCount", async counter => {
    console.log("Game starting..", counter);
});

game.on("start", async () => {
    console.log("Game started!");
});

game.on("setImposters", imposters => {
    console.log("The imposters are: ", imposters.map(client => client.PlayerData.name));
});

game.me.on("spawn", async player => {
    game.me.setColour(ColourID.Red);
    game.me.setName("strong eyes");
});

await game.GameData.awaitSpawn();

game.GameData.GameData.on("playerData", playerData => {
    console.log(playerData);
});