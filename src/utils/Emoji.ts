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

class EmojiManager {
    public yes: string;
    public no: string;
    public null: string;
    public refresh: string;

    constructor() {
        this.yes = '✅';
        this.no = '❎';
        this.null = '🅾';
        this.refresh = '🔄';
    }

    digitToEmoji(digit: number): string {
        if (digit > 10 || digit < 0) throw new Error(digit + ' is not a digit.');
        return ['0️⃣', '1️⃣', '2️⃣', '3️⃣', '4️⃣', '5️⃣', '6️⃣', '7️⃣', '8️⃣', '9️⃣'][digit];
    }
}

export const Emoji = new EmojiManager();
