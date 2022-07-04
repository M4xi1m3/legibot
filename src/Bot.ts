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
 * along with AN-BOT. If not, see <https://www.gnu.org/licenses/>.
 */

import { REST } from '@discordjs/rest';
import { Routes } from 'discord-api-types/v9';
import { ButtonInteraction, Client, CommandInteraction, DMChannel, Interaction, Message, SelectMenuInteraction, VoiceState } from 'discord.js';
import Command from './base/Command';
import DMCommand from './base/DMCommand';
import { HardConfig } from './config/HardConfig';
import { Audio } from './utils/Audio';
import { Log, Logger } from './utils/Logger';

class BotManager {
    private logger: Log;
    private token: string;
    private commands: { [name: string]: Command };
    private buttons: { [custom_id: string]: (interaction: ButtonInteraction) => void };
    private selects: { [custom_id: string]: (interaction: SelectMenuInteraction) => void };
    private dmcommands: { [name: string]: DMCommand };
    private rest: REST;
    private client?: Client;

    constructor() {
        this.logger = Logger.getLogger("Bot");
        this.token = HardConfig.getBotToken();
        this.commands = {};
        this.buttons = {};
        this.selects = {};
        this.dmcommands = {};
        this.rest = new REST({ version: '9' }).setToken(this.token);
    }

    public getDMCommands() {
        return this.dmcommands;
    }

    private async loadDMCommands() {
        this.logger.info("Loading dm commands...");
        /*
        try {
            const files = fs.readdirSync(path.join(path.dirname(url.fileURLToPath(import.meta.url)), 'dmcommands'));

            for (let filename of files) {
                const module = await import(path.join(path.join(path.dirname(url.fileURLToPath(import.meta.url)), 'dmcommands'), filename));
                const command = new module.default;
                this.logger.info("Loading dm command " + command.getName());
                this.dmcommands[command.getName()] = command;
                for (let o of command.getConfigs()) {
                    SoftConfig.registerConfig(o);
                }
            }
        } catch (e) {
            this.__logger.fatal("Failed to register dmcommands!", e, 3);
            return;
        }
        */

    }

    async loadCommands() {
        this.logger.info("Loading slash commands...");
        /*
        try {
            const files = fs.readdirSync(path.join(path.dirname(url.fileURLToPath(import.meta.url)), 'commands'));

            for (let filename of files) {
                const module = await import(path.join(path.join(path.dirname(url.fileURLToPath(import.meta.url)), 'commands'), filename));
                const command = new module.default;
                this.__logger.info("Loading command " + command.getName());
                this.__commands[command.getName()] = command;
                for (let o of command.getConfigs()) {
                    SoftConfig.registerConfig(o);
                }
            }
        } catch (e) {
            this.__logger.fatal("Failed to register commands!", e, 3);
            return;
        }
        */
    }

    async registerCommands(guilds_id: string[]) {
        await this.loadDMCommands();
        await this.loadCommands();

        const commands = [];

        for (const i in this.commands) {
            if (this.commands[i].isDevCommand() && HardConfig.getDev() || !this.commands[i].isDevCommand()) {
                commands.push({
                    name: this.commands[i].getName(),
                    description: this.commands[i].getDescription(),
                    options: this.commands[i].getOptions()
                });
            }
        }

        // We are in DEV mode, register commands per guilds
        if (HardConfig.getDev()) {
            for (const guild_id of guilds_id) {
                try {
                    this.logger.info("Registering commands on guild " + guild_id + "!");
                    await this.rest.put(Routes.applicationGuildCommands(HardConfig.getBotAppID(), guild_id), { body: commands });
                } catch (e: any) {
                    this.logger.error("Error while registering bot commands on server " + guild_id + "!", e as Error);
                }
            }
            // We are not in DEV mode, register commands globally
        } else {
            await this.rest.put(Routes.applicationCommands(HardConfig.getBotAppID()), { body: commands });
        }
    }

    async onReady() {
        this.logger.info("Registering bot commands...");
        const guilds_id = this.client?.guilds.cache.map(g => g.id) ?? [];
        await this.registerCommands(guilds_id);

        this.logger.info("Logged in as " + this?.client?.user?.tag + ".");
    }

    async onMessage(message: Message) {
        if (!(message.channel instanceof DMChannel))
            return;

        try {
            if (message.partial) {
                message = await message.fetch();
            }
        } catch (e: any) {
            this.logger.error("Error when retrieving partial message", e as Error);
        }

        for (const [name, command] of Object.entries(this.dmcommands)) {
            if (message.content.startsWith(name)) {
                try {
                    if (command.isReservedToGod() && !HardConfig.getDiscordGods().includes(message.author.id)) {
                        return;
                    }

                    if (command.getCommandRegex().test(message.content)) {
                        await command.execute(message, message.content, command.getCommandRegex().exec(message.content) ?? []);
                    } else {
                        message.reply("Usage: `" + command.getUsage() + "`");
                    }
                } catch (e: any) {
                    this.logger.error("Error when handling DM command \"" + name + "\"", e as Error);
                    try {
                        message.reply("Une erreur est survenue lors du traitement de votre commande.");
                    } catch (e: any) {
                        this.logger.error("Error when handling error of dm command \"" + name + "\"", e as Error);
                    }
                }
                break;
            }
        }
    }

    async onInteraction(interaction: Interaction) {
        if (interaction.isCommand()) {
            if (this.commands[interaction.commandName] !== undefined) {
                if (this.commands[interaction.commandName].isReservedToGod()) {
                    if (!HardConfig.getDiscordGods().includes(interaction.user.id)) {
                        interaction.reply({ content: "Vous n'êtes pas Dieux.", ephemeral: true });
                        return;
                    }
                }

                await this.callWithErrorHandler(this.commands[interaction.commandName].execute.bind(this.commands[interaction.commandName]), interaction, "commande");
            }
        } else if (interaction.isButton()) {
            if (this.buttons[interaction.customId.split(",")[0]] !== undefined) {
                await this.callWithErrorHandler(this.buttons[interaction.customId.split(",")[0]].bind(this.buttons[interaction.customId.split(",")[0]]), interaction, "boutton");
            }
        } else if (interaction.isSelectMenu()) {
            if (this.selects[interaction.customId.split(",")[0]] !== undefined) {
                await this.callWithErrorHandler(this.selects[interaction.customId.split(",")[0]].bind(this.selects[interaction.customId.split(",")[0]]), interaction, "sélecteur");
            }
        }
    }

    async callWithErrorHandler<T extends CommandInteraction | ButtonInteraction | SelectMenuInteraction>(fnc: (interaction: T) => void, interaction: T, type: string) {
        try {
            await fnc(interaction);
        } catch (e: any) {
            const name = interaction instanceof CommandInteraction ? interaction.commandName : interaction.customId.split(",")[0];

            this.logger.error("Error when handling " + type + " \"" + name + "\"", e as Error);
            try {
                if (interaction.deferred)
                    interaction.editReply({ content: "Une erreur est survenue lors du traitement de votre " + type + "." });
                else
                    interaction.reply({ content: "Une erreur est survenue lors du traitement de votre " + type + ".", ephemeral: true });
            } catch (e: any) {
                this.logger.error("Error when handling error of " + type + " \"" + name + "\"", e as Error);
            }
        }
    }

    async initClient() {
        this.client = new Client({ intents: ["DIRECT_MESSAGES", "GUILD_VOICE_STATES"], partials: ['CHANNEL'] });

        this.client.on('ready', this.onReady.bind(this));
        this.client.on('interactionCreate', this.onInteraction.bind(this));
        this.client.on('messageCreate', this.onMessage.bind(this));
        this.client.on('voiceStateUpdate', async (oldState: VoiceState) => {
            const guild = oldState.guild;


            let channels = await guild.channels.fetch();
            channels = channels.filter(channel => (channel.type === 'GUILD_VOICE' && channel.members.has(guild?.client?.user?.id + '')))

            if (channels.size !== 0) {
                const channel = channels.first();
                if (channel !== undefined && channel.members.size <= 1) {
                    Audio.leave(guild.id);
                }
            }
        });
    }

    start() {
        this.client?.login(HardConfig.getBotToken());
    }

    registerButton(customId: string, handler: (interaction: ButtonInteraction) => void) {
        this.buttons[customId] = handler;
    }

    registerSelect(customId: string, handler: (interaction: SelectMenuInteraction) => void) {
        this.selects[customId] = handler;
    }
}

export const Bot = new BotManager();
