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

import { ButtonInteraction, SelectMenuInteraction } from "discord.js";

export type ComponentType = 'button' | 'select';

export class Component {
    protected constructor() {
        if (this.constructor === Component) {
            throw new TypeError('Abstract class "Component" cannot be instantiated directly');
        }
    }

    getID(): string {
        throw new TypeError('Abstract method "getID" of class "Component" cannot be used directly');
    }

    getType(): ComponentType {
        throw new TypeError('Abstract method "getType" of class "Component" cannot be used directly');
    }

    getConfigs(): string[] {
        return [];
    }

    isDevComponent(): boolean {
        return false;
    }

    async execute(interraction: ButtonInteraction | SelectMenuInteraction): Promise<void> {
        throw new TypeError('Abstract method "execute" of class "Component" cannot be used directly');
    }
}
