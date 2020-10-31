import {
    AmongusClient,
    HatID,
    MasterServers,
    Game,
    PlayerClient
} from "../index.js"

function get_imposter_names(imposters: PlayerClient[]): string[] {
    return imposters.map(imposter => {
        return imposter.PlayerData.name;
    });
}

function format_array(arr: any[]): string {
    if (arr.length === 0) {
        return "";
    }
    
    if (arr.length === 1) {
        return arr[0].toString();
    }

    const head = arr.slice(0, arr.length - 1).join(", ");
    const tail = arr[arr.length - 1];

    return head + " and " + tail;
}

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

    game.on("setImposters", imposters => {
        console.log(get_imposter_names(imposters));
    });

    game.on("start", () => {
        setTimeout(function () {
            for (let i = 0; i < game.me.tasks.length; i++) game.me.completeTask(game.me.tasks[i]);
        }, 7500);
    });

    game.on("startMeeting", (emergency, target) => {
        setTimeout(async function () {
            const imposters = get_imposter_names(game.imposters);
            const arr = format_array(imposters);

            game.me.chat("Imposter" + (imposters.length === 1 ? " is " : "s are ") + arr + ", but I'm not really sure.");

            game.me.vote(game.imposters[Math.floor(Math.random() * game.imposters.length)]);
        }, (game.options.discussionTime * 1000) + 5000);
    });

    const weakeyes = game.findPlayer("weakeyes");

    weakeyes.Player.CustomNetworkTransform.on("move", function (transform) {
        console.log("Move.");
        game.me.move(transform.position, transform.velocity);
    });
})();