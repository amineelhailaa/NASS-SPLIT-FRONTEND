<script setup>
import AppFooter from '@/components/AppFooter.vue'
</script>

<template>
  <div
    class="relative flex flex-col overflow-x-hidden bg-cerulean-50 text-cerulean-800"
    style="font-family: 'Plus Jakarta Sans', sans-serif"
  >
    <!-- Hero -->
    <section class="relative px-16 pt-40 pb-36 overflow-hidden">
      <div class="absolute top-0 right-0 w-96 h-96 bg-cerulean-500/10 rounded-full blur-3xl -z-10"></div>
      <div class="flex flex-col gap-8 max-w-3xl">
        <div class="inline-flex w-fit rounded-full bg-cerulean-500/10 px-5 py-1.5">
          <span class="text-cerulean-500 font-bold text-sm tracking-wide">ESTABLISHED 2024</span>
        </div>
        <h1 class="text-6xl md:text-8xl text-black opacity-90 font-extrabold tracking-tight leading-none">
          About <br />
          <span class="text-cerulean-600"
          >Nass Split</span>
        </h1>
        <p class="text-2xl text-cerulean-800/70 leading-relaxed font-medium">
          To bring peace and transparency to shared living through stress-free finance management.
        </p>
      </div>
    </section>

    <!-- Story -->
    <section class="bg-white px-16 py-24">
      <div class="grid lg:grid-cols-12 gap-8 items-stretch">
        <div class="lg:col-span-7 bg-cerulean-50 rounded-2xl p-10 md:p-16 flex flex-col justify-center gap-8"
          style="box-shadow: 0 20px 40px rgba(22, 100, 122, 0.06)">
          <svg class=" h-12 w-12 fill-cerulean-500"  id="Layer_1" viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg" data-name="Layer 1">
            <g>
              <path d="m50.824 6.297-1.967-.557-.557-1.966c-.122-.431-.515-.728-.962-.728s-.841.297-.962.728l-.557 1.965-1.966.557c-.431.122-.728.515-.728.962s.297.84.728.962l1.966.557.557 1.965c.121.431.515.728.962.728s.84-.297.962-.728l.557-1.966 1.967-.557c.431-.122.728-.515.728-.962s-.297-.84-.728-.962z"/>
              <path d="m18.62 7.703-1.966-.556-.557-1.966c-.122-.43-.515-.728-.962-.728s-.84.297-.962.728l-.557 1.966-1.967.556c-.431.122-.728.515-.728.962s.297.84.728.962l1.967.557.557 1.966c.122.431.515.728.962.728s.84-.297.962-.728l.557-1.966 1.966-.557c.431-.122.728-.515.728-.962s-.297-.84-.728-.962z"/>
              <path d="m39.289 10.101-4.932-1.396-1.396-4.931c-.121-.43-.515-.728-.962-.728s-.841.297-.962.728l-1.396 4.931-4.932 1.396c-.431.122-.728.515-.728.962s.297.84.728.962l4.932 1.396 1.396 4.93c.122.43.515.728.962.728s.84-.297.962-.728l1.396-4.93 4.932-1.396c.431-.122.728-.515.728-.962s-.297-.84-.728-.962z"/>
            </g>
            <path d="m12.952 51.099c.3-.082.588-.151.88-.224.452-.113.899-.222 1.333-.315.292-.063.577-.118.861-.172.413-.078.817-.149 1.212-.21.272-.042.541-.082.805-.116.39-.05.768-.09 1.141-.124.242-.022.486-.046.721-.062.384-.025.753-.038 1.118-.047.2-.005.406-.016.6-.016.436 0 .852.013 1.26.034.103.005.215.004.317.011.504.032.985.08 1.446.141.127.017.243.04.367.059.326.049.647.101.951.162.156.031.3.068.45.102.254.058.505.117.743.182.15.041.292.084.435.128.219.067.433.134.637.205.134.047.264.094.392.142.197.075.384.15.565.227.114.048.227.096.335.145.182.083.351.166.516.25.088.045.18.089.263.134.186.1.356.198.519.296.046.028.099.056.143.083.011.007.026.014.037.021v-28.16c-1.33-1.14-7.986-5.756-22.91.242v28.49c.863-.333 1.695-.627 2.506-.896.273-.09.53-.163.797-.246.528-.165 1.053-.326 1.559-.464zm1.064-19.416 1.966-.556.557-1.966c.122-.43.515-.728.962-.728s.84.297.962.728l.557 1.966 1.966.556c.431.122.728.515.728.962s-.297.84-.728.962l-1.966.557-.557 1.966c-.122.431-.515.728-.962.728s-.84-.297-.962-.728l-.557-1.966-1.966-.557c-.431-.122-.728-.515-.728-.962s.297-.84.728-.962z"/>
            <path d="m17.504 32.645-.004-.004-.004.004.004.003z"/>
            <path d="m44.131 40.905-.004-.003-.004.003.004.004z"/>
            <path d="m33.741 51.71c.097-.051.208-.102.311-.153.17-.085.336-.17.523-.253.112-.05.238-.097.356-.146.198-.083.392-.165.608-.244.128-.047.272-.089.407-.134.225-.076.446-.152.689-.222.149-.043.314-.079.469-.119.25-.065.496-.131.764-.187.171-.036.359-.063.538-.096.274-.05.544-.102.836-.142.197-.027.411-.043.616-.065.297-.032.588-.067.902-.088.224-.015.466-.016.699-.024.286-.01.561-.029.86-.029.04 0 .083.003.123.003.099 0 .205.006.305.008.437.007.887.026 1.352.057.172.011.346.026.522.041.442.037.898.088 1.365.148.163.021.321.038.487.062.63.092 1.278.201 1.953.339.088.018.182.042.271.061.587.124 1.191.267 1.812.428.221.057.447.121.672.183.532.147 1.078.31 1.635.487.23.073.456.142.69.22.78.26 1.576.539 2.403.859v-28.49c-14.921-5.997-21.578-1.381-22.91-.242v28.161c.01-.006.022-.013.032-.019.085-.052.185-.106.276-.159.141-.082.276-.163.432-.246zm6.901-11.766 1.967-.557.557-1.966c.122-.431.515-.728.962-.728s.84.297.962.728l.557 1.966 1.966.557c.431.122.728.515.728.962s-.297.84-.728.962l-1.966.556-.557 1.966c-.122.43-.515.728-.962.728s-.84-.297-.962-.728l-.557-1.966-1.967-.556c-.431-.122-.728-.515-.728-.962s.297-.84.728-.962z"/>
            <path d="m57.91 54.183c0 .334-.167.646-.444.832-.077.051-.16.088-.246.116-.031.01-.063.014-.095.021-.056.012-.112.022-.169.025-.016 0-.031.007-.046.007s-.03-.008-.045-.009c-.115-.005-.23-.023-.339-.068-17.236-7.156-23.717-.326-23.781-.256-.019.021-.043.033-.064.052-.04.038-.082.072-.128.104-.036.024-.073.044-.111.063 0 0-.001 0-.002.001-.014.007-.026.017-.041.023-.016.007-.029.02-.046.026-.021.008-.044.005-.065.012-.059.018-.119.026-.181.033-.036.004-.071.02-.107.02-.012 0-.022-.007-.034-.007-.109-.004-.219-.022-.325-.063-.007-.003-.012-.008-.018-.01-.036-.015-.066-.038-.1-.057-.08-.044-.151-.096-.215-.158-.018-.017-.042-.024-.058-.043-.058-.064-6.537-6.896-23.776.262-.311.127-.66.094-.939-.092-.277-.186-.444-.498-.444-.832v-24.569c-.688.208-1.386.432-2.09.671v27.884c6.614-2.171 11.895-2.887 15.978-2.887 2.737 0 4.937.321 6.641.74.447.11.762.511.762.971 0 1.121.835 1.96 1.86 1.96h5.37c1.025 0 1.859-.839 1.859-1.87 0-.457.31-.906.753-1.019 4.262-1.086 11.623-1.566 22.777 2.104v-27.883c-.704-.239-1.402-.464-2.09-.671v24.569z"/>
          </svg>
          <h2 class="text-4xl font-bold tracking-tight">Our Story</h2>
          <div class="flex flex-col gap-6 text-lg leading-relaxed text-cerulean-800/70">
            <p>
              Nass Split was born from the common frustration of splitting bills with roommates. It
              started with a coffee-stained spreadsheet and an awkward conversation about who owed
              what for the utility bill.
            </p>
            <p>
              We realized that the problem wasn't just about the money—it was about the friction it
              created in friendships. We built Nass Split to replace complex math with simple clicks,
              and tension with clarity.
            </p>
          </div>
        </div>
        <div class="lg:col-span-5 rounded-2xl overflow-hidden relative min-h-80 bg-cerulean-200">
          <div
            class="absolute inset-0 flex items-center justify-center"
          >
            <span class="material-symbols-outlined text-cerulean-500/40 text-9xl"><img src="@/assets/aboutUs/aoubtUs.png"></span>
          </div>
          <div class="absolute inset-0 bg-cerulean-500/10"></div>
        </div>
      </div>
    </section>

    <!-- Values -->
    <section class="px-16 py-36">
      <div class="flex flex-col md:flex-col justify-between  gap-6 pb-16">
        <h2 class="text-4xl font-bold tracking-tight">Our Core Values</h2>
        <p class="text-cerulean-800/60 font-medium">What guides every line of code we write.</p>
      </div>
      <div class="grid md:grid-cols-3 gap-8">
        <div
          class="bg-white rounded-2xl p-8 flex flex-col gap-6 hover:-translate-y-1 transition-all duration-300"
          style="box-shadow: 0 8px 32px rgba(22, 100, 122, 0.06)"
        >
          <div
            class="w-16 h-16 rounded-2xl bg-cerulean-500/10 flex items-center justify-center"
          >
            <span class="material-symbols-outlined text-cerulean-500 text-3xl">visibility</span>
          </div>
          <h3 class="text-2xl font-bold">Transparency</h3>
          <p class="text-cerulean-800/70 leading-relaxed">
            No hidden fees, no complex jargon. Every transaction and split is clearly visible to
            everyone involved.
          </p>
        </div>
        <div
          class="bg-white rounded-2xl p-8 flex flex-col gap-6 hover:-translate-y-1 transition-all duration-300"
          style="box-shadow: 0 8px 32px rgba(22, 100, 122, 0.06)"
        >
          <div
            class="w-16 h-16 rounded-2xl bg-cerulean-700/10 flex items-center justify-center"
          >
            <span class="material-symbols-outlined text-cerulean-700 text-3xl">favorite</span>
          </div>
          <h3 class="text-2xl font-bold">Friendship</h3>
          <p class="text-cerulean-800/70 leading-relaxed">
            We believe finances should never come between friends. Our tool is designed to protect
            your social harmony.
          </p>
        </div>
        <div
          class="bg-white rounded-2xl p-8 flex flex-col gap-6 hover:-translate-y-1 transition-all duration-300"
          style="box-shadow: 0 8px 32px rgba(22, 100, 122, 0.06)"
        >
          <div
            class="w-16 h-16 rounded-2xl bg-cerulean-600/10 flex items-center justify-center"
          >
            <span class="material-symbols-outlined text-cerulean-600 text-3xl">bolt</span>
          </div>
          <h3 class="text-2xl font-bold">Simplicity</h3>
          <p class="text-cerulean-800/70 leading-relaxed">
            Complexity is the enemy of action. We keep things intuitive so you can get back to
            living your life.
          </p>
        </div>
      </div>
    </section>

    <!-- CTA -->
    <section
      class="mx-16 mb-36 rounded-tl-2xl rounded-tr-2xl px-10 py-20 text-center relative overflow-hidden"
      style="background: linear-gradient(135deg, #213c45 0%, #41778b 100%)"
    >
      <div class="absolute inset-0 pointer-events-none overflow-hidden">
        <div class="absolute -top-32 -left-32 w-96 h-96 bg-cerulean-300/20 rounded-full blur-3xl"></div>
        <div class="absolute -bottom-32 -right-32 w-96 h-96 bg-cerulean-500/20 rounded-full blur-3xl"></div>
      </div>
      <div class="relative z-10 flex flex-col gap-8 items-center">
        <h2 class="text-4xl md:text-5xl font-extrabold text-white tracking-tight">
          Ready for a stress-free living?
        </h2>
        <p class="text-white/70 text-lg max-w-2xl">
          Join thousands of roommates who have reclaimed their peace of mind and simplified their
          shared finances with Nass Split.
        </p>
        <div class="flex flex-col sm:flex-row gap-4 pt-2">
          <button
            class="bg-white text-cerulean-700 font-bold px-10 py-4 rounded-full shadow-lg hover:scale-105 active:scale-95 transition-all cursor-pointer"
          >
            Get Started Free
          </button>
          <button
            class="border-2 border-white/30 text-white font-bold px-10 py-4 rounded-full hover:bg-white/10 transition-all cursor-pointer"
          >
            View Demo
          </button>
        </div>
      </div>
    </section>

    <AppFooter />
  </div>
</template>