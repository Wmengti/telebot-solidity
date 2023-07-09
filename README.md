# solidity-develop-template

## Quickstart
```
git clone https://github.com/Wmengti/solidity-develop-template.git
cd solidity-develop-template
yarn set version 1.22.19   # can skip if your default version is already 1.x.x
yarn
```

## test
```
yarn test
```

## deploy
```
//local
hh deploy
//polygonMumbai
hh deploy --network polygonMumbai

```

## Linting and Formatting
```
    "lint": "npm run lint:contracts && npm run format:check",
    "lint:fix": "solhint 'contracts/**/*.sol' --fix",
    "lint:contracts": "solhint 'contracts/*.sol'",
    "lint:contracts:fix": "solhint 'contracts/**/*.sol' --fix",
    "format:check": "prettier --check .",
    "format:fix": "prettier --write ."  
```
when git commit sumbitting, the husy will auto format.

## audit analysis
**slither**
```
"slither": "slither . --filter-paths 'node_modules/'"
```