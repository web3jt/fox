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
#
# ✔ How many identities do you need? … 5
# ✔ Filename … sample
# 
# 1 StephenKim1620
# 2 PaulSimmmons7580
# 3 RubenNelson8239
# 4 DaveHudson2616
# 5 RitthyWatts5611
```

Then you will get a dateset, include:

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


They are saved at `./outputs/idents/sample.csv`

> You can open `.csv` with:
> - `Numbers.app` on Mac
> - `Excel` on Windows


```text
#,Username,Gender,Title,Name,State,City,Street,Postcode,Phone,Cell
1,StephenKim1620,male,Mr,Stephen Kim,Tennessee,Richardson,4531 Depaul Dr,17569,(936) 629-3911,(754) 973-4113
2,PaulSimmmons7580,male,Mr,Paul Simmmons,Colorado,Moreno Valley,8894 Bruce St,15267,(471) 536-3789,(485) 591-8269
3,RubenNelson8239,male,Mr,Ruben Nelson,South Carolina,Davenport,8565 Wheeler Ridge Dr,49902,(455) 746-8433,(648) 937-9796
4,DaveHudson2616,male,Mr,Dave Hudson,California,Grand Rapids,5434 Adams St,89989,(433) 957-2432,(650) 290-4336
5,RitthyWatts5611,male,Mr,Ritthy Watts,Alabama,Evansville,1416 Spring St,26215,(660) 729-2679,(710) 261-9534
```
