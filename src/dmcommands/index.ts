/**
 * Copyright © 2022 Maxime Friess <M4x1me@pm.me>
 * 
 * This file is part of AN-BOT.
 * 
 * AN-BOT is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 * 
 * AN-BOT is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 * 
 * You should have received a copy of the GNU General Public License
 * along with AN-BOT.  If not, see <https://www.gnu.org/licenses/>.
 */

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
