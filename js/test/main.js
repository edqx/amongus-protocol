import { AmongusClient, MasterServers } from "../index.js";
const client = new AmongusClient({
    debug: true
});
await client.connect(MasterServers.EU[0][0], MasterServers.EU[0][1], "weakeyes");
await client.join("CYFNGF");
