import {
    AmongusClient,
    HatID,
    MasterServers
} from "../index.js"

(async () => {
    const client = new AmongusClient({
        debug: false
    });

    const servers = MasterServers.NA[0];

    await client.connect(servers[0], servers[1], "weakeyes");

    const game = await client.join(process.argv[2]);

    await game.me.awaitSpawn();
    await game.host.awaitSpawn();

    await game.me.setName("strongeyes");
    console.log("Set name.");
    await game.me.setColour(Math.floor(Math.random() * 13));
    console.log("Set colour.");
    game.me.setHat(HatID.Plague);
    console.log("Set hat.");

    game.on("startMeeting", (emergecy, target) => {
        console.log("Meeting started, voting in 20s..");
        setTimeout(() => {
            console.log("Voted");
            game.me.vote(game.host)
        }, 20000);
    });
})();