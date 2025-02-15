<template>
  <div>
    <ds-space margin="small">
      <tab-navigation :tabs="tabOptions" :activeTab="tabActive" @switch-tab="handleTab" />
    </ds-space>
    <ds-space margin="large" />
    <ds-space>
      <!-- create group -->
      <ds-space centered>
        <nuxt-link :to="{ name: 'group-create' }">
          <base-button
            class="group-add-button"
            icon="plus"
            size="large"
            circle
            filled
            v-tooltip="{
              content: $t('group.createNewGroup.tooltip'),
              placement: 'left',
            }"
          />
        </nuxt-link>
      </ds-space>
      <!-- group list -->
      <ds-space centered v-if="showPagination">
        <pagination-buttons
          :hasNext="hasNext"
          :showPageCounter="true"
          :hasPrevious="hasPrevious"
          :activePage="activePage"
          :activeResourceCount="activeTab.count"
          :key="'Top'"
          :pageSize="pageSize"
          @back="previousResults"
          @next="nextResults"
        />
      </ds-space>
      <group-list :groups="myGroups" />
      <ds-space centered v-if="showPagination">
        <pagination-buttons
          :hasNext="hasNext"
          :showPageCounter="true"
          :hasPrevious="hasPrevious"
          :activePage="activePage"
          :activeResourceCount="activeTab.count"
          :key="'Bottom'"
          :pageSize="pageSize"
          @back="previousResults"
          @next="nextResults"
        />
      </ds-space>
    </ds-space>
  </div>
</template>

<script>
import GroupList from '~/components/Group/GroupList'
import { groupQuery, groupCountQuery } from '~/graphql/groups.js'
import TabNavigation from '~/components/_new/generic/TabNavigation/TabNavigation'
import PaginationButtons from '~/components/_new/generic/PaginationButtons/PaginationButtons'

const tabToFilterMapping = (tab) => {
  return {
    myGroups: { isMember: true },
    allGroups: {},
  }[tab]
}

export default {
  name: 'Groups',
  components: {
    GroupList,
    TabNavigation,
    PaginationButtons,
  },
  data() {
    return {
      Group: [],
      groupFilter: { isMember: true },
      tabActive: 'myGroups',
      pageSize: 5,
      activePage: 0,
      myGroupsCount: 0,
      allGroupsCount: 0,
    }
  },
  methods: {
    handleTab(tab) {
      if (this.tabActive !== tab) {
        this.tabActive = tab
        this.activePage = 0
        this.groupFilter = tabToFilterMapping(tab)
        this.$apollo.queries.Group.refetch()
      }
    },
    previousResults() {
      this.activePage--
      this.$apollo.queries.Group.refetch()
    },
    nextResults() {
      this.activePage++
      this.$apollo.queries.Group.refetch()
    },
  },
  computed: {
    activeTab() {
      return this.tabOptions.find((tab) => tab.type === this.tabActive)
    },
    showPagination() {
      return this.activeTab.count > this.pageSize
    },
    hasNext() {
      return (this.activePage + 1) * this.pageSize < this.activeTab.count
    },
    hasPrevious() {
      return this.activePage > 0
    },
    pagination() {
      return {
        first: this.pageSize,
        offset: this.activePage * this.pageSize,
      }
    },
    myGroups() {
      return this.Group ? this.Group : []
    },
    tabOptions() {
      return [
        {
          type: 'myGroups',
          title: this.$t('group.myGroups'),
          count: this.myGroupsCount,
          disabled: this.myGroupsCount === 0,
        },
        {
          type: 'allGroups',
          title: this.$t('group.allGroups'),
          count: this.allGroupsCount,
          disabled: this.allGroupsCount === 0,
        },
      ]
    },
  },
  apollo: {
    Group: {
      query() {
        return groupQuery(this.$i18n)
      },
      variables() {
        return {
          ...this.groupFilter,
          ...this.pagination,
        }
      },
      error(error) {
        this.Group = []
        this.$toast.error(error.message)
      },
      fetchPolicy: 'cache-and-network',
    },
    MyGroupsCount: {
      query() {
        return groupCountQuery()
      },
      variables() {
        return {
          isMember: true,
        }
      },
      update({ GroupCount }) {
        this.myGroupsCount = GroupCount
      },
      fetchPolicy: 'cache-and-network',
    },
    AllGroupsCount: {
      query() {
        return groupCountQuery()
      },
      update({ GroupCount }) {
        this.allGroupsCount = GroupCount
      },
      fetchPolicy: 'cache-and-network',
    },
  },
}
</script>

<style lang="scss">
.group-add-button {
  box-shadow: $box-shadow-x-large;
}
</style>
