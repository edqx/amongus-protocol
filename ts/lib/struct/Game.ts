import { AmongusClient } from "../Client";

export class Game {
    constructor(private client: AmongusClient, public code: string) {}
}