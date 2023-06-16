<template>
    <div class="erdjs-vue--login d-flex flex-column flex-grow-1">
        <div class="d-flex flex-fill align-items-center">
            <div class="m-auto mw-100">
                <div class="card shadow-sm rounded p-4 border-0 text-center">
                    <div class="card-body py-4 px-2 px-sm-2 mx-lg-4">
                        <ErdjsLoginCard />
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import { ErdjsLoginCard } from 'erdjs-vue/components/ErdjsLoginCard'
import { useTransactionsStore } from 'erdjs-vue/store/erdjsTransactions'

export default {
    name: 'ErdjsLogin',
    components: {
        ErdjsLoginCard
    },
    computed: {
        txToSign() {
            return useTransactionsStore().getTransactionsToSign;
        },
    }
};
</script>