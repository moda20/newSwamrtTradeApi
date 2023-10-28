# Uniswap V2 Dry Run API Server

The Uniswap V2 Dry Run API Server is a Node.js Express.js application that allows you to perform dry runs of Uniswap V2
calls on forked networks using Ganache. It also enables you to run multiple swaps with custom configurations.
Additionally, you can select the target node and specify from which block to fork.

## Features

- Dry run Uniswap V2 calls on forked networks using Ganache.
- Run multiple swaps with customizable configurations using the uniswap contracts or using a custom smartTrade solidity Contract
- Choose the target node and specify the block from which to fork.

## Prerequisites

Before getting started, make sure you have the following installed:

- [Node.js](https://nodejs.org/)
- [npm](https://www.npmjs.com/)
- [Ganache](https://www.trufflesuite.com/ganache)

## Installation

1. Clone the project repository:

```bash
git clone https://github.com/yourusername/uniswap-dry-run-api-server.git
```

Change to the project directory:

```bash
cd uniswap-dry-run-api-server
```
Install the project dependencies:

```bash
npm install
```
### Configuration

The configuration file config/node.yml allows you to specify the following settings:

rpcNodes: Number of nodes to start with the server.
exec_node: nodes to run actual live transactions (not dry run).

### Usage

Start the Uniswap V2 Dry Run API Server:

```bash
npm start
```

Access the API endpoints to perform dry runs and run swaps.

### API Endpoints

* POST /api/SingleSwap: Perform a single swap with the possibility of running a dry run, or multiple consecutive swaps including many token hops.
* POST /api/depositWBNB: Deposit WBNB a standard ERC20 token with a ratio of 1 to 1 with BNB (can be used really for any tokens like WETH).
* POST /api/getBalance: returns the balance of a user in a specific token 
* POST /api/getAmountsOut: Calculates the amountsOut of a swap based on a list of swap tokens
* POST /api/getAmountsIn: Calculates the amountsIn of a swap based on a list of swap tokens
* POST /api/dryExecute: Execute a list of swaps based on a token Path with the goal of acquiring a minimum of profit (arbitrage based)
* POST /api/reserves: read the reserves from the local database for all tokens


### Contributing
If you would like to contribute to this project, please open pull requests with descriptions or start by creating an issue.

### License
This project is licensed under the MIT License.

### Links
* [Uniswap V2](https://uniswap.org/)
* [Ganache](https://www.trufflesuite.com/ganache)


### Contact
For questions or support, please contact kadhem03@gmail.com

