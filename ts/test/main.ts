import {
    AmongusClient,
    HatID,
    MasterServers,
    Game,
    PlayerClient,
    DebugOptions,
    GameObject
} from "../index.js"
import { SystemType } from "../lib/constants/Enums.js";

(async () => {
    const client = new AmongusClient({
        debug: DebugOptions.None
    });

    const servers = MasterServers.EU[0];

    await client.connect(servers[0], servers[1], "weakeyes");

    const game = await client.join(process.argv[2]);

    await game.awaitSpawns();

    await game.me.setName("strongeyes");
    await game.me.setColour(Math.floor(Math.random() * 13));
    await game.me.setHat(HatID.Plague);

    game.on("start", () => {
        if (game.me.imposter) {
            setTimeout(async function () {
                await game.me.sabotageSystem(SystemType.O2);
            }, 10000);
        }
    })
})();