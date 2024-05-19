<script setup>
import { ref, computed } from 'vue';

// Declare the ref for items
const items = ref([]);
const date = ref('');

// Function to clear all items
const clearAll = () => {
  items.value = [];
};

// Function to handle file upload
const handleFileUpload = (event) => {
  const file = event.target.files[0];
  if (file && file.type === 'text/plain') {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const jsonData = JSON.parse(e.target.result);
        date.value = jsonData[0].createdDateTime.split('T')[0];
        // Map JSON data to the desired structure
        items.value = jsonData.map((item) => ({
          id: item.id,
          price: item.priceInfo.itemPrice.value,
          description: item.product.name,
          thumbnailUrl: item.product.imageInfo.thumbnailUrl,
          isVegan: item.product.isVegan,
        }));
        console.log('Extracted Items:', items.value);
      } catch (error) {
        console.error('Error parsing JSON:', error);
      }
    };
    reader.readAsText(file);
  } else {
    console.error('Please upload a valid .txt file containing JSON data.');
  }
};

// Computed property to calculate the total price
const total = computed(() => {
  return items.value.reduce((total, item) => total + item.price, 0);
});
</script>

<template>
  <div class="flex justify-center pt-16" v-if="!items.length">
    <div class="flex w-3/4 md:w-1/2">
      <input type="file" @change="handleFileUpload"
        class="file-input file-input-bordered file-input-secondary w-full" />
    </div>
  </div>
  <div v-if="items.length" class="overflow-x-auto p-4 md:p-32">
    <h2 class="text-2xl font-bold text-center text-secondary">Compra hecha el {{ date }}</h2>
    <div class="divider"></div>
    <table class="table w-full table-zebra">
      <thead>
        <tr>
          <th class="text-left">Image</th>
          <th class="text-left">Description</th>
          <th class="text-left">isVegan?</th>
          <th class="text-left">Price</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="item in items" :key="item.id">
          <td>
            <img :src="item.thumbnailUrl" alt="Product Image" class="md:w-24 md:h-24 object-cover">
          </td>
          <td>{{ item.description }}</td>
          <td>
            <div v-if="item.isVegan">
              <img src="https://seeklogo.com/images/V/vegan-logo-ACE43D0D9E-seeklogo.com.png" alt="Vegan Logo"
                class="w-10 h-10">
            </div>
          </td>
          <td class="text-secondary font-bold">$ {{ item.price }}</td>
        </tr>
        <tr>
          <td></td>
          <td></td>
          <td class="text-left font-bold text-lg">Total:</td>
          <td class="text-left font-bold text-lg">$ {{ total }}</td>
        </tr>
      </tbody>
    </table>
    <div class="flex w-full gap-2 justify-center">
      <button @click="clearAll" class="btn btn-primary mt-8">Clear Items</button>
      <button @click="uploadBuy" class="btn btn-secondary mt-8">uploadBuy</button>
    </div>
  </div>
</template>