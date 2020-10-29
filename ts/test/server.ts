import {
    AmongusServer
} from "../index.js"

const client = new AmongusServer({
    debug: false,
    logs: true
});

await client.listen(22023);