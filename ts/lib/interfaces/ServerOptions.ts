export interface ServerOptions {
    debug?: boolean;
    logs?: boolean;
    ackInterval?: number;
    versions?: string[];
    disconnectTimeout?: number;
    pingInterval?: number;
}