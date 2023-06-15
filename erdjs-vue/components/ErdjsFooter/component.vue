<template>
    <div class="erdjs-vue--footer">
        <ErdjsTxModal />
        <ErdjsToasts />
    </div>
</template>

<script>
import { ErdjsTxModal } from 'erdjs-vue/components/ErdjsTxModal';
import { ErdjsToasts } from 'erdjs-vue/components/ErdjsToasts';
import { useWebViewLogin } from 'erdjs-vue/hooks/login/useWebViewLogin';
import { getWebviewToken } from 'erdjs-vue/utils/account/getWebviewToken';

export default {
    name: 'ErdjsFooter',
    components: {
        ErdjsTxModal,
        ErdjsToasts
    },
    watch: {
        webviewToken(newVal) {
            if (newVal !== '') {
                useWebViewLogin(newVal);
            }
        }
    },
    computed: {
        webviewToken() {
            return getWebviewToken();
        },
    }
};
</script>

<style scoped lang="scss">
.erdjs-vue--footer{
    position: fixed;
    bottom: 0;
    right: 0;
    overflow: visible;
    z-index: 9900;
}
</style>