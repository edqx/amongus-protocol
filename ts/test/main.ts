import {
    AmongusClient,
    HatID,
    MasterServers,
    Game,
    PlayerClient,
    DebugOptions,
    GameObject
} from "../index.js"

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

    await game.me.awaitSpawn();
    
    console.log("Played spawned.");

    game.on("start", () => {
        console.log("Game started.");

        setTimeout(function () {
            if (game.me.PlayerData.name === "strongeyes") game.me.startMeeting("emergency");
        }, 8000);
    });

    game.on("meeting", () => {
        console.log("Meeting started.");
        game.me.vote(game.host);
    });

    game.on("vote", function (voter, suspect) {
        console.log("Vote.");
        console.log(voter.PlayerData.name + " voted for " + suspect.PlayerData.name);
    });
})();