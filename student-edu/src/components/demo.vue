<template>
	<div>
		<button @click="$emit('update:a', 100)">修改bb</button>
		<button @click="$emit('bbb', 99)">修改bb</button>
		<slot></slot>
		<div>
			<slot name="a4" name1="王五" :age="30"></slot>
		</div>
		<div>
			<slot name="a2"></slot>
		</div>
		<div>
			<slot name="a1" name1="赵四" :age="40"></slot>
		</div>
	</div>
</template>

<script type="text/ecmascript-6">
        export default {
                name: 'Demo',
	        props: ['a', 'b'],
	        // 是对v-model的解释说明
	        model: {
                        prop: 'b',
		        event: 'bbb',
	        }
        };
</script>

<style lang="stylus" rel="stylesheet/stylus" scoped>

</style>