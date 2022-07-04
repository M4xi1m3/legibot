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

import { AudioPlayer, AudioPlayerStatus, createAudioPlayer, createAudioResource, CreateVoiceConnectionOptions, entersState, joinVoiceChannel, JoinVoiceChannelOptions, NoSubscriberBehavior, VoiceConnection, VoiceConnectionStatus } from "@discordjs/voice";
import Ffmpeg, { FfmpegCommand } from "fluent-ffmpeg";
import { PassThrough } from "stream";

class AudioManager {
    private connections: {[guild_id: string]: VoiceConnection};
    private players: {[url: string]: AudioPlayer};
    private ffmpeg: {[url: string]: FfmpegCommand};

    constructor() {
        this.connections = {};
        this.players = {};
        this.ffmpeg = {};
    }

    public clean(): void {
        for (const url in this.players) {
            const player = this.players[url];
            if (player.playable.length < 1) {
                player.stop();
                this.ffmpeg[url].on("error", () => undefined);
                this.ffmpeg[url].kill('SIGKILL');
                delete this.ffmpeg[url];
                delete this.players[url];
            }
        }
    }

    public leave(guild_id: string): void {
        if (this.connections[guild_id] === undefined)
            return;

        this.connections[guild_id].destroy();
        delete this.connections[guild_id];

        this.clean();
    }

    public playStream(url: string, params: JoinVoiceChannelOptions & CreateVoiceConnectionOptions): void {
        const connection = joinVoiceChannel(params);

        this.connections[params.guildId] = connection;

        let player = null;
        if (url in this.players) {
            player = this.players[url];
        } else {
            const stream = Ffmpeg(url).noVideo().audioCodec('opus').format('ogg');
            this.ffmpeg[url] = stream;
            const resource = createAudioResource(stream.pipe() as PassThrough);

            player = createAudioPlayer({
                behaviors: {
                    noSubscriber: NoSubscriberBehavior.Pause
                }
            });

            player.on('error', () => {
                this.leave(params.guildId);
            });

            player.on(AudioPlayerStatus.Idle, () => {
                this.leave(params.guildId);
            });

            player.play(resource);
        }

        this.players[url] = player;

        connection.subscribe(player);
        connection.on(VoiceConnectionStatus.Disconnected, async () => {
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

export const Audio = new AudioManager();
