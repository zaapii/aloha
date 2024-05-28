<script setup>
import { ref, computed, toRaw } from 'vue';
import { db } from '../../firebase';
import { collection, addDoc } from 'firebase/firestore';
import { useRoute } from 'vue-router';
import { toast } from 'vue3-toastify';

// Declare the ref for items
const items = ref([]);
const loading = ref(false);
const date = ref('');
const price = ref(0);
const description = ref('');
const thumbnailUrl = ref('');
const isVegan = ref(false);
const customOrder = ref(false);
const comprador = ref('')

const compradores = [
  'Gene',
  'Huay',
  'Larima'
]

const route = useRoute();

// Function to clear all items
const clearAll = () => {
  items.value = []
};

const setComprador = (e) => {
  comprador.value = e.target.value
}

// Function to add item to custom order
const addItemToCustomOrder = () => {
  date.value = new Date().toLocaleDateString();
  customOrder.value = true
  items.value.push({
    price: price.value,
    description: description.value,
    thumbnailUrl: thumbnailUrl.value,
    isVegan: isVegan.value,
  });
  
  toast(`Agregado ${description.value} a la compra. ${isVegan.value ? 'Es vegano asi que Huay is happy' : ''}`, {
    autoClose: 2000,
    position: toast.POSITION.BOTTOM_RIGHT,
    theme: "dark",
    type: "success"
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
        console.log('JSON data:', jsonData);
        date.value = new Date().toLocaleDateString();
        // Map JSON data to the desired structure
        items.value = jsonData.map((item) => ({
          id: item.id,
          price: item.priceInfo?.itemPrice?.value || item.priceInfo?.linePrice?.value,
          description: item.product?.name || item.productInfo?.name,
          thumbnailUrl: item.product?.imageInfo?.thumbnailUrl || item.productInfo?.imageInfo?.thumbnailUrl || '',
          isVegan: true,
        }));

        console.log('Items:', items.value);
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
    totalHuay: totalHuay.value,
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

const totalHuay = computed(() => {
  return (total.value - totalNotVegan.value) / 4
});

const totalGene = computed(() => {
  return (total.value) / 4
});



// Function to remove item
const removeItem = (id) => {
  items.value = items.value.filter((item) => item.id !== id);
};
</script>

<template>
  <div class="flex justify-center pt-8 flex-col items-center">
    <div class="flex w-3/4 md:w-1/2" v-if="route.query.ima && (!items.length || customOrder)">
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
      <div class="flex w-full justify-center my-4">
        <button @click="addItemToCustomOrder" class="btn btn-primary">Agregar item a la compra</button>
      </div>
    </div>
    <div v-if="items.length && !loading" class="overflow-x-auto p-0 py-8 w-1/2">
      <div class="divider"></div>
      <h2 class="text-2xl font-bold text-center text-secondary">Compra hecha el {{ date }}</h2>
      <div class="divider"></div>
      <table class="table w-full table-zebra">
        <thead>
          <tr>
            <th class="text-left hidden md:block">Image</th>
            <th class="text-left">Description</th>
            <th class="text-left">isVegan?</th>
            <th class="text-left">Price</th>
            <th class="text-left">Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="item in items" :key="item.id">
            <td class="hidden md:block">
              <img :src="item.thumbnailUrl" alt="Product Image" class="md:w-24 md:h-24 object-cover" v-if="item.thumbnailUrl">
            </td>
            <td>{{ item.description }}</td>
            <td>
              <input type="checkbox" :checked="item.isVegan" :disabled="customOrder" class="checkbox checkbox-lg checkbox-secondary"
                @change="setIsVegan($event, item.id)" />
            </td>
            <td class="text-secondary font-bold whitespace-nowrap">$ {{ item.price }}</td>
            <td>
              <button @click="removeItem(item.id)" class="btn btn-error btn-xs">Remove</button>
            </td>
          </tr>
          <tr>
            <td class="hidden md:block"></td>
            <td class="text-left font-bold text-lg">Total:</td>
            <td class="text-left font-bold text-lg whitespace-nowrap">$ {{ total }}</td>
            <td></td>
            <td></td>
          </tr>
        </tbody>
      </table>
    </div>
    <div class="flex flex-col w-full justify-center pb-8 p-4 w-full md:w-1/2" v-if="items.length && !loading">
      <div class="text-2xl text-secondary py-2">Quien compra?</div>
      <div class="form-control flex gap-2" v-for="comprador in compradores" :key="comprador">
        <label class="label cursor-pointer">
          <span class="label-text">{{ comprador }}</span> 
          <input type="radio" name="radio-10" class="radio radio-secondary" @change="setComprador" />
        </label>
      </div>
      <button @click="clearAll" class="btn btn-primary mt-8">Borrar Items</button>
      <button @click="uploadBuy" :loading="loading" class="btn btn-secondary mt-8">Subir compra</button>
    </div>
  </div>
</template>