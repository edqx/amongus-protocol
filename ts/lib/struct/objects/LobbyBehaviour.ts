import { AmongusClient } from "../../Client.js"

import { GameObject } from "./GameObject.js"

import { FollowerCamera } from "../components/FollowerCamera.js"

import {
    SpawnID
} from "../../constants/Enums.js"

import { ComponentData } from "../../interfaces/Packets.js"
import { Game } from "../Game.js"

export class LobbyBehaviour extends GameObject {
    spawnid: SpawnID.LobbyBehaviour;
    components: [FollowerCamera];

    constructor (client: AmongusClient, parent: Game, components: Partial<ComponentData>[]) {
        super(client, parent);

        this.id = null;

        this.components = [
            new FollowerCamera(client, components[0].netid, components[0].datalen, components[0].data)
        ];
        
        if (parent instanceof GameObject) {
            parent.addChild(this);
        }
    }

    get FollowerCamera() {
        return this.components[0];
    }
}