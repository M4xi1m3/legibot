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

import { Locale, LocaleString } from "discord-api-types/v9";
import { Interaction, MessageSelectOptionData } from "discord.js";

import format from 'string-format';
import { Command } from "../base/Command";
import { ServerConfig } from "../config/ServerConfig";
import { i18n } from "../i18n";

const DEFAULT_LANGAGE: Locale = Locale.EnglishUS;

export type I18nKey = (keyof typeof i18n) & string;

class I18nManager {
    getLang(lang: string | Interaction = DEFAULT_LANGAGE): LocaleString {
        if (lang instanceof Interaction) {
            if (lang.guildId === null) {
                return lang.locale as LocaleString;
            } else {
                if (ServerConfig.get(lang.guildId).ephemeral)
                    return lang.locale as LocaleString;
                return ServerConfig.get(lang.guildId).locale;
            }
        } else {
            return lang as LocaleString;
        }
    }

    getI18nDict(key: I18nKey): { [key in LocaleString]?: string } {
        return i18n[key] ?? {};
    }

    formatI18nDict<T extends { [k: string]: any; }>(key: I18nKey, object: T): { [key in LocaleString]?: string } {
        const dict = this.getI18nDict(key);

        const out: { [key in LocaleString]?: string } = {};

        for (const lang of (Object.keys(dict) as LocaleString[])) {
            out[lang] = format(dict[lang] as string, object);
        }

        return out;
    }

    getI18n(key: I18nKey, lang: string | Interaction = DEFAULT_LANGAGE): string {
        const dict = this.getI18nDict(key);


        return dict[this.getLang(lang)] ?? (dict[DEFAULT_LANGAGE] ?? key);
    }

    formatI18n<T extends { [k: string]: any; }>(key: I18nKey, lang: string | Interaction, object?: T): string {
        if (object === undefined)
            return this.getI18n(key, lang);

        return format(this.getI18n(key, lang), object);
    }

    argumentI18n(command: Command, argument: string) {
        return {
            name: argument,
            name_localizations: I18n.getI18nDict(`command.${command.getName()}.option.${argument}.name`),
            description: I18n.getI18n(`command.${command.getName()}.option.${argument}.description`),
            description_localizations: I18n.getI18nDict(`command.${command.getName()}.option.${argument}.description`),
        }
    }

    choiceI18n(command: Command, argument: string, choice: string) {
        return {
            name: choice,
            name_localizations: I18n.getI18nDict(`command.${command.getName()}.option.${argument}.${choice}.name`),
        }
    }

    getLocales(selected?: I18nKey): MessageSelectOptionData[] {
        const names = this.getI18nDict('locale.name');
        const flags = this.getI18nDict('locale.flag');

        return Object.keys(names).map((locale: I18nKey) => ({
            value: locale,
            label: names[locale as LocaleString] ?? "",
            emoji: flags[locale as LocaleString] ?? "",
            default: selected === locale
        }));
    }
}

export const I18n = new I18nManager();
