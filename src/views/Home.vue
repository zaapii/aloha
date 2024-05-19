<script setup>
import { ref, computed } from 'vue';
import { db } from '../../firebase';
import { collection, addDoc, getDocs, updateDoc, doc, deleteDoc } from 'firebase/firestore';
import { get } from 'firebase/database';

const itemsAdded = ref([]);
const itemsRemoved = ref([]);
const compras = ref([]);
const nombre = ref('');
const loadingAdd = ref(false);
const loadingProducts = ref(false);
const buscarAgregados = ref('');
const buscarComprados = ref('');
const newNote = ref({ title: '', content: '', color: 'warning' });
const notes = ref([]);
const notasLoading = ref(false);

const getCompras = async () => {
  loadingProducts.value = true;
  try {
    const comprasCollection = collection(db, "compras");
    const comprasSnapshot = await getDocs(comprasCollection);
    comprasSnapshot.forEach((doc) => {
      compras.value.push({
        ...doc.data(),
        id: doc.id,
      });
    });
  } catch (error) {
    console.error('Error getting compras:', error);
  } finally {
    loadingProducts.value = false;
  }
};

const getProductos = async () => {
  loadingProducts.value = true;
  itemsAdded.value = [];
  itemsRemoved.value = [];
  try {
    const productosCollection = collection(db, "productos");
    const productosSnapshot = await getDocs(productosCollection);
    productosSnapshot.forEach((doc) => {
      if (doc.data().comprado) {
        itemsRemoved.value.push({
          ...doc.data(),
          id: doc.id,
        });
      }
      else {
        itemsAdded.value.push({
          ...doc.data(),
          id: doc.id,
        });
      }
    });

    console.log('Items added:', itemsAdded.value);
  } catch (error) {
    console.error('Error getting items:', error);
  } finally {
    loadingProducts.value = false;
  }
};

const getNotas = async () => {
  notes.value = [];
  try {
    const notesCollection = collection(db, 'notes');
    const notesSnapshot = await getDocs(notesCollection);
    notesSnapshot.forEach((doc) => {
      notes.value.push({
        ...doc.data(),
        id: doc.id,
      });
    });
  } catch (error) {
    console.error('Error getting notes:', error);
  }
};

getProductos();
getCompras();
getNotas()

const addItemFromTap = async (itemToAdd) => {
  if (itemsAdded.value.some(item => item.nombre === itemToAdd.nombre) || !itemToAdd.id) {
    return;
  }

  const productosCollection = collection(db, "productos");
  try {
    loadingProducts.value = true;
    await updateDoc(doc(productosCollection, itemToAdd.id), {
      ...itemToAdd,
      comprado: false,
    });
    await getProductos();
  } catch (error) {
    console.error('Error adding item:', error);
  }
};
const removeItem = async (itemToRemove) => {
  if (itemsRemoved.value.some(item => item.id === itemToRemove.id) || !itemToRemove.id) {
    return;
  }
  const productosCollection = collection(db, "productos");
  try {
    loadingProducts.value = true;
    await updateDoc(doc(productosCollection, itemToRemove.id), {
      ...itemToRemove,
      comprado: true,
    });
    await getProductos();
  } catch (error) {
    console.error('Error removing item:', error);
  } finally {
    loadingProducts.value = false;
  }
};

const addItem = async () => {
  if (itemsAdded.value.some(item => item.nombre === nombre.value) || !nombre.value) {
    return;
  }
  try {
    loadingAdd.value = true;

    const productosCollection = collection(db, "productos");
    const producto = {
      nombre: nombre.value,
      esFavorito: false,
      comprado: false,
    }
    await addDoc(productosCollection, producto);
    await getProductos();
  } catch (error) {
    console.error('Error adding item:', error);
  } finally {
    loadingAdd.value = false;
    nombre.value = '';
  }
};

const verDetalle = (id) => {
  compras.value.find(compra => compra.id === id).verDetalle = !compras.value.find(compra => compra.id === id).verDetalle;
};

const agregadosFiltered = computed(() => {
  return itemsAdded.value.filter((item) => item.nombre.toLowerCase().includes(buscarComprados.value.toLowerCase()));
});

const compradosFiltered = computed(() => {
  return itemsRemoved.value.filter((item) => item.nombre.toLowerCase().includes(buscarAgregados.value.toLowerCase()));
});

const addNote = async () => {
  notasLoading.value = true;
  try {
    if (newNote.value.content.trim() !== '') {
      const notesRef = collection(db, 'notes');
      addDoc(notesRef, newNote.value);
      newNote.value = {
        title: '',
        content: '',
        color: newNote.color || 'warning',
      }
      await getNotas();
    }
  } catch (error) {
    console.error('Error adding note:', error);
  } finally {
    notasLoading.value = false;
  }
};

const deleteNote = async (index) => {
  notasLoading.value = true;
  try {
    const note = notes.value[index];
    const noteRef = doc(db, 'notes', note.id);
    await deleteDoc(noteRef);
    await getNotas();
  } catch (error) {
    console.error('Error deleting note:', error);
  } finally {
    notasLoading.value = false;
  }
};

const setNoteColor = (color) => {
  newNote.value.color = color;
};

const noteColors = ['primary', 'secondary', 'warning', 'error', 'success', 'info', 'accent'];

</script>

<template>
  <div class="bg-primary hidden">sarasa</div>
  <div class="bg-info hidden">sarasa</div>
  <div class="bg-warning hidden">sarasa</div>
  <div class="bg-error hidden">sarasa</div>
  <div class="bg-success hidden">sarasa</div>
  <div class="bg-secondary hidden">sarasa</div>
  <div class="bg-accent hidden">sarasa</div>

  <div class="flex justify-center">
    <div class="flex flex-col w-full md:w-3/4 p-8 md:p-16">
      <div class="title">
        <p class="aloha text-center text-4xl">
          Cositas para comprar
        </p>
      </div>
      <div class="divider"></div>
      <div class="mockup-window border bg-base-300 h-5/6">
        <div class="flex flex-col h-full">
          <div class="join w-full sticky top-0 bg-base-300 z-10 p-4">
            <input class="input input-bordered w-4/6 join-item" placeholder="Item" v-model="nombre" />
            <button class="btn join-item rounded-r-full w-2/6" @click="addItem" :loading="loadingAdd">Agregar</button>
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
                <template v-if="loadingProducts">
                  <div class="flex justify-center">
                    <span class="loading loading-ring loading-lg" v-if="loadingProducts"></span>
                  </div>
                </template>
                <template v-else>
                  <input class="input input-bordered w-full" placeholder="Buscar" v-model="buscarAgregados" />
                  <p class="text-center text-green-600 text-2xl cursor-pointer" v-for="(itemAdded, index) in agregadosFiltered"
                    :key="`a-${index}`" @click="removeItem(itemAdded)">{{ itemAdded.nombre }}</p>
                </template>
              </div>
              <div class="divider divider-horizontal"></div>
              <div class="flex flex-col gap-4 w-1/2">
                <div class="title-divider pt-2">
                  <div class="list-title">
                    <p class="aloha text-center md:text-4xl">Comprados</p>
                  </div>
                  <div class="divider m-0"></div>
                </div>
                <template v-if="loadingProducts">
                  <div class="flex justify-center">
                    <span class="loading loading-ring loading-lg" v-if="loadingProducts"></span>
                  </div>
                </template>
                <template v-else>
                  <input class="input input-bordered w-full" placeholder="Buscar" v-model="buscarComprados" />
                  <p class="text-center text-red-600 text-2xl cursor-pointer" v-for="(itemRemoved, index) in compradosFiltered"
                    :key="`r-${index}`" @click="addItemFromTap(itemRemoved)">{{ itemRemoved.nombre }}</p>
                </template>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="sm:container sm:mx-auto pt-16">
        <p class="aloha text-center text-4xl ">
          Notas
        </p>
        <div class="divider"></div>
        <div class="window rounded-lg shadow-xl bg-base-300 w-full p-4">
          <div class="flex flex-col sm:flex-row items-center justify-between mb-4">
            <h2 class="text-lg font-bold">Notes</h2>
            <button class="btn btn-sm btn-primary hidden md:flex" @click="addNote">Add Note</button>
          </div>
          <input v-model="newNote.title"
            :class="['input input-note input-bordered mb-4 w-full', newNote.color && `bg-${newNote.color}`]"
            placeholder="Title" />
          <textarea v-model="newNote.content"
            :class="['textarea input-note textarea-bordered mb-4 w-full', newNote.color && `bg-${newNote.color}`]"
            rows="3" placeholder="Escribe tu nota..."></textarea>
          <div class="flex gap-1">
            <div v-for="(color, index) in noteColors" :key="index"
              :class="`w-12 h-12 rounded cursor-pointer bg-${color}`" @click="setNoteColor(color)">
            </div>
          </div>
          <div class="flex justify-center py-4">
            <button class="btn btn-sm btn-primary md:hidden" @click="addNote">Add Note</button>
          </div>
        </div>
        <div class="window p-8">
          <div class="flex gap-4 flex-wrap justify-center">
            <div v-for="(note, index) in notes" :key="index" class="py-2 sm:w-1/4">
              <div :class="`bg-${note.color} p-2 rounded-md`" style="width: 300px;"> <!-- Fixed width -->
                <div class="flex items-center justify-between gap-2">
                  <span class="text-black font-bold">{{ note.title }}</span>
                  <button @click="deleteNote(index)" class="btn btn-sm btn-error text-black">X</button>
                </div>
                <div class="flex items-center justify-between gap-2">
                  <span class="text-black">{{ note.content }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>


      <p class="aloha text-center text-4xl pt-16">
        Compras
      </p>
      <div class="divider"></div>

      <div class="card w-full bg-base-100 shadow-xl border border-secondary" v-for="compra in compras" :key="compra.id">
        <div class="card-body">
          <h2 class="card-title text-2xl font-bold mb-4">Resumen de la compra</h2>
          <div class="flex items-center justify-between mb-4">
            <div class="text-3xl font-semibold text-primary">
              {{ compra.fecha }}
            </div>
          </div>
          <div class="flex items-center justify-between mb-4">
            <div class="text-xl">
              <strong>Cantidad Productos:</strong> {{ compra.productos.length }}
            </div>
          </div>
          <div class="flex flex-col gap-3 md:flex-row md:gap-0 items-center justify-between mb-4">
            <div class="text-5xl text-center md:text-left">
              <strong>Total:</strong> ${{ compra.total }}
            </div>
            <div class="text-2xl text-secondary">
              <strong>Total Gene:</strong> ${{ compra.totalGene.toFixed(2) }}
            </div>
            <div class="text-2xl text-secondary">
              <strong>Total Pame:</strong> ${{ compra.totalPame.toFixed(2) }}
            </div>
            <button class="btn btn-secondary" @click="verDetalle(compra.id)">{{ compra.verDetalle ? 'Ocultar' : 'Ver' }}
              Detalle</button>
          </div>
          <div class="flex flex-wrap mt-4">
            <div v-for="(product, index) in compra.productos" :key="index" class="avatar m-2">
              <div class="w-16 rounded">
                <img :src="product.thumbnailUrl" :alt="product.description" />
              </div>
            </div>
          </div>

          <table class="table w-full table-zebra" v-if="compra.verDetalle">
            <thead>
              <tr>
                <th class="text-left">Image</th>
                <th class="text-left">Description</th>
                <th class="text-left">isVegan?</th>
                <th class="text-left">Price</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="item in compra.productos" :key="item.id">
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
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.input-note {
  color: #000 !important;
}

.input-note::placeholder {
  color: #000 !important;
}
</style>
