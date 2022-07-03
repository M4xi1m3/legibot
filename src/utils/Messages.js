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

class __Messages {
    constructor() {
    }

    async sendSplittedReply(original, msg) {
        let msgs = this.splitForMessage(msg);

        let first = true;
        for (let m of msgs) {

            if (first) {
                first = false;
                await original.reply(m);
            } else {
                await original.channel.send(m);
            }
        }
    }

    async sendSplittedReplyI(interaction, msg) {
        let msgs = this.splitForMessage(msg);

        let first = true;
        for (let m of msgs) {

            if (first) {
                first = false;
                await interaction.reply({content: m, ephemeral: true});
            } else {
                await interaction.followUp({content: m, ephemeral: true});
            }
        }
    }

    splitForMessage(msg, limit = 2000) {
        let lines = msg.split("\n");

        let messages = [];
        let current = "";

        lines.forEach((line) => {
            if ((current + "\n" + line).length >= limit) {
                messages.push(current);
                current = line;
            } else {
                current = current + "\n" + line;
            }
        });

        if (current.length !== 0)
            messages.push(current);

        return messages;
    }
}

const Messages = new __Messages();
export default Messages;
