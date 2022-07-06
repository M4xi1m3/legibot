/**
 * Copyright © 2022 Maxime Friess <M4x1me@pm.me>
 * 
 * This file is part of LegiBot.
 * 
 * LegiBot is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 * 
 * LegiBot is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 * 
 * You should have received a copy of the GNU General Public License
 * along with LegiBot.  If not, see <https://www.gnu.org/licenses/>.
 */

import { AudioPlayer, AudioPlayerStatus, createAudioPlayer, createAudioResource, CreateVoiceConnectionOptions, entersState, joinVoiceChannel, JoinVoiceChannelOptions, NoSubscriberBehavior, VoiceConnection, VoiceConnectionStatus } from "@discordjs/voice";
import Ffmpeg, { FfmpegCommand } from "fluent-ffmpeg";
import { PassThrough } from "stream";
import { Log, Logger } from "./Logger";

class AudioManager {
    private connections: { [guild_id: string]: VoiceConnection };
    private players: { [url: string]: AudioPlayer };
    private ffmpeg: { [url: string]: FfmpegCommand };
    private logger: Log;

    constructor() {
        this.connections = {};
        this.players = {};
        this.ffmpeg = {};
        this.logger = Logger.getLogger("Audio");
    }

    public clean(ignore?: string): void {
        for (const url in this.players) {
            const player = this.players[url];
            if (player.playable.length < 1 && url !== ignore) {
                player.stop();
                this.ffmpeg[url].kill('SIGKILL');
                delete this.ffmpeg[url];
                delete this.players[url];
            }
        }
    }

    public leave(guild_id: string): void {
        if (this.connections[guild_id] === undefined)
            return;

        this.logger.info(`Leaving ${guild_id}.`);
        this.connections[guild_id].destroy();
        delete this.connections[guild_id];

        this.clean();
    }

    private startFfmpeg(url: string) {
        return Ffmpeg(url).noVideo().audioCodec('opus').format('ogg').outputOptions([
            "-drop_pkts_on_overflow", "1", "-attempt_recovery", "1", "-recovery_wait_time", "1", "-recover_any_error", "1"
        ]).on('error', ((error: any, stdout: null | string, stderr: null | string) => {
            this.logger.error(`ffmpeg error while playing ${url}.`, error as Error);
            console.log(stdout);
            console.error(stderr);
        }).bind(this)).on('end', ((_: any, stderr: string | null) => {
            this.logger.info(`ffmpeg ended.`);
            console.error(stderr);
        }).bind(this));
    }

    public playStream(url: string, params: JoinVoiceChannelOptions & CreateVoiceConnectionOptions): void {
        this.logger.info(`Joining ${params.guildId}.`);
        const connection = joinVoiceChannel(params);

        this.connections[params.guildId] = connection;

        let player: AudioPlayer | null = null;
        if (url in this.players) {
            player = this.players[url];
        } else {
            const stream = this.startFfmpeg(url);
            this.ffmpeg[url] = stream;
            const resource = createAudioResource(stream.pipe() as PassThrough);

            player = createAudioPlayer({
                behaviors: {
                    noSubscriber: NoSubscriberBehavior.Pause
                }
            });

            player.on('error', (error: any) => {
                this.logger.error(`Player error while playing ${url}.`, error as Error);
                this.leave(params.guildId);
            });

            player.on(AudioPlayerStatus.Idle, () => {
                this.logger.info("Idle");
                this.ffmpeg[url].kill('SIGKILL');
                const stream = this.startFfmpeg(url);
                this.ffmpeg[url] = stream;
                const resource = createAudioResource(stream.pipe() as PassThrough);
                player?.play(resource);
            });

            this.logger.info(`Playing ${url}.`);
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
            } catch (error: any) {
                this.logger.error(`Connection error while playing in ${params.guildId}.`, error as Error);
                this.leave(params.guildId);
            }
        });

        this.clean(url);
    }
}

export const Audio = new AudioManager();
