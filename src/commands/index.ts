// AUTO-GENERATED
// Run "yarn craft gen:index" to update

import { Command } from "../base/Command";
import { AboutCommand } from "./AboutCommand";
import { LiveCommand } from "./LiveCommand";
import { PingCommand } from "./PingCommand";

export const commands: { new(): Command }[] = [
    AboutCommand,
    LiveCommand,
    PingCommand
];
