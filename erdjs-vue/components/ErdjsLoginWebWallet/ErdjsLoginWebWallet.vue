<template>
    <div class="erdjs-vue__login-wrappper px-2 text-center">
        <div class="dapp-login__tab-error" v-if="error">
            {{ error }}
        </div>
        <h4>Web Wallet Login</h4>
        <p class="dapp-login__tab-text">
            Please wait a moment, you'll be redirected to MultiversX Web Wallet...
        </p>
        <div class="back-button">
            <button @click.prevent="$emit('hide-login-tab')" class="btn btn-secondary">Back</button>
        </div>
    </div>
</template>

<script>
import { LoginMethodsEnum } from 'erdjs-vue/types/index'
import { useWebWalletLogin } from 'erdjs-vue/hooks/login/useWebWalletLogin';

export default {
    name: 'ErdjsLoginWebWallet',
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
    mounted() {
        if (this.selectedMode === LoginMethodsEnum.wallet) {
            this.login()
        }
    },
    methods: {
        login() {
            const [onInitiateLogin] = useWebWalletLogin({
                callbackRoute: '/login'
            });
            onInitiateLogin();
        }
    }
};
</script>
