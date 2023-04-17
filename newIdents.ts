import fs from 'fs';
import axios from 'axios';
import prompts from './utils/prompts';

const BASE_DIR = '_outputs/idents';

const getRandomInt = function (): number {
    const range = 9999 - 1000;
    const rand = Math.random() * range;

    return Math.ceil(rand) + 1000;
}

const fSave = function (filename: string, raw: string[]) {
    fs.writeFileSync(filename, raw.join('\n'), 'utf8')
}

async function main() {
    console.log('');
    const amount = await prompts.askForNumber('How many identities do you need?');
    if (0 < amount) {
        const key = await prompts.askForString('Filename');
        const fnTable = `${BASE_DIR}/${key}.csv`;

        let table: string[] = ['#,Username,Gender,Title,Name,State,City,Street,Postcode,Phone,Cell'];

        const resp = await axios.get(`https://randomuser.me/api/?nat=us&results=${amount}`)
        const idents = resp.data.results;

        // loop with index
        console.log('');
        for (let i = 0; i < amount; i++) {
            const n = i + 1;

            const ident = idents[i];
            const first = ident.name.first;
            const last = ident.name.last;
            const rand = getRandomInt();
            const gender = ident.gender;
            const title = ident.name.title;
            const state = ident.location.state;
            const city = ident.location.city;
            const street = `${ident.location.street.number} ${ident.location.street.name}`;
            const postCode = ident.location.postcode;
            const phone = ident.phone;
            const cell = ident.cell;

            table.push(`${n},${first}${last}${rand},${gender},${title},${first} ${last},${state},${city},${street},${postCode},${phone},${cell}`);

            console.log(n, `${first}${last}${rand}`);
        }

        fSave(fnTable, table);
    }

    console.log('');
}

main();
