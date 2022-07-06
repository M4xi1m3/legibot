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

export class ConsoleCommand {
    protected constructor() {
        if (this.constructor === ConsoleCommand) {
            throw new TypeError('Abstract class "ConsoleCommand" cannot be instantiated directly');
        }
    }

    getName(): string {
        throw new TypeError('Abstract method "getName" of class "ConsoleCommand" cannot be used directly');
    }

    getDescription(): string {
        throw new TypeError('Abstract method "getDescription" of class "ConsoleCommand" cannot be used directly');
    }

    getConfigs(): string[] {
        return [];
    }

    async execute(args: string[]): Promise<void> {
        throw new TypeError('Abstract method "execute" of class "ConsoleCommand" cannot be used directly');
    }
}
