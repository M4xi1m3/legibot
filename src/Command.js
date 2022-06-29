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

class Command {
    constructor() {
        if (this.constructor === Command) {
            throw new TypeError('Abstract class "Command" cannot be instantiated directly');
        }
    }

    getName() {
        throw new TypeError('Abstract method "getName" of class "Command" cannot be used directly');
    }

    getDescription() {
        throw new TypeError('Abstract method "getDescription" of class "Command" cannot be used directly');
    }

    getOptions() {
        return [];
    }

    getConfigs() {
        return [];
    }

    isReservedToGod() {
        return false;
    }

    isDevCommand() {
        return false;
    }

    async execute(interraction) {
        throw new TypeError('Abstract method "execute" of class "Command" cannot be used directly');
    }
}

export default Command;