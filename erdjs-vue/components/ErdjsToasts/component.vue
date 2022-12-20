<template>
    <div>
        <template v-if="getTxToasts">
            <ErdjsToast 
                v-for="(toast, toastIndex) of getTxToasts" 
                :toast-id="toast.toastId" 
                :toast="toast" 
                v-bind:key="toastIndex" />
        </template>
    </div>
</template>

<script>
import { ErdjsToast } from 'erdjs-vue/components/ErdjsToast';
import { useGetSignedTransactions } from 'erdjs-vue/hooks/transactions/useGetSignedTransactions';
import { useToastsStore } from 'erdjs-vue/store/erdjsToasts';
import { useTransactionsStore } from 'erdjs-vue/store/erdjsTransactions';

export default {
    name: 'ErdjsToasts',
    components: {
        ErdjsToast
    },
    data() {
        return {
            show: true
        }
    },
    mounted() {
        setTimeout(() => {
            useTransactionsStore().getPendingSignedTransactions;
        }, 500)
    },
    watch: {
        getSignedTxs: { 
            handler(newValue) {
                this.handleSignedTransactionsListUpdate(newValue);
            },
            deep: true
        }
    },
    computed: {
        getSignedTxs() {
            return useGetSignedTransactions().signedTransactions;
        },
        getTxToasts() {
            return this.$erdjs.getDapp().getToastsStore().getTransactionToasts;
        },
    },
    methods: {
        handleSignedTransactionsListUpdate(signedTransactionsToRender) {
            for (const sessionId in signedTransactionsToRender) {
                const alreadyHasToastForThisTransaction = this.getTxToasts.some(
                    (toast) => toast.toastId === sessionId
                );
                
                if (!alreadyHasToastForThisTransaction) {
                    useToastsStore().addTransactionToast(sessionId);
                }
            }
        }
    }
};
</script>
