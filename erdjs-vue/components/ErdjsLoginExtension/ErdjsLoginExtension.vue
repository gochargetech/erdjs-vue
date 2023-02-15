<template>
    <div class="erdjs-vue__login-wrappper px-2 text-center">
        <div class="dapp-login__tab-error" v-if="error">
            {{ error }}
        </div>
        <h4>Extension login</h4>
        <template v-if="!isExtensionInstalled">
            <a :href="getDeFiExtensionUrl" target="_blank" rel="noreferrer" class="dapp-login__tab-link">Install Maiar DeFi
                Extension</a>
        </template>
        <template v-else>
            <p class="dapp-login__tab-text">
                Please unlock Maiar DeFi Extension and select the wallet you want to connect.
            </p>
        </template>
        <div class="back-button">
            <button @click.prevent="$emit('hide-login-tab')" class="btn btn-secondary">Back</button>
        </div>
    </div>
</template>

<script>
import { LoginMethodsEnum } from 'erdjs-vue/types/index'
import { useExtensionLogin } from 'erdjs-vue/hooks/login/useExtensionLogin';

export default {
    name: 'ErdjsLoginExtension',
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
        if (this.selectedMode === LoginMethodsEnum.extension) {
            this.login()
        }
    },
    computed: {
        isExtensionInstalled() {
            return window.elrondWallet;
        },
        getDeFiExtensionUrl() {
            return this.isFirefox
                ? 'https://addons.mozilla.org/en-US/firefox/addon/maiar-defi-wallet/'
                : 'https://chrome.google.com/webstore/detail/dngmlblcodfobpdpecaadgfbcggfjfnm?authuser=0&hl=en';
        }
    },
    methods: {
        isFirefox() {
            return navigator.userAgent.indexOf('Firefox') != -1;
        },
        login() {
            const [onInitiateLogin] = useExtensionLogin({
                callbackRoute: ''
            });
            onInitiateLogin();
        }
    }
};
</script>
