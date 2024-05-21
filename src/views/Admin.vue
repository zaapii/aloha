<script setup>
import { ref, computed, toRaw } from 'vue';
import { db } from '../../firebase';
import { collection, addDoc } from 'firebase/firestore';

// Declare the ref for items
const items = ref([]);
const loading = ref(false);
const date = ref('');
const price = ref(0);
const description = ref('');
const thumbnailUrl = ref('');
const isVegan = ref(false);
const customOrder = ref(false);

// Function to clear all items
const clearAll = () => {
  window.confirm('Are you sure you want to clear all items?') && (items.value = []);
};

// Function to add item to custom order
const addItemToCustomOrder = () => {
  date.value = new Date().toLocaleDateString();
  customOrder.value = true
  items.value.push({
    id: customOrder.value.length + 1,
    price: price.value,
    description: description.value,
    thumbnailUrl: thumbnailUrl.value,
    isVegan: isVegan.value,
  });
  price.value = 0;
  description.value = '';
  thumbnailUrl.value = '';
  isVegan.value = false;
};

// Function to handle file upload
const handleFileUpload = (event) => {
  const file = event.target.files[0];
  if (file && file.type === 'text/plain') {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const jsonData = JSON.parse(e.target.result);
        date.value = new Date().toLocaleDateString();
        // Map JSON data to the desired structure
        items.value = jsonData.map((item) => ({
          id: item.id,
          price: item.priceInfo?.itemPrice?.value || item.priceInfo?.linePrice?.value,
          description: item.product?.name || item.productInfo.name,
          thumbnailUrl: item.product?.imageInfo?.thumbnailUrl || item.productInfo.imageInfo.thumbnailUrl,
          isVegan: true,
        }));
      } catch (error) {
        console.error('Error parsing JSON:', error);
      }
    };
    reader.readAsText(file);
  } else {
    console.error('Please upload a valid .txt file containing JSON data.');
  }
};


const setIsVegan = (e, id) => {
  const item = items.value.find((item) => item.id === id);
  item.isVegan = e.target.checked;
};

const uploadBuy = async () => {
  loading.value = true;
  // Convert items to raw data
  const itemsRaw = toRaw(items.value)

  const order = {
    fecha: date.value || new Date().toLocaleDateString(),
    productos: itemsRaw,
    total: total.value,
    totalPame: totalPame.value,
    totalGene: totalGene.value,
  }

  try {
    const comprasCollection = collection(db, "compras")
    await addDoc(comprasCollection, order)
    clearAll()
    console.log('Buy uploaded successfully:', order)
  } catch (error) {
    console.error('Error uploading buy:', error);
  } finally {
    loading.value = false;
  }
};

// Computed property to calculate the total price
const total = computed(() => {
  return items.value.reduce((total, item) => total + item.price, 0);
});

const totalNotVegan = computed(() => {
  return items.value.reduce((total, item) => {
    return item.isVegan ? total : total + item.price;
  }, 0);
});

const totalPame = computed(() => {
  return (total.value - totalNotVegan.value) / 4
});

const totalGene = computed(() => {
  return (total.value) / 4
});
</script>

<template>
  <div class="flex justify-center pt-16 flex-col items-center gap-32" v-if="!items.length || customOrder">
    <div class="flex w-3/4 md:w-1/2">
      <input type="file" @change="handleFileUpload"
        class="file-input file-input-bordered file-input-secondary w-full" />
    </div>

    <div class="flex flex-col gap-8 w-full p-4 md:w-1/2">
      <div class="text-4xl text-secondary text-bold mb-4">
        Carga de compra manual
      </div>
      <div class="flex w-full gap-2 justify-between">
        <input type="text" placeholder="Descripcion" class="input input-bordered w-3/4" v-model="description" />
        <input type="number" class="input input-bordered w-1/4" v-model="price" />
      </div>
      <input type="text" placeholder="Imagen" class="input input-bordered w-full" v-model="thumbnailUrl" />
      <label class="label cursor-pointer w-full justify-center flex gap-4">
        <span class="label-text">Es Vegano?</span>
        <input type="checkbox" checked="checked" class="checkbox checkbox-secondary" v-model="isVegan" />
      </label>
      <div class="flex flex-col md:flex-row gap-2 w-full justify-between my-4">
        <button @click="clearAll" class="btn btn-secondary">Limpiar items</button>
        <button @click="addItemToCustomOrder" class="btn btn-primary">Agregar item a la compra</button>
      </div>
    </div>
    <div v-if="items.length && !loading" class="overflow-x-auto p-4 md:p-32">
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
              <img :src="item.thumbnailUrl" alt="Product Image" class="md:w-24 md:h-24 object-cover" v-if="item.thumbnailUrl">
            </td>
            <td>{{ item.description }}</td>
            <td>
              <input type="checkbox" :checked="item.isVegan" :disabled="customOrder" class="checkbox checkbox-lg checkbox-secondary"
                @change="setIsVegan($event, item.id)" />
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
        <button @click="uploadBuy" :loading="loading" class="btn btn-secondary mt-8">Upload</button>
      </div>
    </div>
  </div>
</template>