<template>
  <nuxt-link
    v-if="!unreadNotificationsCount"
    class="notifications-menu"
    :to="{ name: 'notifications' }"
  >
    <base-button icon="bell" ghost circle />
  </nuxt-link>
  <dropdown v-else class="notifications-menu" offset="8" :placement="placement">
    <template #default="{ toggleMenu }">
      <base-button @click="toggleMenu" ghost circle>
        <counter-icon icon="bell" :count="unreadNotificationsCount" danger />
      </base-button>
    </template>
    <template #popover>
      <div class="notifications-menu-popover">
        <notification-list :notifications="notifications" @markAsRead="markAsRead" />
      </div>
      <ds-flex class="notifications-link-container">
        <ds-flex-item :width="{ base: 'auto' }" centered>
          <nuxt-link :to="{ name: 'notifications' }">
            <ds-button ghost primary>
              {{ $t('notifications.pageLink') }}
            </ds-button>
          </nuxt-link>
        </ds-flex-item>
        <ds-flex-item :width="{ base: 'auto' }" centered>
          <ds-button ghost primary @click="markAllAsRead" data-test="markAllAsRead-button">
            {{ $t('notifications.markAllAsRead') }}
          </ds-button>
        </ds-flex-item>
      </ds-flex>
    </template>
  </dropdown>
</template>

<script>
import { mapGetters } from 'vuex'
import unionBy from 'lodash/unionBy'
import {
  notificationQuery,
  markAsReadMutation,
  notificationAdded,
  markAllAsReadMutation,
} from '~/graphql/User'
import CounterIcon from '~/components/_new/generic/CounterIcon/CounterIcon'
import Dropdown from '~/components/Dropdown'
import NotificationList from '../NotificationList/NotificationList'

export default {
  name: 'NotificationMenu',
  components: {
    CounterIcon,
    Dropdown,
    NotificationList,
  },
  data() {
    return {
      notifications: [],
    }
  },
  props: {
    placement: { type: String },
  },
  methods: {
    async markAsRead(notificationSourceId) {
      const variables = { id: notificationSourceId }
      try {
        await this.$apollo.mutate({
          mutation: markAsReadMutation(this.$i18n),
          variables,
        })
      } catch (error) {
        this.$toast.error(error.message)
      }
    },
    async markAllAsRead() {
      if (!this.hasNotifications) {
        return
      }

      try {
        await this.$apollo.mutate({
          mutation: markAllAsReadMutation(this.$i18n),
        })
      } catch (error) {
        this.$toast.error(error.message)
      }
    },
  },
  computed: {
    ...mapGetters({
      user: 'auth/user',
    }),
    unreadNotificationsCount() {
      const result = this.notifications.reduce((count, notification) => {
        return notification.read ? count : count + 1
      }, 0)
      return result
    },
    hasNotifications() {
      return this.notifications.length
    },
  },
  apollo: {
    notifications: {
      query() {
        return notificationQuery(this.$i18n)
      },
      variables() {
        return {
          read: false,
          orderBy: 'updatedAt_desc',
        }
      },
      subscribeToMore: {
        document: notificationAdded(),
        variables() {
          return {
            userId: this.user.id,
          }
        },
        updateQuery: (previousResult, { subscriptionData }) => {
          const {
            data: { notificationAdded: newNotification },
          } = subscriptionData
          return {
            notifications: unionBy(
              [newNotification],
              previousResult.notifications,
              (notification) => notification.id,
            ).sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt)),
          }
        },
      },
      error(error) {
        this.$toast.error(error.message)
      },
    },
  },
}
</script>

<style lang="scss">
.notifications-menu-popover {
  max-width: 500px;
  margin-bottom: $size-height-base;
}
.notifications-link-container {
  background-color: $background-color-softer-active;
  justify-content: center;
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  height: $size-height-base;
  padding: $space-x-small;
}
</style>
