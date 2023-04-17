import { HDNodeWallet, ethers } from 'ethers';
import fs from 'fs';
import moment from 'moment';
import axios from 'axios';
import fn from './utils/fn';
import prompts from './utils/prompts';

const BASE_DIR = '_outputs/idents';

const getRandomInt = function () {
    const range = 9999 - 1000
    const rand = Math.random() * range

    return Math.ceil(rand) + 1000
}

const fSave = function (filename: string, raw: string[]) {
    fs.writeFileSync(filename, raw.join('\n'), 'utf8')
}

async function main() {
    const amount = await prompts.askForNumber('How many identities do you need?');
    if (0 < amount) {
        const key = await prompts.askForString('Filename');
        const fnAccounts = `${BASE_DIR}/${key}_accounts.txt`;
        const fnPrivates = `${BASE_DIR}/${key}_privates.txt`;
        const fnTable = `${BASE_DIR}/${key}_table.csv`;

        let accounts: string[] = [];
        let privates: string[] = [];
        let table: string[] = ['#,Address,Username,Gender,Title,Name,State,City,Street,Postcode,Phone,Cell'];

        const savePrivates = await prompts.askForConfirm('Save private keys?');
        const wallets = await fn.deriveWallets(amount);
        const resp = await axios.get(`https://randomuser.me/api/?nat=us&results=${amount}`)
        const idents = resp.data.results;

        // loop with index
        console.log('');
        for (let i = 0; i < wallets.length; i++) {
            const n = i + 1;
            const wallet = wallets[i];
            const address = wallet.address;
            const privKey = wallet.privateKey;

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

            accounts.push(address);
            table.push(`${n},${address},${first}${last}${rand},${gender},${title},${first} ${last},${state},${city},${street},${postCode},${phone},${cell}`);
            if (savePrivates) privates.push(privKey);

            console.log(n, address);
        }

        fSave(fnAccounts, accounts);
        fSave(fnTable, table);
        if (savePrivates) fSave(fnPrivates, privates);
    }

    console.log('');
}

main();
