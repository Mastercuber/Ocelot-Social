<template>
  <nuxt-link
    v-if="pageParams.isInternalPage"
    :to="pageParams.internalPage.pageRoute"
    :data-test="pageParams.name + '-nuxt-link'"
  >
    <slot />
  </nuxt-link>
  <a
    v-else
    :href="pageParams.externalLink.url"
    :target="pageParams.externalLink.target"
    :data-test="pageParams.name + '-link'"
  >
    <slot />
  </a>
</template>

<script>
export default {
  name: 'PageParamsLink',
  props: {
    pageParams: { type: Object, required: true },
  },
}
</script>
