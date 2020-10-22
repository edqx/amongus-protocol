export function EncodeVersion(info) {
    return (info.year * 25000) +
        (info.month * 1800) +
        (info.day * 50) +
        info.build;
}
export function DecodeVersion(version) {
    const info = {};
    info.year = Math.floor(version / 25000);
    version %= 25000;
    info.month = Math.floor(version / 1800);
    version %= 1800;
    info.day = Math.floor(version / 50);
    info.build = version % 50;
    return info;
}
