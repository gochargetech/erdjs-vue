<template>
    <div class="erdjs-vue__login-wrappper d-flex flex-column justify-content-start align-items-center">
        <div class="dapp-login__tab-error" v-if="error">
            {{ error }}
        </div>
        <h4>xPortal (Legacy) Login</h4>
        <div v-if="isMobileDevice && uriDeepLink">
            <a :href="uriDeepLink" class="btn btn-primary w-100 mb-4">Click to login</a>
        </div>
        <p class="mb-2">Scan the QR Code with xPortal app</p>
        <div v-html="qrCodeSvg" v-if="qrCodeSvg" class="wallet-connect-qrcode px-4"></div>
        <div class="back-button my-3">
            <button @click.prevent="$emit('hide-login-tab')" class="btn btn-secondary">Back</button>
        </div>
        <div class="mt-3 small">
            <a href="#" @click.prevent="$emit('change-login-tab', getLoginMethods().walletconnectv2)">Unable to login with legacy version? Use the latest one.</a>
        </div>
    </div>
</template>

<script>
import { LoginMethodsEnum } from 'erdjs-vue/types/index'
import { useWalletConnectLogin } from 'erdjs-vue/hooks/login/useWalletConnectLogin';
import QRCode from 'qrcode';
import { isMobileEnvironment } from 'erdjs-vue/utils/environment/isMobileEnvironment';

export default {
    name: 'ErdjsLoginWalletConnect',
    data() {
        return {
            error: null,
            qrCodeSvg: '',
            uriDeepLink: '',
            walletConnectUri: '',
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
        this.generateQRCode()
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
        isMobileDevice() {
            return "ontouchstart" in window || "onmsgesturechange" in window;
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
        },
        getLoginMethods() {
            return LoginMethodsEnum;
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