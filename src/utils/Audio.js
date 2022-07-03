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

import { createAudioPlayer, createAudioResource, joinVoiceChannel, NoSubscriberBehavior, VoiceConnectionStatus } from "@discordjs/voice";
import Ffmpeg from "fluent-ffmpeg";

class __Audio {
    constructor() {
        this.__connections = {};
        this.__players = {};
        this.__ffmpeg = {};
    }

    clean() {
        for (const url in this.__players) {
            const player = this.__players[url];
            if (player.playable.length < 1) {
                player.stop();
                this.__ffmpeg[url].on("error", () => { });
                this.__ffmpeg[url].kill();
                delete this.__ffmpeg[url];
                delete this.__players[url];
            }
        }
    }

    leave(guild_id) {
        if (this.__connections[guild_id] === undefined)
            return;

        this.__connections[guild_id].destroy();
        delete this.__connections[guild_id];

        this.clean();
    }

    playStream(url, params) {
        const connection = joinVoiceChannel(params);

        this.__connections[params.guildId] = connection;

        let player = null;
        if (url in this.__players) {
            player = this.__players[url];
        } else {
            const stream = Ffmpeg(url).noVideo().audioCodec('opus').format('ogg');
            this.__ffmpeg[url] = stream;
            const resource = createAudioResource(stream.pipe());

            player = createAudioPlayer({
                behaviors: {
                    noSubscriber: NoSubscriberBehavior.Pause
                }
            });

            player.on('error', error => {
                this.leave(params.guildId);
            });

            player.on('idle', () => {
                this.leave(params.guildId);
            });

            player.play(resource);
        }

        this.__players[url] = player;

        connection.subscribe(player);
        connection.on(VoiceConnectionStatus.Disconnected, async (oldState, newState) => {
            try {
                await Promise.race([
                    entersState(connection, VoiceConnectionStatus.Signalling, 5_000),
                    entersState(connection, VoiceConnectionStatus.Connecting, 5_000),
                ]);
            } catch (error) {
                this.leave(params.guildId);
            }
        });
    }
}

const Audio = new __Audio();
export default Audio;