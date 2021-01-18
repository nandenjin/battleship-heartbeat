<template>
  <div>
    <h2>Clients</h2>
    <table class="table">
      <tr>
        <th>Role</th>
        <th>ID</th>
        <th>UID</th>
        <th>Controller</th>
      </tr>
      <tr
        v-for="client of clients"
        :key="client.id"
        :class="{ 'is-selected': selectedId === client.id }"
        @click="selectedId = client.id"
      >
        <td>{{ Role[client.role] }}</td>
        <td>{{ client.id.substring(0, 6) }}</td>
        <td>{{ client.uid?.substring(0, 6) || '(N/A)' }}</td>
        <td>{{ client.controller?.substring(0, 6) || '(N/A)' }}</td>
      </tr>
    </table>
    <h2>Controllers</h2>
    <table class="table">
      <tr>
        <th>ID</th>
        <th>Address</th>
        <th>lastOpr</th>
        <th></th>
      </tr>
      <tr
        v-for="controller of controllers"
        :key="controller.id"
        :class="{
          'is-assigned': clients.some(
            ({ controller: cid }) => cid === controller.id
          ),
        }"
      >
        <td>{{ controller.id?.substring(0, 6) }}</td>
        <td>{{ controller.address }}</td>
        <td>{{ controller.lastOpr }}</td>
        <td>
          <button
            :disabled="!selectedId"
            @click="assignControllerToClient(selectedId, controller.id)"
          >
            Select
          </button>
        </td>
      </tr>
    </table>
  </div>
</template>

<script lang="ts">
import { computed, defineComponent, ref } from 'vue'
import { useStore } from 'vuex'
import { ASSIGN_CONTROLLER_TO_CLIENT, key, State } from './store'
import { Role } from './types'

export default defineComponent({
  setup() {
    const store = useStore<State>(key)
    const selectedId = ref<string | null>(null)

    return {
      Role,
      clients: computed(() => store.state.clients),
      controllers: computed(() => store.state.controllers),
      selectedId,
      assignControllerToClient: (client: string, controller: string) =>
        store.dispatch(ASSIGN_CONTROLLER_TO_CLIENT, { client, controller }),
    }
  },
})
</script>

<style lang="scss" scoped>
.table {
  border-collapse: collapse;
  tr,
  th,
  td {
    border: 1px solid #888;
    padding: 5px;
  }

  tr {
    &.is-selected {
      background-color: rgba(255, 255, 0, 0.2);
    }
    &.is-assigned {
      background-color: rgba(0, 255, 0, 0.2);
    }
  }
}
</style>
