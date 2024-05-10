<template>
    
</template>

<script>
export default {
    data() {
        return {
            permissions: [
                {
                    name: 'Read',
                    value: 'read'
                },
                {
                    name: 'Write',
                    value: 'write'
                },
                {
                    name: 'Execute',
                    value: 'execute'
                }
            ],
            selectedPermissions: []
        }
    }

}
</script>


<style scoped lang="scss">

</style>