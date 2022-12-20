<template>
    <div class="erdjs-vue--footer">
        <ErdjsTxModal />
        <ErdjsToasts />
    </div>
</template>

<script>
import { ErdjsTxModal } from 'erdjs-vue/components/ErdjsTxModal';
import { ErdjsToasts } from 'erdjs-vue/components/ErdjsToasts';

export default {
    name: 'ErdjsFooter',
    components: {
        ErdjsTxModal,
        ErdjsToasts
    },
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