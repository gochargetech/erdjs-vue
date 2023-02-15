<template>
    <div class="erdjs-vue__login-wrappper d-flex flex-column justify-content-start align-items-center">
        <div class="dapp-login__tab-error" v-if="errorMessage">
            {{ errorMessage }}
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
            <a href="#" @click.prevent="$emit('change-login-tab', LoginMethodsEnum.walletconnectv2)">Unable to login with legacy version? Use the latest one.</a>
        </div>
    </div>
</template>

<script lang="ts">
import { defineComponent, ref, watch } from 'vue';
import { LoginMethodsEnum } from './../../types/index';
import { useWalletConnectLogin } from './../../hooks/login/useWalletConnectLogin';
import QRCode from 'qrcode';

export default defineComponent({
    props: {
        selectedMode: {
            type: String,
            default: '',
        },
    },
    mounted() {
        if (this.selectedMode === LoginMethodsEnum.walletconnect) {
            this.login()
        }
    },
    setup() {
        const errorMessage = ref<string>('');
        const qrCodeSvg = ref<string>('');

        const [
            onInitiateLogin,
            { error },
            { uriDeepLink, walletConnectUri }
        ] = useWalletConnectLogin({
            logoutRoute: '/login',
        });

        if (error) {
            errorMessage.value = error;
        }

        const generateQRCode = async () => {
            const canGenerateQRCode = Boolean(walletConnectUri.value);

            if (!canGenerateQRCode) {
                return;
            }

            if (walletConnectUri.value) {
                const svg = await QRCode.toString(walletConnectUri.value, {
                    type: 'svg'
                });
                if (svg) {
                    qrCodeSvg.value = svg;
                }
            }
        }

        watch(walletConnectUri, () => {
            generateQRCode();
        }, {
            immediate: true
        });

        const login = () => {
            onInitiateLogin();
        }


        return {
            errorMessage,
            qrCodeSvg,
            login,
            generateQRCode,
            uriDeepLink,
            LoginMethodsEnum
        }
    },
    computed: {
        isMobileDevice() {
            return "ontouchstart" in window || "onmsgesturechange" in window;
        },
    }
});
</script>

<style>
.wallet-connect-qrcode svg{
    width: 320px;
    max-width: 100%;
    height: auto;
}
</style>