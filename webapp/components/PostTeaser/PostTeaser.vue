<template>
  <nuxt-link
    class="post-teaser"
    :to="{ name: 'post-id-slug', params: { id: post.id, slug: post.slug } }"
  >
    <base-card
      :lang="post.language"
      :class="{
        'disabled-content': post.disabled,
        '--blur-image': post.image && post.image.sensitive,
      }"
      :highlight="isPinned"
    >
      <template v-if="post.image" #heroImage>
        <img :src="post.image | proxyApiUrl" class="image" />
      </template>
      <client-only>
        <div class="post-user-row">
          <user-teaser :user="post.author" :group="post.group" :date-time="post.createdAt" />
          <hc-ribbon
            :class="[isPinned ? '--pinned' : '', post.image ? 'post-ribbon-w-img' : 'post-ribbon']"
            :text="isPinned ? $t('post.pinned') : $t('post.name')"
          />
        </div>
      </client-only>
      <h2 class="title hyphenate-text">{{ post.title }}</h2>
      <!-- TODO: replace editor content with tiptap render view -->
      <!-- eslint-disable-next-line vue/no-v-html -->
      <div class="content hyphenate-text" v-html="excerpt" />
      <footer
        class="footer"
        v-observe-visibility="(isVisible, entry) => visibilityChanged(isVisible, entry, post.id)"
      >
        <div class="categories" v-if="categoriesActive">
          <category
            v-for="category in post.categories"
            :key="category.id"
            v-tooltip="{
              content: `
                ${$t(`contribution.category.name.${category.slug}`)}: 
                ${$t(`contribution.category.description.${category.slug}`)}
              `,
              placement: 'bottom-start',
            }"
            :icon="category.icon"
            :filterActive="postsFilter ? postsFilter.id_in.includes(category.id) : false"
          />
        </div>
        <div v-else class="categories-placeholder"></div>
        <counter-icon
          icon="heart-o"
          :count="post.shoutedCount"
          :title="$t('contribution.amount-shouts', { amount: post.shoutedCount })"
        />
        <counter-icon
          icon="comments"
          :count="post.commentsCount"
          :title="$t('contribution.amount-comments', { amount: post.commentsCount })"
        />
        <counter-icon
          icon="hand-pointer"
          :count="post.clickedCount"
          :title="$t('contribution.amount-clicks', { amount: post.clickedCount })"
        />
        <counter-icon
          icon="eye"
          :count="post.viewedTeaserCount"
          :title="$t('contribution.amount-views', { amount: post.viewedTeaserCount })"
        />
        <client-only>
          <content-menu
            resource-type="contribution"
            :resource="post"
            :modalsData="menuModalsData"
            :is-owner="isAuthor"
            @pinPost="pinPost"
            @unpinPost="unpinPost"
          />
        </client-only>
      </footer>
    </base-card>
  </nuxt-link>
</template>

<script>
import Category from '~/components/Category'
import ContentMenu from '~/components/ContentMenu/ContentMenu'
import CounterIcon from '~/components/_new/generic/CounterIcon/CounterIcon'
import HcRibbon from '~/components/Ribbon'
import UserTeaser from '~/components/UserTeaser/UserTeaser'
import { mapGetters } from 'vuex'
import PostMutations from '~/graphql/PostMutations'
import { postMenuModalsData, deletePostMutation } from '~/components/utils/PostHelpers'

export default {
  name: 'PostTeaser',
  components: {
    Category,
    ContentMenu,
    CounterIcon,
    HcRibbon,
    UserTeaser,
  },
  props: {
    post: {
      type: Object,
      required: true,
    },
    width: {
      type: Object,
      default: () => {},
    },
    postsFilter: {
      type: Object,
      default: () => {},
    },
  },
  data() {
    return {
      categoriesActive: this.$env.CATEGORIES_ACTIVE,
    }
  },
  mounted() {
    const { image } = this.post
    if (!image) return
    const width = this.$el.offsetWidth
    const height = Math.min(width / image.aspectRatio, 2000)
    const imageElement = this.$el.querySelector('.hero-image')
    if (imageElement) {
      imageElement.style.height = `${height}px`
    }
  },
  computed: {
    ...mapGetters({
      user: 'auth/user',
    }),
    excerpt() {
      return this.$filters.removeLinks(this.post.contentExcerpt)
    },
    isAuthor() {
      const { author } = this.post
      if (!author) return false
      return this.user.id === this.post.author.id
    },
    menuModalsData() {
      return postMenuModalsData(
        // "this.post" may not always be defined at the beginning …
        this.post ? this.$filters.truncate(this.post.title, 30) : '',
        this.deletePostCallback,
      )
    },
    isPinned() {
      return this.post && this.post.pinned
    },
  },
  methods: {
    async deletePostCallback() {
      try {
        const {
          data: { DeletePost },
        } = await this.$apollo.mutate(deletePostMutation(this.post.id))
        this.$toast.success(this.$t('delete.contribution.success'))
        this.$emit('removePostFromList', DeletePost)
      } catch (err) {
        this.$toast.error(err.message)
      }
    },
    pinPost(post) {
      this.$emit('pinPost', post)
    },
    unpinPost(post) {
      this.$emit('unpinPost', post)
    },
    visibilityChanged(isVisible, entry, id) {
      if (!this.post.viewedTeaserByCurrentUser && isVisible) {
        this.$apollo
          .mutate({
            mutation: PostMutations().markTeaserAsViewed,
            variables: { id },
          })
          .catch((error) => this.$toast.error(error.message))
        this.post.viewedTeaserByCurrentUser = true
        this.post.viewedTeaserCount++
      }
    },
  },
}
</script>
<style lang="scss">
.post-teaser,
.post-teaser:hover,
.post-teaser:active {
  position: relative;
  display: block;
  height: 100%;
  color: $text-color-base;
}

.post-user-row {
  position: relative;

  > .post-ribbon-w-img {
    position: absolute;
    // 14px (~height of ribbon element) + 24px(=margin of hero image)
    top: -38px;
    // 7px+24px(=padding of parent)
    right: -31px;
  }
  > .post-ribbon {
    position: absolute;
    // 14px (~height of ribbon element) + 24px(=margin of hero image)
    top: -24px;
    // 7px(=offset)+24px(=margin of parent)
    right: -31px;
  }
}

.post-teaser > .base-card {
  display: flex;
  flex-direction: column;
  overflow: visible;
  height: 100%;

  > .hero-image {
    border-top-left-radius: 5px;
    border-top-right-radius: 5px;
  }

  &.--blur-image > .hero-image > .image {
    filter: blur($blur-radius);
  }

  > .content {
    flex-grow: 1;
    margin-bottom: $space-small;
  }

  > .footer {
    display: flex;
    justify-content: space-between;
    align-items: center;

    > .categories-placeholder {
      flex-grow: 1;
    }

    > .counter-icon {
      display: block;
      margin-right: $space-small;
      opacity: $opacity-disabled;
    }

    > .content-menu {
      position: relative;
      z-index: $z-index-post-teaser-link;
    }

    .ds-tag {
      margin: 0;
      margin-right: $space-xx-small;
    }
  }

  .user-teaser {
    margin-bottom: $space-small;
  }
}
</style>
