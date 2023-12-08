# 部分自用的脚本

Keep SAFE even exposed your Mnemonic...


## 安装环境

- 首选 MacOS 系统（不过 Windows 也能用）
- [Node.js](https://nodejs.org/en/) 选最新的 LTS 这是运行脚本的主要环境
- [Git](https://git-scm.com/) 用于代码下载，版本同步
- yarn<br>
  用于安装依赖
- 最好再装个 vscode<br>
  用于编辑配置文件

这些东西会经常用到，所以最好都装上，方便



## 初始化

在一个专用的文件夹下打开 terminal 然后下载脚本库，并这装依赖

```bash
$ git clone https://github.com/web3jt/tss.git
$ cd tss
$ yarn
# 或 npm install
```

将 `config.sample.yaml` 复制为 `config.yaml` 并编辑

```bash
$ cp config.sample.yaml config.yaml
$ code config.yaml
```

待编辑的内容

```yaml
MNEMONIC: invite adult amount position enable edge song episode cross cotton stand purse

EVM:
  NETWORK: BSC_MAINNET
  INSCRIPTION_DATA: data:,{"p":"bsc-20","op":"mint","tick":"rekt","amt":"1000"}

EVM_NETWORKS:
  ETH_MAINNET: https://eth-mainnet.g.alchemy.com/v2/...
  ETH_SEPOLIA: https://eth-sepolia.g.alchemy.com/v2/...
  BSC_MAINNET: https://bsc-dataseed.binance.org
  ETHW: https://mainnet.ethereumpow.org
```

- `MNEMONIC` 改成你自己的助记词
- `EVM` 下 `NETWORK` 指定为你要使用的网络，下边的 `EVM_NETWORKS` 是网络列表，可以根据需要增减
- `INSCRIPTION_DATA` 就是用于 `inscription` 文本了，打批量的时候记得在这里改好
- `EVM_NETWORKS` 下的各 EVM 网络地址，可以从 [Alchemy](https://www.alchemy.com/) 申请，ETH 网络主要都在 Alchemy 就行，限额比较宽，基本不用担心免费调用次数耗尽的问题，其它网络就自己找一下，一般在 [RPC INFO](https://rpc.info/) 或 [Chainlist](https://chainlist.org/) 都能能找到大把，比如已经写好的 BSC 主网和 ETHW 主网的 RPC 都已经是直接能用的了

助记词去搞一套新的，

```bash
$ ts-node newMnemonic.ts
```

就不用担心这里的明文储存，因为整个这个库的所有脚本用到钱包时，都会再输入一个助记词密码再去推导种子，再去推导不同 BIP44 path 的钱包


## 批量打 EVM 铭文

上边所有东西都配齐了？

那用一个例子来进行说明吧

```bash
$ ts-node evmInscribe.ts
```

步步交互

```text
--------- --------- EVM Inscription --------- ---------
DATA: data:,{"p":"fair-20","op":"mint","tick":"fair","amt":"1000"}
 HEX: 0x646174613a2c7b2270223a22666169722d3230222c226f70223a226d696e74222c227469636b223a2266616972222c22616d74223a2231303030227d


--------- --------- EVM Network --------- ---------
✔ Use ETH_SEPOLIA network? (y/N) … y      - 确认使用的 EVM 网络

--------- --------- Derive Wallet Accounts --------- ---------
✔ Mnemonic: develop when ... cry milk (y/N) … y      - 确认助记词
✔ BIP39 Passphrase … ***                             - 输入助记词密码，确保安全推导钱包种子
✔ Wallet #0: 0xdEE20c37B0cC0F1ec5Fa75f7c2723bEc0c0cb072 (y/N) … y      - 种子下的第一个根钱包地址（用于识别）
✔ Account#_ … 0                                      - 输入使用哪个序号的钱包
✔ Account#0: 0xdEE20c37B0cC0F1ec5Fa75f7c2723bEc0c0cb072 (y/N) … y      - 确认是你要用的地址
✔ Balance: 0.99924050458130472 E (y/N) … y           - 当前余额
✔ Nonce would start at … 12
    - 该钱包的交易序号，默认回车就行，如果是加 gas 的重新运行，就需要手动输入来广播覆盖之前发出去的交易

--------- --------- Current GAS Data --------- ---------
    Base Fee: 4.798849245 GWei
Priority Fee: 0.000000011 GWei
     Max Fee: 9.597698479 GWei

✔ Enter max fee: … 7
✔ Enter priority fee: … 1
✔ How many inscriptions do you want, max to 6500 … 3        - 要打多少张铭文，这里会根据你的余额和 gas 估算出来最多能打多少张
✔ Total spent: 0.00015372 x 3 = 0.00046116 E (y/N) … y      - 确认总共花费

12 0xad604acabbfd87c3a7b3c09e23d6bd69473794211afdcd1dd6745334cf0e8bb3      - 从这里开始是每一笔打出的交易哈希
13 0x126530befb473ab8081df3ac9b1cbb728d7639a3b89984171daa993b28af4cf4
14 0x080004a16aa81a3f87999d0322e4d2737ea875df986cf69762f7a964835f34b7
```

然后去浏览器看记录就好了

需要说的是，虽然开源，但自己用就好了，没必要广泛传播

