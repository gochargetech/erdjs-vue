<template>
    <div>
        <div :class="['toast erdjs-vue--toast', { 'show': show }, getBorderColor]" role="alert" aria-live="assertive"
            aria-atomic="true">
            <div :class="['toast-header d-flex justify-content-between']">
                <div class="left">
                    <template v-if="getIsPending">
                        <div class="spinner-border spinner-border-sm" role="status">
                            <span class="sr-only"></span>
                        </div>
                    </template>
                    <template v-if="getIsTimedOut">
                        <span class="badge bg-danger">x</span>
                    </template>
                    <template v-if="getTxStatus === 'success'">
                        <span class="badge bg-success">&#x2713;</span>
                    </template>
                    <template v-if="getTxStatus === 'fail'">
                        <span class="badge bg-danger">&#x2713;</span>
                    </template>
                    <strong class="mx-2">{{ getTxTitle }}</strong>
                </div>
                <button type="button" class="ml-2 mb-1 close btn btn-light" data-dismiss="toast" aria-label="Close"
                    @click="closeThis(toast.toastId)">
                    <span aria-hidden="true">&times;</span>
                </button>
            </div>
            <div class="toast-body">
                <template v-if="getTxHash">
                    <a :href="getExplorerUrl" target="_blank">{{ getTxHash }}</a>
                </template>
            </div>
        </div>
    </div>
</template>

<script>
import { useGetTransactionDisplayInfo } from 'erdjs-vue/hooks/transactions/useGetTransactionDisplayInfo';
import { AVERAGE_TX_DURATION_MS, CROSS_SHARD_ROUNDS } from 'erdjs-vue/constants/index';
import {
    getIsTransactionPending,
    getIsTransactionTimedOut
} from 'erdjs-vue/utils/transactions/transactionStateByStatus';
import { getToastDataStateByStatus } from 'erdjs-vue/utils/transactions/getToastDataStateByStatus';
import { useTransactionsStore } from 'erdjs-vue/store/erdjsTransactions';
import { useToastsStore } from 'erdjs-vue/store/erdjsToasts';

import { useGetNetworkConfig } from 'erdjs-vue/hooks/useGetNetworkConfig';
import { getExplorerLink } from 'erdjs-vue/utils/transactions/getInterpretedTransaction/helpers/getExplorerLink';
import { explorerUrlBuilder } from 'erdjs-vue/utils/transactions/getInterpretedTransaction/helpers';
import { removeSignedTransaction } from 'erdjs-vue/services';

export default {
    name: 'ErdjsToast',
    props: {
        toastId: {
            type: String,
            default: ''
        },
        toast: {
            default: {}
        },
    },
    data() {
        return {
            show: true,
        }
    },
    mounted() {
        // TODO: implement shard logic here.
        // const shardAdjustedDuration = CROSS_SHARD_ROUNDS * AVERAGE_TX_DURATION_MS;

        // TODO: implment auto destroy component with timeout.
        // const transactionDuration = transactionDisplayInfo?.transactionDuration || shardAdjustedDuration;
        if (!this.getTx?.transactions) {
            this.closeThis(this.toastId);
        }
    },
    computed: {
        getTx() {
            return useTransactionsStore().getTransaction(this.toastId);
        },
        getTxStatus() {
            return useTransactionsStore().getTransactionStatus(this.toastId);
        },
        getTxTitle() {
            return this.getToastData?.title ? this.getToastData.title : '';
        },
        getTxDisplayInfo() {
            return useGetTransactionDisplayInfo(this.toastId)
        },
        getToastData() {
            return getToastDataStateByStatus({
                status: this.getTxStatus,
                toastId: this.toastId,
                transactionDisplayInfo: this.getTxDisplayInfo
            });
        },
        getIsPending() {
            return getIsTransactionPending(this.getTxStatus);
        },
        getIsTimedOut() {
            return getIsTransactionTimedOut(this.getTxStatus);
        },
        getBorderColor() {
            let borderColor = '';
            switch (this.getTxStatus) {
                case 'fail':
                    borderColor = 'border-danger';
                    break;
                case 'success':
                    borderColor = 'border-success';
                    break;
            }

            return borderColor;
        },
        getTxHash() {
            if (!this.getTx?.transactions) {
                return '';
            }

            const tx = this.getTx.transactions[0];
            if (!tx?.hash) {
                return '';
            }

            return tx?.hash;
        },
        getExplorerUrl() {
            if (!this.getTx?.transactions) {
                return;
            }

            const tx = this.getTx.transactions[0];
            if (!tx?.hash) {
                return '';
            }

            const networkConfig = useGetNetworkConfig();
            const to = explorerUrlBuilder.transactionDetails(tx.hash);

            return getExplorerLink({
                explorerAddress: String(networkConfig.explorerAddress),
                to: to
            });
        }
    },
    methods: {
        closeThis(toastId) {
            this.show = false;
            this.handleDeleteTransactionToast(toastId)
        },
        handleDeleteTransactionToast(toastId) {
            useToastsStore().removeTransactionToast(toastId);
            removeSignedTransaction(toastId);
        },
    }
};
</script>

<style scoped lang="scss">
.erdjs-vue--toast {
    margin: 5px;
    border-left-width: 7px;
}
</style>