<template>
    <div class="erdjs-vue__login-wrappper">
        <div class="dapp-login__tab-error" v-if="error">
            {{ error }}
        </div>
        <h4>Maiar Login</h4>
        <div v-if="uriDeepLink">
            <a :href="uriDeepLink" class="btn btn-primary">Click to login</a>
        </div>
        <p class="mb-2">Scan the QR Code with Maiar app</p>
        <div v-html="qrCodeSvg" v-if="qrCodeSvg" class="wallet-connect-qrcode"></div>
        <div class="back-button">
            <button @click.prevent="$emit('hide-login-tab')" class="btn btn-secondary">Back</button>
        </div>
    </div>
</template>

<script>
import { LoginMethodsEnum } from 'erdjs-vue/types/index'
import { useWalletConnectLogin } from 'erdjs-vue/hooks/login/useWalletConnectLogin';
import QRCode from 'qrcode';
import { useProviderStore } from 'erdjs-vue/store/erdjsProvider';
import { isMobileEnvironment } from 'erdjs-vue/utils/environment/isMobileEnvironment';

export default {
    name: 'ErdjsLoginWalletConnect',
    data() {
        return {
            error: null,
            qrCodeSvg: ''
        }
    },
    props: {
        selectedMode: {
            type: String,
            default: '',
            uriDeepLink: '',
            isMobile: false,
        }
    },
    mounted() {
        if (this.selectedMode === LoginMethodsEnum.walletconnect) {
            this.login()
        }
        this.isMobile = isMobileEnvironment();
    },
    watch: {
        walletConnectUri() {
            this.generateQRCode();
        }
    },
    computed: {
        walletConnectUri() {
            return useProviderStore().getWalletConnectUri;
}
    },
    methods: {
        async login() {
            const [
                onInitiateLogin,
                { error },
                { uriDeepLink, walletConnectUri }
            ] = await useWalletConnectLogin({
                logoutRoute: '/login',
                callbackRoute: '/login'
            });
            onInitiateLogin();
            this.walletConnectUri = walletConnectUri;
            this.uriDeepLink = uriDeepLink;
        },
        async generateQRCode() {
            const canGenerateQRCodeForWC2 = false;
            const canGenerateQRCodeForWC1 = Boolean(this.walletConnectUri);
            const canGenerateQRCode =
                canGenerateQRCodeForWC2 || canGenerateQRCodeForWC1;

            if (!canGenerateQRCode) {
                return;
            }

            const uri = this.walletConnectUri;
            if (uri) {
                const svg = await QRCode.toString(uri, {
                    type: 'svg'
                });
                if (svg) {
                    this.qrCodeSvg = svg;
                }
            }
        }
    }
};
</script>

<style>
.wallet-connect-qrcode svg{
    width: 320px;
    max-width: 100%;
    height: auto;
}
</style>