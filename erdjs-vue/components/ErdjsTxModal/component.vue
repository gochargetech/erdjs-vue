<template>
    <div v-if="txToSign">
        <div class="modal fade show" tabindex="-1">
            <div class="modal-dialog">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">Sign Transaction</h5>
                    </div>
                    <div class="modal-body">
                        <template v-if="getIsXPortalLogin && getWaitingForXportalToSign">
                            <div class="d-flex flex-row align-items-center">
                                <div>
                                    <div class="spinner-border" role="status">
                                        <span class="visually-hidden">Loading...</span>
                                    </div>
                                </div>
                                <div class="fs-4 ms-3">
                                    Check your phone to sign the transaction with xPortal app
                                </div>
                            </div>
                        </template>
                        <template v-else>
                            <div class="mb-3">
                                <div class="fw-bold">Sender address</div>
                                <div class="fw-normal text-break">{{getSenderAddress}}</div>
                            </div>
                            <div class="mb-3">
                                <div class="fw-bold">Receiver address</div>
                                <div class="fw-normal text-break">{{getReceiverAddress}}</div>
                            </div>
                            <div class="mb-3" v-if="getTxValue">
                                <div class="fw-bold">Value</div>
                                <div class="fw-normal text-break">{{ getTxFormattedValue }} {{ getEgldLabel }}</div>
                            </div>
                            <div class="mb-3" v-if="getTxData">
                                <div class="fw-bold">Data</div>
                                <div class="tx-data fw-normal border rounded-2 bg-secondary bg-opacity-10 p-2">
                                    {{getTxData}}
                                </div>
                            </div>
                        </template>
                    </div>
                    <div class="modal-footer flex flex-row justify-content-between">
                        <button @click.prevent="rejectTx()" type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
                        <button @click.prevent="signTx()" type="button" class="btn btn-primary" :disabled="getWaitingForXportalToSign">
                            <span v-if="getWaitingForXportalToSign" class="me-2">
                                <div class="spinner-border spinner-border-sm" role="status">
                                    <span class="visually-hidden">Loading...</span>
                                </div>
                            </span>
                            {{getConfirmButtonLabel}}
                        </button>
                    </div>
                </div>
            </div>
        </div>
        <div class="modal-backdrop fade show"></div>
    </div>
</template>

<script>
import { useSignTransactions } from 'erdjs-vue/hooks/transactions/useSignTransactions';
import { useSignTransactionsCommonData } from 'erdjs-vue/hooks/transactions/useSignTransactionsCommonData';
import { useTransactionsStore } from 'erdjs-vue/store/erdjsTransactions'
import { useDappStore } from 'erdjs-vue/store/erdjsDapp'

import { formatAmount } from 'erdjs-vue/utils/operations/formatAmount';

export default {
    name: 'ErdjsTxModal',
    data() {
        return {
            xportal: 'walletconnectv2',
            waitingForXPortalToSign: false
        }
    },
    computed: {
        getLoginMethod() {
            return this.$erdjs.getDapp().getLoginInfoStore().getLoginMethod;
        },
        getIsXPortalLogin() {
            return this.$erdjs.getDapp().getLoginInfoStore().getLoginMethod === this.xportal;
        },
        getConfirmButtonLabel() {
            return this.getLoginMethod === this.xportal && this.waitingForXPortalToSign
                ? 'Sign on xPortal'
                : 'Confirm';
        },
        getWaitingForXportalToSign() {
            return this.waitingForXPortalToSign;
        },
        myAddress() {
            return this.$erdjs.getDapp().getAccountStore().getAddress;
        },
        txToSign() {
            return this.$erdjs.getDapp().getTransactionsStore().getTransactionsToSign;
        },
        currentTx() {
            return this.txToSign?.transactions[0] ? this.txToSign.transactions[0] : null;
        },
        getModal() {
            return this.$erdjs.getDapp().getNotificationsStore().getNotificationModal;
        },
        address() {
            return this.$erdjs.getDapp().getProviderStore().getCurrent;
        },
        getSenderAddress() {
            return this.currentTx && this.currentTx.sender
                ? this.currentTx.sender
                : '';
        },
        getReceiverAddress() {
            return this.currentTx && this.currentTx.receiver
                ? this.currentTx.receiver
                : '';
        },
        getTxValue() {
            if (this.currentTx && this.currentTx.value) {
                return this.currentTx.value
            }

            return 0;
        },
        getTxData() {
            return this.currentTx && this.currentTx.data
                ? this.currentTx.data
                : '';
        },
        getTxFormattedValue() { 
            return formatAmount({
                input: this.getTxValue,
                addCommas: false,
                showLastNonZeroDecimal: true
            });
        },
        getEgldLabel() { 
            return useDappStore().getEgldLabel;
        }
    },
    mounted() {
        // this.signTx()
        useSignTransactionsCommonData();
    },
    methods: {
        signTx() {
            this.waitingForXPortalToSign = true;
            useSignTransactions();
        },
        rejectTx() {
            useTransactionsStore().clearAllTransactionsToSign();
        }
    }
};
</script>

<style scoped lang="scss">
.modal.show{
    display: block;
}
.tx-data {
    min-height: 75px;
}
</style>