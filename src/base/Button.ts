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

import { ButtonInteraction, MessageButton } from "discord.js";
import { Component, ComponentType } from "./Component";

export class Button extends Component {
    protected constructor() {
        super();
        if (this.constructor === Button) {
            throw new TypeError('Abstract class "Button" cannot be instantiated directly');
        }
    }

    getID(): string {
        throw new TypeError('Abstract method "getID" of class "Button" cannot be used directly');
    }

    getType(): ComponentType {
        return 'button';
    }

    getConfigs(): string[] {
        return [];
    }

    isDevComponent(): boolean {
        return false;
    }

    async execute(interraction: ButtonInteraction): Promise<void> {
        throw new TypeError('Abstract method "execute" of class "Button" cannot be used directly');
    }

    static generate(): MessageButton {
        throw new TypeError('Abstract method "generate" of class "Button" cannot be used directly');
    }
}
