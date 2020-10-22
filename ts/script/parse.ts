import util from "util"
import { parsePacket } from "../lib/Parser.js"

const bytes = process.argv.slice(2).join("");
const to_num = (val: string) => parseInt(val, 16);
const buff = Buffer.from(bytes.match(/[A-Fa-f0-9]{1,2}/g).map(to_num));

const parsed = parsePacket(buff, "client");

console.log(util.inspect(parsed, false, 10, false));