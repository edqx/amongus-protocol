import {
    AmongusClient,
    MapID
} from "../index.js"

(async () => {
    const client = new AmongusClient({
        debug: true
    });

    await client.connect("127.0.0.1", 22023, "weakeyes");

    const games = await client.search([MapID.TheSkeld]);

    console.log(games);
});