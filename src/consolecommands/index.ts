// AUTO-GENERATED
// Run "yarn craft gen:index" to update

import { ConsoleCommand } from "../base/ConsoleCommand";
import { GenIndexConsoleCommand } from "./GenIndexConsoleCommand";
import { GenVersionConsoleCommand } from "./GenVersionConsoleCommand";
import { HelpConsoleCommand } from "./HelpConsoleCommand";
import { PingConsoleCommand } from "./PingConsoleCommand";

export const consolecommands: { new(): ConsoleCommand }[] = [
    GenIndexConsoleCommand,
    GenVersionConsoleCommand,
    HelpConsoleCommand,
    PingConsoleCommand
];
