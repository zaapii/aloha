<script setup>
import { ref } from 'vue';

const itemsAdded = ref([]);
const itemsRemoved = ref([]);
const item = ref('');

const addItemFromTap = (itemToAdd) => {
  if (itemsAdded.value.includes(itemToAdd)) {
    return;
  }
  itemsRemoved.value = itemsRemoved.value.filter((item) => item !== itemToAdd);
  itemsAdded.value.push(itemToAdd);
};

const addItem = () => {
  if (itemsAdded.value.includes(item.value) || !item.value) {
    return;
  }
  itemsAdded.value.push(item.value);
  item.value = '';
};

const removeItem = (itemToRemove) => {
  if (itemsRemoved.value.includes(itemToRemove) || !itemToRemove) {
    return;
  }
  itemsAdded.value = itemsAdded.value.filter((item) => item !== itemToRemove);
  itemsRemoved.value.push(itemToRemove);
};
</script>

<template>
  <div class="flex justify-center">
    <div class="flex flex-col w-full md:w-3/4 p-8 md:p-16 h-screen">
      <div class="title">
        <p class="aloha text-center text-4xl">
          Cositas para comprar
        </p>
      </div>
      <div class="divider"></div>
      <div class="mockup-window border bg-base-300 h-5/6">
        <div class="flex flex-col h-full">
          <div class="join w-full sticky top-0 bg-base-300 z-10 p-4">
            <input class="input input-bordered w-4/6 join-item" placeholder="Item" v-model="item" />
            <button class="btn join-item rounded-r-full w-2/6" @click="addItem">Agregar</button>
          </div>
          <div class="flex justify-center px-4 flex-col gap-8 pb-16 h-full overflow-y-auto">
            <div class="flex w-full h-full">
              <div class="flex flex-col gap-4 w-1/2">
                <div class="title-divider pt-2">
                  <div class="list-title">
                    <p class="aloha text-center md:text-4xl">Agregados</p>
                  </div>
                  <div class="divider m-0"></div>
                </div>
                <p class="text-center text-green-600" v-for="(itemAdded, index) in itemsAdded" :key="`a-${index}`" @click="removeItem(itemAdded)">{{ itemAdded }}</p>
              </div>
              <div class="divider divider-horizontal"></div>
              <div class="flex flex-col gap-4 w-1/2">
                <div class="title-divider pt-2">
                  <div class="list-title">
                    <p class="aloha text-center md:text-4xl">Comprados</p>
                  </div>
                  <div class="divider m-0"></div>
                </div>
                <p class="text-center text-red-600 line-through" v-for="(itemRemoved, index) in itemsRemoved" :key="`r-${index}`" @click="addItemFromTap(itemRemoved)">{{ itemRemoved }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped></style>
