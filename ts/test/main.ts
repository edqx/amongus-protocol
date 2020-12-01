import {
    AmongusClient,
    HatID,
    MasterServers,
    DebugOptions
} from "../index.js"

const sleep=ms=>new Promise(r=>setTimeout(r,ms));

(async () => {
    const client = new AmongusClient({
        debug: DebugOptions.Everything
    });

    const servers = MasterServers.EU[0];

    await client.connect(servers[0], servers[1], "weakeyes");

    const game = await client.join(process.argv[2]);
    await game.awaitSpawns();
    
    game.GameData.GameData.on("playerData", player => {
        console.log(player);
    });

    await game.me.setName("strongeyes");
    await game.me.setColour(Math.floor(Math.random() * 13));
    await game.me.setHat(HatID.Plague);
    
    game.on("chat", (client, text) => {
        console.log(text);
    });

    game.on("finish", reason => {
        console.log(reason);
    });
})();