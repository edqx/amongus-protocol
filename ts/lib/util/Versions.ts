import { VersionInfo } from "../interfaces/VersionInfo.js"

export function EncodeVersion(info: VersionInfo): number {
    return (info.year * 25000) +
        (info.month * 1800) +
        (info.day * 50) +
        info.build;
}

export function DecodeVersion(version: number): VersionInfo {
    const info: Partial<VersionInfo> = {}

    info.year = Math.floor(version / 25000);
    version %= 25000;
    info.month = Math.floor(version / 1800);
    version %= 1800;
    info.day = Math.floor(version / 50);
    info.build = version % 50;

    return info as VersionInfo;
}

export function FormatVersion(version: VersionInfo|number) {
    if (typeof version === "number") {
        return FormatVersion(DecodeVersion(version));
    }

    return version.year + "." + version.month + "." + version.day;
}

export function ParseVersion(v: string): VersionInfo {
    v = v.toLowerCase();

    if(v.startsWith("v")) v = v.slice(1);
    
    if(v.endsWith("s") || v.endsWith("i")) v = v.slice(0, -1); // s stands for steam and i stands for itch

    let [year, month, day] = v.split(".");
    
    return {
        year: +year,
        month: +month,
        day: +day || 1,
        build: 0
    }
}
