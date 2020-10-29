export interface ClientOptions {
    /**
     * Whether or not to display debug messages to console.
     */
    debug?: boolean;
    
    /**
     * How long to wait for reliable packet acknowledgment before trying again.
     */
    ackInterval?: number;
}