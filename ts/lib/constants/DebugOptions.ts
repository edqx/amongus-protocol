export enum DebugOptions {
    None = 0x00,
    Everything = 0x01,
    Acknowledgements = 0x02,
    PayloadOutbound = 0x04,
    PayloadInbound = 0x08,
    SpecialOutbound = 0x10,
    SpecialInbound = 0x20,
    PacketOutbound = PayloadOutbound | SpecialOutbound,
    PacketInbound = PayloadInbound | SpecialInbound,
    AllPackets = PacketOutbound | PacketInbound,
    SystemData = 0x40,
    ComponentData = 0x80,
    Component = 0x100,
    ObjectSpawn = 0x100,
    ObjectDespawn = 0x200,
    Object = ObjectSpawn | ObjectDespawn | Component
}