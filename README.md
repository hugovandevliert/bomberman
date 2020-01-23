# bomberman

## Installation

```bash
# clone the repo
git clone https://github.com/hugovandevliert/bomberman

# change the working directory to bomberman
cd bomberman

# install the requirements
npm install
```

## Setup

Because the server uses https, it requires a copy of your SSL `privkey.pem` and `fullchain.pem` keys in the root of the project. 

## Usage

To start the server:

```bash
npm start
```

It is recommended to run the server as a background process using [pm2](https://github.com/Unitech/pm2).

## Authors

Made by [@hugovandevliert](https://github.com/hugovandevliert).

## License

[![MIT](https://img.shields.io/cocoapods/l/AFNetworking.svg?style=style&label=License&maxAge=2592000)](LICENSE)

This software is distributed under the MIT license.
