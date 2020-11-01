import {
    AmongusClient,
    HatID,
    MasterServers,
    Game,
    PlayerClient
} from "../index.js"

import util from "util"

(async () => {
    const client = new AmongusClient({
        debug: false
    });

    const servers = MasterServers.EU[0];

    await client.connect(servers[0], servers[1], "weakeyes");

    const game = await client.join(process.argv[2]);

    await game.awaitSpawns();

    await game.me.setName("strongeyes");
    await game.me.setColour(Math.floor(Math.random() * 13));
    await game.me.setHat(HatID.Plague);

    console.log(util.inspect([...game.clients.values()].map(client => {
        return {
            name: client.PlayerData.name,
            clientid: client.clientid,
            playerid: client.Player.PlayerControl.playerId,
            components: client.Player.components.map(component => {
                return {
                    classname: component.classname,
                    netid: component.netid
                }
            })
        }
    }), false, 10, true));
})();