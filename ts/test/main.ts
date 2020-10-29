import {
    AmongusClient,
    HatID
} from "../index.js"

for (let i = 0; i < 9; i++) {
    (async () => {
        const client = new AmongusClient({
            debug: false
        });
        
        await client.connect("127.0.0.1", 22023, "weakeyes");

        const game = await client.join(process.argv[2]);

        await game.me.awaitSpawn();
        await game.host.awaitSpawn();
        
        game.me.setName( Math.random().toString(36).substr(2, 7));
        game.me.setColour(Math.floor(Math.random() * 13));
        game.me.setHat(HatID.Plague);

        game.host.Player.CustomNetworkTransform.on("move", transform => {
            setTimeout(function () {
                game.me.move(transform.position, transform.velocity);
            }, 100 * i);
        });
    })();
}