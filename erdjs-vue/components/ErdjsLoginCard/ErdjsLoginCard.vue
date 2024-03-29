<template>
    <div>
        <template v-if="!isLoggedIn">
            <template v-if="!loginMethod">
                <slot name="title"><h4>{{ title }}</h4></slot>
                <slot name="description"><p class="mb-4">{{ description }}</p></slot>
                
                <div :class="cssClassButtonsWrap">
                    <button 
                        @click.prevent="(loginMethod = getLoginMethods().extension)"
                        class="m-2 btn btn-primary"
                    ><slot name="extension">{{ buttonTextExtension }}</slot></button>
                    <button 
                        @click.prevent="(loginMethod = getLoginMethods().walletconnectv2)"
                        class="m-2 btn btn-primary"
                    ><slot name="xportal">{{ buttonTextXPortal }}</slot></button>
                    <button 
                        @click.prevent="(loginMethod = getLoginMethods().ledger)"
                        class="m-2 btn btn-primary"
                    ><slot name="ledger">{{ buttonTextLedger }}</slot></button>
                    <button 
                        @click.prevent="(loginMethod = getLoginMethods().wallet)"
                        class="m-2 btn btn-primary"
                    ><slot name="webwallet">{{ buttonTextWebWallet }}</slot></button>
                </div>
            </template>
            <template v-if="loginMethod === getLoginMethods().extension">
                <ErdjsLoginExtension :selected-mode="loginMethod" @hide-login-tab="(loginMethod = getLoginMethods().none)" />
            </template>
            <template v-if="(loginMethod === getLoginMethods().wallet)">
                <ErdjsLoginWebWallet :selected-mode="loginMethod" @hide-login-tab="(loginMethod = getLoginMethods().none)" />
            </template>
            <template v-if="(loginMethod === getLoginMethods().walletconnectv2)">
                <ErdjsLoginWalletConnectV2 :selected-mode="loginMethod"
                    @hide-login-tab="(loginMethod = getLoginMethods().none)"
                    @change-login-tab="(tab) => loginMethod = tab" />
            </template>
            <template v-if="(loginMethod === getLoginMethods().ledger)">
                <ErdjsLoginLedger :selected-mode="loginMethod"
                    @hide-login-tab="(loginMethod = getLoginMethods().none)"
                    @change-login-tab="(tab) => loginMethod = tab" />
            </template>
        </template>
        <template v-if="isLoggedIn">
            <p class="text-center">MultiversX address: <strong>{{ getAddressShort }}</strong></p>
            <div class="d-flex flex-row justify-content-center">
                <a :href="getExplorerUrl" target="_blank" :class="cssClassExplorerButton">View in explorer</a>
                <button @click.prevent="logout()" :class="cssClassLogoutButton">Logout</button>
            </div>
        </template>
    </div>
</template>

<script>
import { LoginMethodsEnum } from 'erdjs-vue/types/index'
import { ErdjsLoginExtension } from 'erdjs-vue/components/ErdjsLoginExtension'
import { ErdjsLoginWebWallet } from 'erdjs-vue/components/ErdjsLoginWebWallet'
import { ErdjsLoginWalletConnectV2 } from 'erdjs-vue/components/ErdjsLoginWalletConnect'
import { ErdjsLoginLedger } from 'erdjs-vue/components/ErdjsLoginLedger'
import { logout } from 'erdjs-vue/utils/logout'
import { getExplorerUrl, explorerUrlBuilder } from 'erdjs-vue/utils/transactions/getInterpretedTransaction/helpers';

export default {
    name: 'ErdjsLoginCard',
    components: {
        ErdjsLoginExtension,
        ErdjsLoginWebWallet,
        ErdjsLoginWalletConnectV2,
        ErdjsLoginLedger
    },
    props: {
        cssClassButtonsWrap: {
            type: String,
            default: 'login-method d-flex flex-column flex-md-row justify-content-center flex-wrap'
        },
        cssClassExplorerButton: {
            type: String,
            default: 'btn btn-outline-secondary mx-2'
        },
        cssClassLogoutButton: {
            type: String,
            default: 'btn btn-outline-secondary mx-2'
        }
    },
    data() {
        return {
            loginMethod: '',
            title: 'MultiversX Login',
            description: '',
            buttonTextExtension: 'Extension',
            buttonTextLedger: 'Ledger',
            buttonTextWebWallet: 'Web Wallet',
            buttonTextMaiarApp: 'Maiar App',
            buttonTextXPortal: 'xPortal App'
        }
    },
    computed: {
        isLoggedIn() {
            return this.$erdjs.getDapp().getLoginInfoStore().isLoggedIn;
        },
        getAddress() {
            return this.$erdjs.getDapp().getAccountStore().getAddress;
        },
        getExplorerUrl() {
            const to = explorerUrlBuilder.accountDetails(this.getAddress);

            return getExplorerUrl(to);
        },
        getAddressShort() {
            let address = [
                this.getAddress.substr(0, 6),
                this.getAddress.substr(this.getAddress.length - 6, 6),
            ];

            return address.join('....');
        },
    },
    methods: {
        getLoginMethods() {
            return LoginMethodsEnum;
        },
        logout() {
            this.loginMethod = this.getLoginMethods().none;
            logout();
        },
    }
};
</script>