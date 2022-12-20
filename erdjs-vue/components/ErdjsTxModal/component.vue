<template>
    <div v-if="txToSign">
        <div class="modal fade show" tabindex="-1">
            <div class="modal-dialog">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">Sign Transaction</h5>
                    </div>
                    <div class="modal-body">
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
                    </div>
                    <div class="modal-footer flex flex-row justify-content-between">
                        <button @click.prevent="rejectTx()" type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
                        <button @click.prevent="signTx()" type="button" class="btn btn-primary">Confirm</button>
                    </div>
                </div>
            </div>
        </div>
        <div class="modal-backdrop fade show"></div>
    </div>
</template>

<script>
import { useSignTransactions } from 'erdjs-vue/hooks/transactions/useSignTransactions'
import { useTransactionsStore } from 'erdjs-vue/store/erdjsTransactions'
import { useDappStore } from 'erdjs-vue/store/erdjsDapp'

import { formatAmount } from 'erdjs-vue/utils/operations/formatAmount';

export default {
    name: 'ErdjsTxModal',
    computed: {
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
    methods: {
        signTx() {
            const {
                callbackRoute,
                transactions,
                error,
                sessionId,
                onAbort,
                hasTransactions,
                canceledTransactionsMessage
            } = useSignTransactions();
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