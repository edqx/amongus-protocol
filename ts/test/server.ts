import {
    AmongusServer
} from "../index.js"

(async () => {
    const client = new AmongusServer({
        debug: false,
        logs: true
    });
    
    await client.listen(22023);
})();