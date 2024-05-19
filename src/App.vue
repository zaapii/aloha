<template>
  <div class="navbar bg-secondary text-primary-content px-8 flex justify-between">
    <RouterLink to="/">
      <p class="aloha text-3xl md:text-6xl">Aloha</p>
    </RouterLink>
    <a href="https://www.surfline.com/surf-reports-forecasts-cams/united-states/hawaii/honolulu-county/o-ahu/honolulu/5856195" target="blank">
      <p class="aloha md:text-5xl">🏄</p>
    </a>
    <RouterLink to="/admin">
      <p class="aloha text-3xl md:text-6xl">Mahalo</p>
    </RouterLink>
  </div>
  <main>
    <RouterView />
  </main>
</template>

<style>
@import url('https://fonts.googleapis.com/css2?family=Danfo&display=swap');

.aloha {
  font-family: "Danfo", serif;
  font-optical-sizing: auto;
  font-weight: 400;
  font-style: normal;
  font-variation-settings:
    "ELSH" 0;
}

</style>