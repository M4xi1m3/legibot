// AUTO-GENERATED
// Run "yarn craft gen:index" to update

import { DMCommand } from "../base/DMCommand";
import { ActivityClearDMCommand } from "./ActivityClearDMCommand";
import { ActivityDMCommand } from "./ActivityDMCommand";
import { AudioCleanDMCommand } from "./AudioCleanDMCommand";
import { AudioConnectionsDMCommand } from "./AudioConnectionsDMCommand";
import { AudioPlayersDMCommand } from "./AudioPlayersDMCommand";
import { CacheFlushDMCommand } from "./CacheFlushDMCommand";
import { CacheInfoDMCommand } from "./CacheInfoDMCommand";
import { ConfigGetDMCommand } from "./ConfigGetDMCommand";
import { ConfigListDMCommand } from "./ConfigListDMCommand";
import { ConfigReloadDMCommand } from "./ConfigReloadDMCommand";
import { ConfigSetDMCommand } from "./ConfigSetDMCommand";
import { ConfigUnsetDMCommand } from "./ConfigUnsetDMCommand";
import { HelpDMCommand } from "./HelpDMCommand";
import { StatusDMCommand } from "./StatusDMCommand";

export const dmcommands: { new(): DMCommand }[] = [
    ActivityClearDMCommand,
    ActivityDMCommand,
    AudioCleanDMCommand,
    AudioConnectionsDMCommand,
    AudioPlayersDMCommand,
    CacheFlushDMCommand,
    CacheInfoDMCommand,
    ConfigGetDMCommand,
    ConfigListDMCommand,
    ConfigReloadDMCommand,
    ConfigSetDMCommand,
    ConfigUnsetDMCommand,
    HelpDMCommand,
    StatusDMCommand
];
