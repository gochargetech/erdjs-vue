<template>
    <div class="erdjs-vue__login-wrappper d-flex flex-column justify-content-start align-items-center">
        <div class="dapp-login__tab-error" v-if="errorMessage">
            {{ errorMessage }}
        </div>
        <h4>xPortal Login</h4>
        <template v-if="wcPairings.length">
            <strong class="mb-2">Choose a session:</strong>
            <div v-for="(pairing, pIndex) of wcPairings" :key="pIndex" class="w-100 mb-2">
                <div v-if="pairing.peerMetadata" 
                    @click.prevent="pairingSelected(pairing)" 
                    :key="pairing.topic"
                    class="pairing w-100 d-flex flex-row align-items-center p-2 rounded" 
                >
                    <img v-if="pairing.peerMetadata?.icons?.[0]" :src="pairing.peerMetadata.icons[0]" :alt="pairing.peerMetadata.name" class="pairing--img me-2" />
                    <div class="d-flex flex-column align-items-start">
                        <strong v-if="topicLoading === pairing.topic">
                            Confirm on {{pairing.peerMetadata.name}}
                        </strong>
                        <strong v-else>
                            {{ pairing.peerMetadata.name }}
                        </strong>
                        
                        <span>{{pairing.peerMetadata.description}}</span>
                        
                        <span>{{pairing.peerMetadata.url}}</span>
                    
                        <button class="btn btn-pairing-remove" @click.prevent="pairingRemoved(pairing)">x</button>
                    </div>
                </div>
            </div>
        </template>
        <div v-if="isMobileDevice && uriLink">
            <a :href="uriLink" class="btn btn-primary w-100 mb-4">Click to login</a>
        </div>
        <p class="mb-2">Scan the QR Code with xPortal app</p>
        <div v-html="qrCodeSvg" v-if="qrCodeSvg" class="wallet-connect-qrcode px-4"></div>
        <div class="back-button my-3">
            <button @click.prevent="$emit('hide-login-tab')" class="btn btn-secondary">Back</button>
        </div>
    </div>
</template>

<script lang="ts">
import { defineComponent, ref, watch } from 'vue';
import { LoginMethodsEnum } from 'erdjs-vue/types/index';
import { useWalletConnectV2Login } from 'erdjs-vue/hooks/login/useWalletConnectV2Login';
import QRCode from 'qrcode';
import type { PairingTypes } from '@multiversx/sdk-wallet-connect-provider';

export default defineComponent({
    mounted() { 
        this.generateQRCode();
        if (this.selectedMode === LoginMethodsEnum.walletconnectv2) {
            this.login()
        }
    },
    setup() {
        const errorMessage = ref<string>('');
        const qrCodeSvg = ref<string>('');
        const uriLink = ref('');
        const wcUri = ref<string>('');
        const topicLoading = ref<string>('');

        const [
            onInitiateLogin,
            { error },
            {
                uriDeepLink,
                walletConnectUri,
                getWcPairings,
                connectExisting,
                removeExistingPairing,
            },
            getWcUri
        ] = useWalletConnectV2Login({
            logoutRoute: '/login',
            callbackRoute: '/login'
        });
        if (error) {
            errorMessage.value = error;
        }
        wcUri.value = walletConnectUri ? walletConnectUri : '';
        uriLink.value = uriDeepLink;

        const login = async () => {
            await onInitiateLogin();
            wcUri.value = getWcUri();
            generateQRCode();
        }

        const generateQRCode = async () => {
            const canGenerateQRCode = Boolean(wcUri.value);
            
            if (!canGenerateQRCode) {
                return;
            }

            if (wcUri.value) {
                const svg = await QRCode.toString(wcUri.value, {
                    type: 'svg'
                });
                if (svg) {
                    qrCodeSvg.value = svg;
                }
            }
        }

        watch([wcUri], () => {
            generateQRCode();
        })

        const pairingSelected = (pairing: PairingTypes.Struct) => {
            connectExisting(pairing);
            topicLoading.value = pairing.topic;
        }

        const pairingRemoved = (pairing: PairingTypes.Struct) => {
            topicLoading.value = '';
            removeExistingPairing(pairing.topic);
        }

        return {
            login,
            generateQRCode,
            errorMessage,
            uriLink,
            qrCodeSvg,
            wcUri,
            getWcPairings,
            pairingSelected,
            pairingRemoved,
            topicLoading
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
    computed: {
        isMobileDevice() {
            return "ontouchstart" in window || "onmsgesturechange" in window;
        },
        wcPairings() {
            return this.getWcPairings();
        }
    },
});
</script>

<style>
.wallet-connect-qrcode svg{
    width: 320px;
    max-width: 100%;
    height: auto;
}
.pairing--img {
    width: 100%;
    max-width: 3rem;
    height: auto;
    display: block;
}
.pairing {
    position: relative;
    background-color: var(--bs-gray-200);

}
.btn-pairing-remove {
    position: absolute;
    right: 1rem;
    top: 1rem;
}
</style>