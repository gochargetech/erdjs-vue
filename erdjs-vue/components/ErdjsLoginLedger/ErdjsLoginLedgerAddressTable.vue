<template>
    <div class="erdjs-vue__login-wrappper px-2 text-center" v-if="showAddressList">
        <div class="row justify-content-center">
            <div class="col-12 col-lg-8">
                <div class="card mb-4">
                    <div class="card-header">
                        Ledger Login
                    </div>
                    <div class="card-body">
                        <template v-if="isConfirmationModalVisible">
                            <div class="d-flex flex-column justify-content-center">
                                <strong mb-2>For security, please confirm that your address:</strong>
                                <code class="mb-2">
                                    {{ getAddress }}
                                </code>
                                <template v-if="getLoginToken">
                                    <strong>and Auth Token: </strong>
                                    <code class="mb-2">{{ getLoginToken }}</code>
                                </template>
                                <strong>is displayed on your Ledger device screen now.</strong>
                            </div>
                        </template>
                        <template v-else>
                            <div class="dapp-login__tab-error" v-if="getErrorMessage">
                                <div class="text-danger mb-3">{{ getErrorMessage }}</div>
                            </div>
                            <template v-if="!getIsLoading && getAccounts">
                                <div class="mb-3">
                                    <strong>Access your wallet</strong>
                                    <p>Choose the wallet you want to access</p>
                                </div>
                                <ul>
                                    <li v-for="(address, aIndex) in getAccounts" v-bind:key="`ledger-account-${aIndex}`"
                                        @click.prevent="selectLedgerAddress(address, aIndex)"
                                        class="d-flex flex-row justfy-contente-between mb-2 ledger-account">
                                        <span>[{{ getAddressIndex(aIndex) }}] {{ address }}</span>
                                    </li>
                                </ul>
                                <div v-if="getAccounts.length > 0" class="d-flex flex-row justify-content-center gap-3">
                                    <button @click.prevent="prevPage()" class="btn btn-link" disabled="isFirstPage">Previous</button>
                                    <button @click.prevent="nextPage()" class="btn btn-link">Next</button>
                                </div>
                            </template>
                            <div v-if="getIsLoading" class="d-flex flex-column justify-contente-center align-items-center">
                                <strong class="mb-2">Loading Ledger Accounts...</strong>
                                <div class="spinner-border" style="width: 3rem; height: 3rem;"  role="status">
                                    <span class="visually-hidden">Loading ledger addresses...</span>
                                </div>
                            </div>
                        </template>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import { useLedgerStore } from 'erdjs-vue/store/erdjsLedger';
import { useLoginInfoStore } from 'erdjs-vue/store/erdjsLoginInfo';

export default {
    name: 'ErdjsLoginLedgerAddressTable',
    data() {
        return {
            showConfirmationModal: false
        }
    },
    beforeUnmount() {
        useLedgerStore().logout();
    },
    computed: {
        getAccounts() {
            return useLedgerStore().getAccounts;
        },
        getAddress() {
            return useLedgerStore().getSelectedAddress.address;
        },
        getLoginToken() {
            return useLoginInfoStore().getTokenLogin?.loginToken;
        },
        showAddressList() {
            return useLedgerStore().showAddressList;
        },
        getErrorMessage() {
            return useLedgerStore().getErrorMessage;
        },
        getIsLoading() {
            return useLedgerStore().getIsLoadingAccounts;
        },
        isFirstPage() {
            return useLedgerStore().getStartIndex === 0;
        },
        isConfirmationModalVisible() {
            return this.showConfirmationModal;
        }
    },
    methods: {
        selectLedgerAddress(address, index) {
            const aIndex = this.getAddressIndex(index);
            useLedgerStore().setSelectedAddress({
                address,
                index: aIndex,
            })
            this.showConfirmationModal = true;
        },
        nextPage() {
            useLedgerStore().changePage('next')
        },
        prevPage() {
            useLedgerStore().changePage('next')
        },
        getAddressIndex(index) {
            return 10 * useLedgerStore().getStartIndex + index;
        },
    }
};
</script>

<style scoped>
.ledger-account {
    cursor: pointer;
}
</style>