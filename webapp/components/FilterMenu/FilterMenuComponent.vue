<template>
  <div>
    <div class="filter-menu-options">
      <h2 class="title">{{ $t('filter-menu.filter-by') }}</h2>
      <following-filter />
      <categories-filter v-if="categoriesActive" @showFilterMenu="$emit('showFilterMenu')" />
    </div>
    <div class="filter-menu-options">
      <h2 class="title">{{ $t('filter-menu.order-by') }}</h2>
      <order-by-filter />
    </div>
  </div>
</template>

<script>
import FollowingFilter from './FollowingFilter'
import OrderByFilter from './OrderByFilter'
import CategoriesFilter from './CategoriesFilter'

export default {
  components: {
    FollowingFilter,
    OrderByFilter,
    CategoriesFilter,
  },
  data() {
    return {
      categoriesActive: this.$env.CATEGORIES_ACTIVE,
    }
  },
}
</script>

<style lang="scss">
.filter-menu-options {
  max-width: $size-max-width-filter-menu;
  padding: $space-small $space-x-small;

  > .title {
    font-size: $font-size-large;
  }
}
</style>
