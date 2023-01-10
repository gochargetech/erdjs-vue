<template>
    <div>
        <template v-if="!isLoggedIn">
            <template v-if="!loginMethod">
                <h4>Login</h4>
                <p class="mb-4">Select login method</p>
                
                <div class="login-method d-flex flex-column flex-md-row justify-content-between flex-wrap">
                    <button 
                        @click.prevent="(loginMethod = getLoginMethods().extension)"
                        class="m-2 btn btn-primary"
                    >Extension</button>
                    <!-- <button 
                        @click.prevent="(loginMethod = getLoginMethods().ledger)"
                        class="m-2 btn btn-primary"
                    >Ledger</button> -->
                    <button 
                        @click.prevent="(loginMethod = getLoginMethods().wallet)"
                        class="m-2 btn btn-primary"
                    >Web Wallet</button>
                    <button 
                        @click.prevent="(loginMethod = getLoginMethods().walletconnect)"
                        class="m-2 btn btn-primary"
                    >Maiar</button>
                </div>
            </template>
            <template v-if="loginMethod === getLoginMethods().extension">
                <ErdjsLoginExtension :selected-mode="loginMethod" @hide-login-tab="(loginMethod = getLoginMethods().none)" />
            </template>
            <template v-if="(loginMethod === getLoginMethods().wallet)">
                <ErdjsLoginWebWallet :selected-mode="loginMethod" @hide-login-tab="(loginMethod = getLoginMethods().none)" />
            </template>
            <template v-if="(loginMethod === getLoginMethods().walletconnect)">
                <ErdjsLoginWalletConnect :selected-mode="loginMethod"
                    @hide-login-tab="(loginMethod = getLoginMethods().none)" />
            </template>
        </template>
        <template v-if="isLoggedIn">
            <p>Your address</p>
            <div class="mb-4"><a :href="getExplorerUrl" target="_blank">{{ getAddress }}</a></div>
            <div>
                <button @click.prevent="logout()" class="btn btn-secondary">Logout</button>
            </div>
        </template>
    </div>
</template>

<script>
import { LoginMethodsEnum } from 'erdjs-vue/types/index'
import { ErdjsLoginExtension } from 'erdjs-vue/components/ErdjsLoginExtension'
import { ErdjsLoginWebWallet } from 'erdjs-vue/components/ErdjsLoginWebWallet'
import { ErdjsLoginWalletConnect } from 'erdjs-vue/components/ErdjsLoginWalletConnect'
import { logout } from 'erdjs-vue/utils/logout'
import { tryAuthenticateWalletUser } from 'erdjs-vue/hooks/login/useWebWalletLogin'
import { setExtensionProvider } from 'erdjs-vue/hooks/login/useExtensionLogin'
import { getExplorerUrl, explorerUrlBuilder } from 'erdjs-vue/utils/transactions/getInterpretedTransaction/helpers';

export default {
    name: 'ErdjsLoginCard',
    components: {
        ErdjsLoginExtension,
        ErdjsLoginWebWallet,
        ErdjsLoginWalletConnect,
    },
    data() {
        return {
            loginMethod: '',
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
        }
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