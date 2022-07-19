// AUTO-GENERATED
// Run "yarn craft gen:index" to update

import { Command } from "../base/Command";
import { AboutCommand } from "./AboutCommand";
import { AgendaCommand } from "./AgendaCommand";
import { ConfigCommand } from "./ConfigCommand";
import { InviteCommand } from "./InviteCommand";
import { LiveCommand } from "./LiveCommand";
import { PingCommand } from "./PingCommand";

export const commands: { new(): Command }[] = [
    AboutCommand,
    AgendaCommand,
    ConfigCommand,
    InviteCommand,
    LiveCommand,
    PingCommand
];
