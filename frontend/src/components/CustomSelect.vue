<template>
  <div class="relative" ref="selectRef">
    <button
      type="button"
      @click="toggleDropdown"
      class="el-select-wrapper"
      :class="{ 'is-focused': isOpen }"
    >
      <div class="el-select__selected-item">
        <span 
          class="el-select__placeholder"
          :class="{ 'is-transparent': selectedLabel }"
        >
          {{ selectedLabel || placeholder }}
        </span>
      </div>
      <ChevronDown 
        :size="14" 
        class="el-select__icon transition-transform duration-200"
        :class="{ 'rotate-180': isOpen }"
      />
    </button>

    <Transition
      enter-active-class="transition ease-out duration-200"
      enter-from-class="opacity-0 scale-95"
      enter-to-class="opacity-100 scale-100"
      leave-active-class="transition ease-in duration-100"
      leave-from-class="opacity-100 scale-100"
      leave-to-class="opacity-0 scale-95"
    >
      <div
        v-if="isOpen"
        class="el-select-dropdown"
      >
        <div class="el-select-dropdown__list">
          <div
            v-for="option in options"
            :key="option.value"
            @click="selectOption(option)"
            class="el-select-dropdown__item"
            :class="{
              'is-selected': modelValue === option.value,
              'is-hovering': hoveredOption === option.value
            }"
            @mouseenter="hoveredOption = option.value"
            @mouseleave="hoveredOption = null"
          >
            {{ option.label }}
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { ChevronDown } from 'lucide-vue-next'

const props = defineProps({
  modelValue: {
    type: [String, Number],
    default: ''
  },
  options: {
    type: Array,
    required: true
  },
  placeholder: {
    type: String,
    default: 'Selecione...'
  }
})

const emit = defineEmits(['update:modelValue'])

const isOpen = ref(false)
const selectRef = ref(null)
const hoveredOption = ref(null)

const selectedLabel = computed(() => {
  const selected = props.options.find(opt => opt.value === props.modelValue)
  return selected ? selected.label : ''
})

function toggleDropdown() {
  isOpen.value = !isOpen.value
}

function selectOption(option) {
  emit('update:modelValue', option.value)
  isOpen.value = false
}

function handleClickOutside(event) {
  if (selectRef.value && !selectRef.value.contains(event.target)) {
    isOpen.value = false
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>

<style scoped>
.el-select-wrapper {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  background-color: var(--el-fill-color-blank, #ffffff);
  border-radius: 4px;
  box-shadow: 0 0 0 1px var(--el-border-color, #dcdfe6) inset;
  cursor: pointer;
  font-size: 14px;
  gap: 6px;
  line-height: 24px;
  min-height: 40px;
  padding: 8px 16px;
  position: relative;
  text-align: left;
  transition: all 0.2s cubic-bezier(0.645, 0.045, 0.355, 1);
  outline: none;
}

html.dark .el-select-wrapper {
  background-color: #1B1C22;
  box-shadow: 0 0 0 1px #363843 inset;
}

.el-select-wrapper:hover {
  box-shadow: 0 0 0 1px var(--el-border-color-hover, #c0c4cc) inset;
}

html.dark .el-select-wrapper:hover {
  box-shadow: 0 0 0 1px #464852 inset;
}

.el-select-wrapper.is-focused {
  box-shadow: 0 0 0 1px var(--el-color-primary, #006AE6) inset;
}

.el-select__selected-item {
  display: flex;
  flex: 1;
  overflow: hidden;
}

.el-select__placeholder {
  color: var(--el-text-color-regular, #606266);
  display: block;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  width: 100%;
}

html.dark .el-select__placeholder {
  color: #F5F5F5;
}

.el-select__placeholder.is-transparent {
  color: var(--el-text-color-placeholder, #a8abb2);
}

html.dark .el-select__placeholder.is-transparent {
  color: #9A9CAE;
}

.el-select__icon {
  color: var(--el-text-color-placeholder, #a8abb2);
  flex-shrink: 0;
}

html.dark .el-select__icon {
  color: #808290;
}

.el-select-dropdown {
  position: absolute;
  z-index: 2000;
  width: 100%;
  margin-top: 8px;
  background-color: #ffffff;
  border: 1px solid var(--el-border-color-light, #e4e7ed);
  border-radius: 4px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  max-height: 274px;
  overflow: auto;
}

html.dark .el-select-dropdown {
  background-color: #1B1C22;
  border-color: #363843;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.3);
}

.el-select-dropdown__list {
  padding: 6px 0;
}

.el-select-dropdown__item {
  font-size: 14px;
  padding: 0 16px;
  position: relative;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  color: var(--el-text-color-regular, #606266);
  height: 34px;
  line-height: 34px;
  box-sizing: border-box;
  cursor: pointer;
  transition: background-color 0.2s cubic-bezier(0.645, 0.045, 0.355, 1);
}

html.dark .el-select-dropdown__item {
  color: #F5F5F5;
}

.el-select-dropdown__item.is-hovering {
  background-color: var(--el-fill-color-light, #f5f7fa);
}

html.dark .el-select-dropdown__item.is-hovering {
  background-color: #26272F;
}

.el-select-dropdown__item.is-selected {
  color: var(--el-color-primary, #006AE6);
  font-weight: 500;
  background-color: var(--el-color-primary-light-9, #ecf5ff);
}

html.dark .el-select-dropdown__item.is-selected {
  color: #006AE6;
  background-color: rgba(0, 106, 230, 0.1);
}

/* Scrollbar */
.el-select-dropdown::-webkit-scrollbar {
  width: 6px;
}

.el-select-dropdown::-webkit-scrollbar-track {
  background: transparent;
}

.el-select-dropdown::-webkit-scrollbar-thumb {
  background: #dcdfe6;
  border-radius: 3px;
}

html.dark .el-select-dropdown::-webkit-scrollbar-thumb {
  background: #464852;
}

.el-select-dropdown::-webkit-scrollbar-thumb:hover {
  background: #c0c4cc;
}

html.dark .el-select-dropdown::-webkit-scrollbar-thumb:hover {
  background: #636674;
}
</style>
