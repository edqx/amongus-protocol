# AmongUs-Protocol (WIP)
### This protocol is not finished, please avoid using this for any projects, use with caution and know that everything is subject to change.

![Alt text](asset/logo.png "Amongus Protocol")

See the [wiki](https://github.com/edqx/amongus-protocol/wiki) for more information on the protocol.

An implementation of the Among Us protocol made in Typescript
* Lightweight, 0 external dependencies.
* Both server & client.
* Comprehensive coverage of the Among Us protocol.
* Easy to install & use.

Data gathered from
* https://wiki.weewoo.net/wiki/
* https://github.com/alexis-evelyn/Among-Us-Protocol/wiki
* [Wireshark](https://www.wireshark.org/)
* [IDA](https://www.hex-rays.com/products/ida/)
* [Il2CppDumper](https://github.com/Perfare/Il2CppDumper)
* Impostor Discord server
* Helpful members

## Install
With NPM:
`npm install --save amongus-protocol`
Or clone with Git:
`git clone https://github.com/edqx/amongus-protocol`

## Example
```ts
import {
    AmongusClient,
    MasterServers,
    ColourID,
    PetID,
    HatID,
    SkinID,
    SpawnID
} from "../index.js"

import { PlayerClient } from "../lib/struct/PlayerClient.js";

const server = MasterServers.NA[0];

const client = new AmongusClient({
    debug: false
});

await client.connect(server[0], server[1], "weakeyes");

const game = await client.join(process.argv[2]);

game.me.on("spawn", () => {
    game.me.setName("strong eyes");
    game.me.setColour(ColourID.Black);
    game.me.setHat(HatID.Plague);
});
```

## Notes
This repository is licensed under the MIT license, I am not responsible for anything you do using this library.