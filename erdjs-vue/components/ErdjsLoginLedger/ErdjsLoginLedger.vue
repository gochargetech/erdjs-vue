<template>
    <div class="erdjs-vue__login-wrappper px-2 text-center">
        <div class="dapp-login__tab-error" v-if="error">
            {{ error }}
        </div>
        <h4 class="mb-3">MultiversX login</h4>
        
        <div v-if="!showAddressList" class="mb-3">
            <strong>Connect Ledger</strong>
            <p>Unlock your device & open the MultiversX App</p>
            <button @click.prevent="login()" class="btn btn-primary">Connect Ledger</button>
        </div>

        <ErdjsLoginLedgerAddressTable />

        <div class="back-button">
            <button @click.prevent="$emit('hide-login-tab')" class="btn btn-secondary">Back</button>
        </div>
    </div>
</template>

<script>
import { useLedgerLogin } from 'erdjs-vue/hooks/login/useLedgerLogin';
import { useLedgerStore } from 'erdjs-vue/store/erdjsLedger';
import ErdjsLoginLedgerAddressTable from './ErdjsLoginLedgerAddressTable.vue'

export default {
    name: 'ErdjsLoginLedger',
    components: {
        ErdjsLoginLedgerAddressTable
    },
    data() {
        return {
            error: null,
        }
    },
    props: {
        selectedMode: {
            type: String,
            default: ''
        }
    },
    computed: {
        getAccounts() {
            return useLedgerStore().getAccounts;
        },
        showAddressList() {
            return useLedgerStore().showAddressList;
        },
    },
    methods: {
        login() {
            const [
                onStartLogin,
            ] = useLedgerLogin({
                callbackRoute: '/',
            });

            onStartLogin();
        }
    }
};
</script>
