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

import { XMLParser } from 'fast-xml-parser';
import { Api } from '../base/Api';

type NextData = {
    prochainADiscuter: {
        bibard: string,
        bibardSuffixe: string,
        numAmdt: string,
        legislature: string,
        organeAbrv: string
    }
};

type TextIdentifier = {
    organe: string,
    bibard: string,
    bibardSuffixe: string
};

class EliasseAPIManager extends Api {
    private parser: XMLParser;

    constructor() {
        super();
        this.parser = new XMLParser({
            ignoreAttributes: false,
            preserveOrder: true,
            unpairedTags: ["hr", "br", "link", "meta"],
            stopNodes: ["*.pre", "*.script"],
            processEntities: true,
            htmlEntities: true,
            alwaysCreateTextNode: true,
            textNodeName: "#text"
        });
    }

    async load_next(texte: TextIdentifier) {
        return await this.request("GET", `https://eliasse.assemblee-nationale.fr/eliasse/prochainADiscuter.do?_dc=${(new Date()).getTime()}&page=1&start=0&limit=25`, undefined, {
            FOSUSED_ORGANE: texte.organe,
            FOSUSED_BIBARD: texte.bibard,
            FOSUSED_BIBARD_SUFFIXE: texte.bibardSuffixe
        });
    }

    async next(texte: TextIdentifier): Promise<NextData> {
        const res = await this.load_next(texte);

        if (!res.good) {
            return Promise.reject();
        } else {
            return res.data as NextData;
        }
    }
}

export const EliasseAPI = new EliasseAPIManager();
