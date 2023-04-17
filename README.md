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
# ✔ How many identities do you need? … 5
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
```
