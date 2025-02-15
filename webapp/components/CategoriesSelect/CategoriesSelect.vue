<template>
  <section class="categories-select">
    <base-button
      v-for="category in categories"
      :key="category.id"
      :data-test="categoryButtonsId(category.id)"
      @click="toggleCategory(category.id)"
      :filled="isActive(category.id)"
      :disabled="isDisabled(category.id)"
      :icon="category.icon"
      size="small"
      v-tooltip="{
        content: $t(`contribution.category.description.${category.slug}`),
        placement: 'bottom-start',
      }"
    >
      {{ $t(`contribution.category.name.${category.slug}`) }}
    </base-button>
  </section>
</template>

<script>
import CategoryQuery from '~/graphql/CategoryQuery'
import { CATEGORIES_MAX } from '~/constants/categories.js'
import xor from 'lodash/xor'
import SortCategories from '~/mixins/sortCategoriesMixin.js'

export default {
  inject: {
    $parentForm: {
      default: null,
    },
  },
  mixins: [SortCategories],
  props: {
    existingCategoryIds: { type: Array, default: () => [] },
    model: { type: String, required: true },
  },
  data() {
    return {
      categories: null,
      selectedMax: CATEGORIES_MAX,
      selectedCategoryIds: this.existingCategoryIds,
    }
  },
  computed: {
    selectedCount() {
      return this.selectedCategoryIds.length
    },
    reachedMaximum() {
      return this.selectedCount >= this.selectedMax
    },
  },
  methods: {
    toggleCategory(id) {
      this.selectedCategoryIds = xor(this.selectedCategoryIds, [id])
      if (this.$parentForm) {
        this.$parentForm.update(this.model, this.selectedCategoryIds)
      }
    },
    isActive(id) {
      return this.selectedCategoryIds.includes(id)
    },
    isDisabled(id) {
      return !!(this.reachedMaximum && !this.isActive(id))
    },
    categoryButtonsId(categoryId) {
      return `category-buttons-${categoryId}`
    },
  },
  apollo: {
    Category: {
      query() {
        return CategoryQuery()
      },
      result({ data: { Category } }) {
        this.categories = this.sortCategories(Category)
      },
    },
  },
}
</script>

<style lang="scss">
.categories-select {
  display: flex;
  flex-wrap: wrap;

  > .base-button {
    margin-right: $space-xx-small;
    margin-bottom: $space-xx-small;
  }
}
</style>
