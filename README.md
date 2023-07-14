# TSS

> Keep SAFE even exposed your Mnemonic...

- [newMnemonic](./md/newMnemonic.md)<br>
  make a new Mnemonic
- [listAddr](./md/listAddr.md)<br>
  list accounts from `Mnemonic` + `Password` and `Account Index`
- [listPriv](./md/listPriv.md)<br>
  list accounts and private keys from ...
- [newIdents](./md/idents.md)<br>
  generate random profiles
- **list721alchemy.ts**<br>
  list ERC721 NFTs for target address using [Alchemy SDK](https://github.com/alchemyplatform/alchemy-sdk-js)
- **list721ethers.ts**<br>
  list ERC721 NFTs for target address using [ethers.js](https://github.com/ethers-io/ethers.js)


## Installation

Install:

- [Node.js](https://nodejs.org/en/) (choose the latest LTS version)
- [Git](https://git-scm.com/)

Run in terminal:

```bash
$ git clone https://github.com/web3jt/tss.git
$ cd tss
$ npm install
# or `yarn`
$ cp config.sample.yaml config.yaml
# if you have `Visual Studio Code` installed
$ code config.yaml
```

Edit your `./config.yaml` as you will


### for canvas

[canvas](https://www.npmjs.com/package/canvas) on MacOS

```bash
$ brew install pkg-config cairo pango libpng jpeg giflib librsvg pixman
```


## Documentations

- [Alchemy SDK](https://docs.alchemy.com/docs)
- [ethers.js](https://docs.ethers.org/v6/)
