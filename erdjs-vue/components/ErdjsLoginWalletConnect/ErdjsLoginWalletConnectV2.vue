<template>
    <div class="erdjs-vue__login-wrappper d-flex flex-column justify-content-start align-items-center">
        <div class="dapp-login__tab-error" v-if="errorMessage">
            {{ errorMessage }}
        </div>
        <h4>xPortal Login</h4>

        <template v-if="activeWcPairings.length">
            <strong class="mb-2">Choose a session:</strong>
            <div v-for="(pairing, pIndex) of activeWcPairings" :key="pIndex" class="w-100 mb-2">
                <div v-if="pairing.peerMetadata" 
                    :key="pairing.topic"
                    class="pairing d-flex flex-row align-items-center p-2 rounded mx-3" 
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
                    
                        <a href="#" @click.prevent="pairingSelected(pairing)" class="pairing--link" title="Connect pairing"></a>
                        <button class="btn btn-pairing-remove" @click.prevent="pairingRemoved(pairing)">×</button>
                    </div>
                </div>
            </div>
        </template>
        <div v-if="isMobileDevice && uriDeepLink">
            <a :href="uriDeepLink" class="btn btn-primary w-100 mb-4">Click to login</a>
        </div>
        <p class="mb-2">Scan the QR Code with xPortal app</p>
        <div v-html="qrCodeSvg" v-if="qrCodeSvg" class="wallet-connect-qrcode px-4"></div>
        <div class="back-button my-3">
            <button @click.prevent="$emit('hide-login-tab')" class="btn btn-secondary">Back</button>
        </div>
        <div class="mt-3 small">
            <a href="#" @click.prevent="$emit('change-login-tab', LoginMethodsEnum.walletconnect)">Unable to login? Use the legacy version.</a>
        </div>
    </div>
</template>

<script lang="ts">
import { defineComponent, ref, watch } from 'vue';
import { LoginMethodsEnum } from './../../types/index';
import { useWalletConnectV2Login } from './../../hooks/login/useWalletConnectV2Login';
import QRCode from 'qrcode';
import type { PairingTypes } from '@multiversx/sdk-wallet-connect-provider';
import { useAppConfigStore } from 'erdjs-vue/store/erdjsAppConfig';

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
        const topicLoading = ref<string>('');
        const loginConfig = useAppConfigStore().getWalletConnectV2Login;

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
        ] = useWalletConnectV2Login(loginConfig);
        if (error) {
            errorMessage.value = error;
        }

        watch(walletConnectUri, () => {
            generateQRCode();
        });

        const login = async () => {
            await onInitiateLogin();
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
            qrCodeSvg,
            getWcPairings,
            pairingSelected,
            pairingRemoved,
            topicLoading,
            LoginMethodsEnum,
            uriDeepLink
        }
    },
    props: {
        selectedMode: {
            type: String,
            default: '',
        }
    },
    computed: {
        isMobileDevice() {
            return "ontouchstart" in window || "onmsgesturechange" in window;
        },
        wcPairings() {
            return this.getWcPairings();
        },
        activeWcPairings() {
            const pairings = this.getWcPairings();
            const activePairings = pairings?.filter((pairing) => {
                const hasLaterEntry = pairings.some(
                    (pairing2) =>
                        pairing.peerMetadata?.name === pairing2?.peerMetadata?.name &&
                        pairing.peerMetadata?.url === pairing2?.peerMetadata?.url &&
                        pairing.expiry < pairing2.expiry
                );

                return (
                    Boolean(pairing.active) && pairing.peerMetadata && !hasLaterEntry
                );
            }) ?? []

            return activePairings;
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
.pairing {
    position: relative;
    background-color: var(--bs-secondary-bg);

}
.pairing strong,
.pairing span {
    color: var(--bs-secondary-text);

}
.pairing--img {
    width: 100%;
    max-width: 3rem;
    height: auto;
    display: block;
}
.pairing--link {
    position: absolute;
    display: block;
    z-index: 2;
    width: 100%;
    height: 100%;
    left: 0;
    top: 0;
}
.btn.btn-pairing-remove {
    position: absolute;
    right: 1rem;
    top: 1rem;
    z-index: 3;
    color: var(--bs-secondary-text);
    line-height: 1;
}
</style>