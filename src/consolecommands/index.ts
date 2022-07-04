// AUTO-GENERATED
// Run "yarn craft refresh" to update

import { ConsoleCommand } from "../base/ConsoleCommand";
import { HelpConsoleCommand } from "./HelpConsoleCommand";
import { PingConsoleCommand } from "./PingConsoleCommand";
import { RefreshConsoleCommand } from "./RefreshConsoleCommand";

export const consolecommands: { new(): ConsoleCommand }[] = [
    HelpConsoleCommand,
    PingConsoleCommand,
    RefreshConsoleCommand
];
