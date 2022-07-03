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

import { REST } from '@discordjs/rest';
import { Routes } from 'discord-api-types/v9';
import { Client, DMChannel } from 'discord.js';
import fs from 'fs';
import path from 'path';
import url from 'url';
import HardConfig from './config/HardConfig.js';
import SoftConfig from './config/SoftConfig.js';
import loggers from './utils/Logger.js';

class __Bot {
    constructor() {
        this.__logger = loggers.getLogger("Bot");
        this.__token = HardConfig.getBotToken();
        this.__commands = {};
        this.__buttons = {};
        this.__selects = {};
        this.__dmcommands = {};
        this.__rest = new REST({ version: '9' }).setToken(this.__token);
    }

    getDMCommands() {
        return this.__dmcommands;
    }

    async __loadDMCommands() {
        this.__logger.info("Loading dm commands...");
        try {
            const files = fs.readdirSync(path.join(path.dirname(url.fileURLToPath(import.meta.url)), 'dmcommands'));

            for (let filename of files) {
                const module = await import(path.join(path.join(path.dirname(url.fileURLToPath(import.meta.url)), 'dmcommands'), filename));
                const command = new module.default;
                this.__logger.info("Loading dm command " + command.getName());
                this.__dmcommands[command.getName()] = command;
                for (let o of command.getConfigs()) {
                    SoftConfig.registerConfig(o);
                }
            }
        } catch (e) {
            this.__logger.fatal("Failed to register dmcommands!", e, 3);
            return;
        }

    }

    async __loadCommands() {
        this.__logger.info("Loading slash commands...");
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
    }

    async registerCommands(guilds_id) {
        await this.__loadDMCommands();
        await this.__loadCommands();

        let commands = [];

        for (let i in this.__commands) {
            if (this.__commands[i].isDevCommand() && HardConfig.getDev() || !this.__commands[i].isDevCommand()) {
                commands.push({
                    name: this.__commands[i].getName(),
                    description: this.__commands[i].getDescription(),
                    options: this.__commands[i].getOptions()
                });
            }
        }

        // We are in DEV mode, register commands per guilds
        if (HardConfig.getDev()) {
            for (let guild_id of guilds_id) {
                try {
                    this.__logger.info("Registering commands on guild " + guild_id + "!");
                    await this.__rest.put(Routes.applicationGuildCommands(HardConfig.getBotAppID(), guild_id), { body: commands });
                } catch (e) {
                    this.__logger.error("Error while registering bot commands on server " + guild_id + "!", e);
                }
            }
            // We are not in DEV mode, register commands globally
        } else {
            await this.__rest.put(Routes.applicationCommands(HardConfig.getBotAppID()), { body: commands });
        }
    }

    async onReady() {
        this.__logger.info("Registering bot commands...");
        const guilds_id = this.__client.guilds.cache.map(g => g.id);
        await this.registerCommands(guilds_id);

        this.__logger.info("Logged in as " + this.__client.user.tag + ".");
    }

    async onMessage(message) {
        if (!message.channel instanceof DMChannel)
            return;

        try {
            if (message.partial) {
                message = await message.fetch();
            }
        } catch (e) {
            this.__logger.error("Error when retrieving partial message", e);
        }

        for (const [name, command] of Object.entries(this.__dmcommands)) {
            if (message.content.startsWith(name)) {
                try {
                    if (command.isReservedToGod() && !HardConfig.getDiscordGods().includes(message.author.id)) {
                        return;
                    }

                    if (command.getCommandRegex().test(message.content)) {
                        await command.execute(message, message.content, command.getCommandRegex().exec(message.content));
                    } else {
                        message.reply("Usage: `" + command.getUsage() + "`");
                    }
                } catch (e) {
                    this.__logger.error("Error when handling DM command \"" + name + "\"", e);
                    try {
                        message.reply("Une erreur est survenue lors du traitement de votre commande.");
                    } catch (e) {
                        this.__logger.error("Error when handling error of dm command \"" + name + "\"", e);
                    }
                }
                break;
            }
        }
    }

    async onInteraction(interaction) {
        if (interaction.isCommand()) {
            if (this.__commands[interaction.commandName] !== undefined) {
                if (this.__commands[interaction.commandName].isReservedToGod()) {
                    if (!HardConfig.getDiscordGods().includes(interaction.user.id)) {
                        interaction.reply({ content: "Vous n'êtes pas Dieux.", ephemeral: true });
                        return;
                    }
                }

                await this.__callWithErrorHandl(this.__commands[interaction.commandName].execute.bind(this.__commands[interaction.commandName]), interaction, "commande");
            }
        } else if (interaction.isButton()) {
            if (this.__buttons[interaction.customId] !== undefined) {
                await this.__callWithErrorHandl(this.__buttons[interaction.customId].bind(this.__buttons[interaction.customId]), interaction, "boutton");
            }
        } else if (interaction.isSelectMenu()) {
            if (this.__selects[interaction.customId] !== undefined) {
                await this.__callWithErrorHandl(this.__selects[interaction.customId].bind(this.__selects[interaction.customId]), interaction, "sélecteur");
            }
        }
    }

    async __callWithErrorHandl(fnc, interaction, type) {
        try {
            await fnc(interaction);
        } catch (e) {
            this.__logger.error("Error when handling " + type + " \"" + (interaction.commandName ?? interaction.customId) + "\"", e);
            try {
                if (interaction.deferred)
                    interaction.editReply({ content: "Une erreur est survenue lors du traitement de votre " + type + "." });
                else
                    interaction.reply({ content: "Une erreur est survenue lors du traitement de votre " + type + ".", ephemeral: true });
            } catch (e) {
                this.__logger.error("Error when handling error of " + type + " \"" + (interaction.commandName ?? interaction.customId) + "\"", e);
            }
        }
    }

    async initClient() {
        this.__client = new Client({ intents: ["DIRECT_MESSAGES", "GUILD_VOICE_STATES"] });

        this.__client.on('ready', this.onReady.bind(this));
        this.__client.on('interactionCreate', this.onInteraction.bind(this));
        this.__client.on('messageCreate', this.onMessage.bind(this));
        this.__client.on('voiceStateUpdate', (oldState, newState) => {
            const guild = oldState.guild;
            const channel = guild.channels.cache.find(channel => (channel.type === 'voice' && channel.members.has(Client.user.id)))
            if (channel !== undefined) {
                if (channel.members.size <= 1) {
                    console.log("must leave!!!");
                }
            }
        });
    }

    start() {
        this.__client.login(HardConfig.getBotToken());
    }

    registerButton(customId, handler) {
        this.__buttons[customId] = handler;
    }

    registerSelect(customId, handler) {
        this.__selects[customId] = handler;
    }
}

const Bot = new __Bot();
export default Bot;
