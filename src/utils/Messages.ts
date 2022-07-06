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

import { CommandInteraction, InteractionReplyOptions, Message, MessageComponentInteraction } from 'discord.js';

class MessagesManager {
    async sendSplittedReply(original: CommandInteraction | MessageComponentInteraction | Message, msg: string, options: InteractionReplyOptions = {}): Promise<void> {
        const msgs = this.splitForMessage(msg);

        let first = true;
        for (const m of msgs) {
            if (first) {
                first = false;
                if (original instanceof Message) {
                    await original.reply(m);
                } else {
                    await original.reply({ content: m, ...options });
                }
            } else {
                if (original instanceof Message) {
                    await original.channel.send(m);
                } else {
                    await original.followUp({ content: m, ...options });
                }
            }
        }
    }

    splitForMessage(msg: string, limit = 2000): string[] {
        const lines = msg.split('\n');

        const messages = [];
        let current = '';

        lines.forEach((line) => {
            if ((current + '\n' + line).length >= limit) {
                messages.push(current);
                current = line;
            } else {
                current = current + '\n' + line;
            }
        });

        if (current.length !== 0) messages.push(current);

        return messages;
    }
}

export const Messages = new MessagesManager();
