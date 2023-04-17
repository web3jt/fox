# TSS

- [ethers.js](https://docs.ethers.org/v6/)


## Installation

Install:

- [Node.js](https://nodejs.org/en/) (choose the latest LTS version)
- [Git](https://git-scm.com/)

Make a new directory and run:

```bash
$ git clone https://github.com/web3jt/tss.git
$ cd tss
$ npm install
# or `yarn`
$ cp config.sample.yaml config.yaml
```

Edit your `./config.yaml`


## bulk identities

```bash
$ ts-node newIdents.ts
# ✔ How many identities do you need? … 20
# ✔ Filename … sample
# ✔ Save private keys? (y/N) … n
# 
# --------- --------- Derive Wallet Accounts --------- ---------
# ✔ Mnemonic: invite adult ... stand purse (y/N) … y
# ✔ BIP39 Passphrase … ********
# ✔ Wallet #0: 0x0a9905274F14cb4F2C4543EC85Da17EdF709208f (y/N) … y
# ✔ Account#_ … ****
# ✔ Account#0: 0x14295298E99c0852811c933AD9dC80F78E6Fb2cC (y/N) … y
# 
# 1 0x14295298E99c0852811c933AD9dC80F78E6Fb2cC
# 2 0x59b03Bfc06059D7b579de160f15a3a08444f4A46
# 3 0x244C3f3Fd5338Cc56E4d567239354Ce3Ddf9D9B8
# 4 0xF473199CC4132984f2FDAe7a1d7e779bD2B41F3b
# 5 0x6019c6A8A3C866AC655d1900789e67A7DCeDF03b
# 6 0x37036C8C5760B15452dD2A1e1eA09d3a56d2d8c6
# 7 0x0d55F117Fb1917c4e4997b7175265A3Ce39804d1
# 8 0x8Aac669f3BF4791D60f991d78f3031F4418b0e08
# 9 0x5704Cc70Fc6B5649109C5BF01d6D0826F9D6778e
# 10 0x883661FD8b022B053C5b26eeCdCb31ED64e7CeB2
# 11 0x6F91F1E95fc7D5092dF086416b6467d9edfA9655
# 12 0xB492E142ac445c1Cc84eaDF6A3872F7734C4A29f
# 13 0xCE4c236a63253a461a4646Dd42cA3521EBe18FB9
# 14 0xA1BdcbB75Ae883707Bc40b1dB3FDd6f34802E334
# 15 0xd17259B5A79F4F23AAB1f8bF5C7f06D94c09B7d4
# 16 0xb169f9761B817d8395b192Ff0975dC8b3ADcc24D
# 17 0x7A120D24640737E37e2E27Cd0aeABE1b8B7d9258
# 18 0xe0A96dFdc8Dd65FC6041dC214bce756dED45fc47
# 19 0x7ae6D94F4851Bef522b735C6989eFDd5E79aF525
# 20 0x71E5df214bEF83f34F0686968257bcc6234453e3
```

- **Filename** is the key word for your date files
- **Save private keys? (y/N)** `N` is recommanded that you can list the private keys by running `listPriv.txt`
- **Mnemonic** is your mnemonic in `./config.yaml`
- **BIP39 Passphrase** is the password for your mnemonic
- **Wallet #0** is the `Base Wallet` that you can confirm have entered the right password
- **Account#_** is the `Account Index` you wanna derive from the `Base Wallet`, called `Rebased Wallet`
- **Account#0** is the `Rebased Wallet #0` address for confirmation

Then you will get a dateset, include:

- Wallet Address
- Username
- Gender
- Title
- Name
- State
- City
- Street
- Postcode / ZIP
- Phone number
- Cell number


They are saved in files:

File `./outputs/idents/sample_accounts.txt`

```text
0x14295298E99c0852811c933AD9dC80F78E6Fb2cC
0x59b03Bfc06059D7b579de160f15a3a08444f4A46
0x244C3f3Fd5338Cc56E4d567239354Ce3Ddf9D9B8
0xF473199CC4132984f2FDAe7a1d7e779bD2B41F3b
0x6019c6A8A3C866AC655d1900789e67A7DCeDF03b
0x37036C8C5760B15452dD2A1e1eA09d3a56d2d8c6
0x0d55F117Fb1917c4e4997b7175265A3Ce39804d1
0x8Aac669f3BF4791D60f991d78f3031F4418b0e08
0x5704Cc70Fc6B5649109C5BF01d6D0826F9D6778e
0x883661FD8b022B053C5b26eeCdCb31ED64e7CeB2
0x6F91F1E95fc7D5092dF086416b6467d9edfA9655
0xB492E142ac445c1Cc84eaDF6A3872F7734C4A29f
0xCE4c236a63253a461a4646Dd42cA3521EBe18FB9
0xA1BdcbB75Ae883707Bc40b1dB3FDd6f34802E334
0xd17259B5A79F4F23AAB1f8bF5C7f06D94c09B7d4
0xb169f9761B817d8395b192Ff0975dC8b3ADcc24D
0x7A120D24640737E37e2E27Cd0aeABE1b8B7d9258
0xe0A96dFdc8Dd65FC6041dC214bce756dED45fc47
0x7ae6D94F4851Bef522b735C6989eFDd5E79aF525
0x71E5df214bEF83f34F0686968257bcc6234453e3
```

File `./outputs/idents/sample_table.csv`

> You can open `.csv` with:
> - `Numbers.app` on Mac
> - `Excel` on Windows


```text
#,Address,Username,Gender,Title,Name,State,City,Street,Postcode,Phone,Cell
1,0x14295298E99c0852811c933AD9dC80F78E6Fb2cC,BeverleyGray8582,female,Ms,Beverley Gray,Arizona,Corpus Christi,8658 Daisy Dr,97376,(675) 339-0259,(806) 326-8710
2,0x59b03Bfc06059D7b579de160f15a3a08444f4A46,ClaudePalmer6176,male,Mr,Claude Palmer,Colorado,Atlanta,551 College St,51452,(930) 833-2551,(725) 412-0195
3,0x244C3f3Fd5338Cc56E4d567239354Ce3Ddf9D9B8,AlexRamos8505,male,Mr,Alex Ramos,Virginia,Kent,6478 W Gray St,99696,(204) 774-0779,(551) 218-3603
4,0xF473199CC4132984f2FDAe7a1d7e779bD2B41F3b,HildaGonzales7333,female,Ms,Hilda Gonzales,Massachusetts,College Station,7086 Smokey Ln,67946,(391) 421-6010,(831) 486-4282
5,0x6019c6A8A3C866AC655d1900789e67A7DCeDF03b,JackFisher9331,male,Mr,Jack Fisher,Oregon,Evansville,6270 Central St,74543,(292) 788-7788,(403) 676-4602
6,0x37036C8C5760B15452dD2A1e1eA09d3a56d2d8c6,JarClark7513,male,Mr,Jar Clark,Idaho,Santa Clara,9920 Valwood Pkwy,65314,(506) 764-2976,(876) 427-8310
7,0x0d55F117Fb1917c4e4997b7175265A3Ce39804d1,RebeccaAdams3441,female,Mrs,Rebecca Adams,Nevada,Tucson,451 Plum St,81551,(284) 728-7220,(899) 763-9592
8,0x8Aac669f3BF4791D60f991d78f3031F4418b0e08,EdwinShelton8797,male,Mr,Edwin Shelton,New Hampshire,El Monte,4767 Miller Ave,14317,(911) 245-4557,(216) 852-7857
9,0x5704Cc70Fc6B5649109C5BF01d6D0826F9D6778e,SandraGibson6999,female,Mrs,Sandra Gibson,Montana,Steilacoom,9445 Oak Lawn Ave,16713,(970) 270-7798,(240) 843-0819
10,0x883661FD8b022B053C5b26eeCdCb31ED64e7CeB2,PaulHolt1096,male,Mr,Paul Holt,Virginia,Palm Bay,8111 Lakeview St,15758,(591) 624-2281,(799) 467-7700
11,0x6F91F1E95fc7D5092dF086416b6467d9edfA9655,AndreaSoto9735,female,Miss,Andrea Soto,Rhode Island,Topeka,1381 Rolling Green Rd,75538,(988) 876-9873,(473) 739-2330
12,0xB492E142ac445c1Cc84eaDF6A3872F7734C4A29f,PedroPena1614,male,Mr,Pedro Pena,North Carolina,San Diego,7830 Cherry St,69448,(584) 217-7217,(444) 581-0463
13,0xCE4c236a63253a461a4646Dd42cA3521EBe18FB9,MaxineJensen6983,female,Ms,Maxine Jensen,Louisiana,Newport News,3751 Thornridge Cir,52571,(261) 980-3960,(353) 719-9898
14,0xA1BdcbB75Ae883707Bc40b1dB3FDd6f34802E334,EllenHayes7182,female,Miss,Ellen Hayes,Ohio,Charleston,2302 Preston Rd,13326,(730) 845-4120,(253) 700-1632
15,0xd17259B5A79F4F23AAB1f8bF5C7f06D94c09B7d4,ChrisBrown8599,male,Mr,Chris Brown,Alaska,Wilmington,9938 Hamilton Ave,70391,(751) 869-6355,(517) 476-9515
16,0xb169f9761B817d8395b192Ff0975dC8b3ADcc24D,CoreyCox1162,male,Mr,Corey Cox,Kansas,Lakewood,7252 Elgin St,65514,(603) 589-1648,(200) 598-7857
17,0x7A120D24640737E37e2E27Cd0aeABE1b8B7d9258,NoahFox9729,male,Mr,Noah Fox,South Carolina,West Covina,6321 Lakeshore Rd,44854,(838) 630-0001,(891) 379-7530
18,0xe0A96dFdc8Dd65FC6041dC214bce756dED45fc47,AnnObrien4769,female,Miss,Ann Obrien,Colorado,Lansing,5673 Brown Terrace,40896,(325) 479-8310,(327) 844-2908
19,0x7ae6D94F4851Bef522b735C6989eFDd5E79aF525,DanielPatterson3738,male,Mr,Daniel Patterson,Kentucky,Indianapolis,3589 Thornridge Cir,73740,(586) 471-3330,(779) 624-6611
20,0x71E5df214bEF83f34F0686968257bcc6234453e3,JudyKelley2766,female,Ms,Judy Kelley,North Carolina,Milwaukee,8693 Taylor St,65330,(324) 363-9887,(849) 957-7592
```
