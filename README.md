# erdjs-vue

> A Vue.js library that holds the core functional logic of a dapp on the MultiversX (formerly Elrond)

[Live demo](https://erdjs-vue.gocharge.tech)

To see *plugin* source code, check the `erdjs-vue` directory in [current repo](https://github.com/gochargetech/erdjs-vue/tree/production/erdjs-vue).

To see *demo* source code, check the `src` directory in [current repo](https://github.com/gochargetech/erdjs-vue/tree/production/src).

## About
`erdjs-vue` is inspired from [dapp-core](https://github.com/ElrondNetwork/dapp-core/). 
We're using `Pinia` to replace redux.

It's work in progress, current version includes login functionality & signing transactions. More to be added in near future. 

Use [issues section](https://github.com/gochargetech/erdjs-vue/issues/new) to report bugs or suggest feature requests.

Contributions are welcome - [PR from your branch](https://github.com/gochargetech/erdjs-vue/compare)

## Project Setup

```sh
npm install erdjs-vue
```

### Using with vue3

```sh
import { erdjsVue } from 'erdjs-vue';

// Create app.
const app = createApp(App)

// Init erdjs-vue.
const erdjs = erdjsVue({
  loadCss: false,
  chain: 'devnet'
});
app.use(erdjs)

// Mount app.
app.mount('#app')
```
For styling, we've added bootstrap classes in our components. If you want to apply styling, you'll have to import bootstrap in your app. In the main css/scss file:
```
// Add bootstrap to our styles 
@import "~bootstrap/scss/bootstrap";
```


There is one mandatory component to be loaded:
```
<ErdjsFooter />
```
It will display the sign transaction modal and transaction status toasts.

To display login page, use the following component:
```
<ErdjsLogin />
```

Transactions can be signed with Global property `$erdjs` as follows:
```
const tx = {
    value: '100000000000000000',
    data: 'ping',
    receiver: 'erd1g5dqap37a650g564nsehjwxd9m3pzgxla83pcd3w7f5s8lgxq9eq3g884u'
};

this.$erdjs.dapp.sendTransaction(tx).then(({ sessionId, error }) => {
    if (error) { 
        alert(error)
    }
});
```

Get current network config:
```
this.$erdjs.dapp.getNetworkConfig()
```

Get Pinia stores:
`getDappStore`, `getAccountStore`, `getLoginInfoStore`, `getNotificationsStore`, `getProviderStore`, `getToastsStore`, `getTransactionsStore`, `getTransactionsInfoStore`; Probably you'll not need all of them, but it's good to have them available.

Few examples on how to use Pinia getters to retrieve user/account data:
- check if user is logged in `this.$erdjs.dapp.getLoginInfoStore().isLoggedIn`
- get account address `this.$erdjs.dapp.getAccountStore().getAddress`
- get account balance `this.$erdjs.dapp.getAccountStore().getAccountBalance`
- get account nonce `this.$erdjs.dapp.getAccountStore().getAccountNonce`
- get account `this.$erdjs.dapp.getAccountStore().getAccount` will return type of `AccountType`
- get network config `this.$erdjs.dapp.getDappStore().getNetworkConfig`
- get network chain id `this.$erdjs.dapp.getDappStore().getChainId`
- get network api address `this.$erdjs.dapp.getDappStore().getApiAddress`
- get egld label `this.$erdjs.dapp.getDappStore().getEgldLabel`  (EGLD, xEGLD, etc)
- get login method `this.$erdjs.dapp.getLoginInfoStore().getLoginMethod` (extension, walletconnect, etc)


To be updated...
