import { AmongusClient, MasterServers } from "../index.js";
const client = new AmongusClient({
    debug: true
});
await client.connect(MasterServers.EU[0], "weakeyes");
