import { EventEmitter } from "events";
import { AmongusClient } from "../../Client.js"
import { SpawnID } from "../../constants/Enums.js";
import { Component } from "../components/Component.js";

export class GameObject extends EventEmitter {
    spawnid: SpawnID;

    children: GameObject[];
    parent: AmongusClient|GameObject;
    components: Component[];
    
    constructor (protected client: AmongusClient, parent: AmongusClient|GameObject) {
        super();

        this.children = [];
        this.components = [];
    }

    isChild(child: GameObject): boolean {
        for (let i = 0; i < this.children.length; i++) {
            if (this.children[i] === child) {
                return true;
            }
        }

        return false;
    }

    removeChild(child: GameObject) {
        for (let i = 0; i < this.children.length; i++) {
            if (this.children[i] === child) {
                this.children.splice(i, 1);
                this.children[i].parent = null;
                break;
            }
        }
    }

    addChild(object: GameObject) {
        if (!this.isChild(object)) {
            this.children.push(object);
            object.parent = this;
        }
    }
    
    setParent(parent: GameObject) {
        if (this.parent instanceof AmongusClient) throw new Error("Could not set parent, object is global.");

        if (this.parent) {
            this.parent.removeChild(this);
        }

        parent.addChild(this);
    }
}