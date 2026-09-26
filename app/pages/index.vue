<script setup lang="ts">
useHead({
  title: "kouvera!",
});
</script>

<template>
  <div>
    <div class="container">
      <div class="banner">
        <img src="/images/haru-urara.jpg" alt="haru running like the wind!" />
      </div>
      <h1>Ahoy!</h1>
      <p>
        hey! i'm ryan, a poly student hailing from singapore! 'kouvera' is a
        website I developed after my Y3 internship to dust off my web dev skills
        (HTML & CSS) before moving on to reactJS or other JS frameworks.
      </p>
      <ul class="nested-ul">
        <li>this website now uses nuxt! yay!</li>
      </ul>
      <p>
        this website's still a work in progress, so check back later for more
        stuff!
      </p>

      <ul>
        <li>Q: wtf is 'kouvera'?</li>
        <ul class="nested-ul">
          <li>
            A: it's my ign for a couple of games i play, a combination of "口"
            (mouth in mandarin) and "vera" from aloe vera, since i really loved
            drinking those bottle aloe vera drinks in primary school
          </li>
        </ul>
      </ul>
    </div>

    <div class="container">
      <h1>Some stuff I like!</h1>
      <ul>
        <li>
          i've been getting into custom keyboards recently, due to the sheer
          variety of custom keyboards at the company I used to intern at (like
          holy shit there were so many)
        </li>
        <li>
          right now, I've got 1 acrylic, 1 abs, and 1 stacked acrylic alice
          keeb. Thinking of getting an alu one but It'll probably just be
          collecting dust...
        </li>
        <li>
          other than working on this website, I do game alot! I alternate
          between:
          <ul class="nested-ul">
            <li>League of Legends (unfotunately)</li>
            <li>FF7 Rebirth</li>
            <li>FF14</li>
            <li>The Binding of Isaac</li>
          </ul>
        </li>
        <li>
          i'm also a big fan of league esports, especially LCK and
          internationals (MSI, Worlds). i root for T1!
        </li>
      </ul>
    </div>

    <!-- <div class="horizontal-containers">
      <div class="container">
        <h1>Patch Notes</h1>
        <PatchNotes />
      </div>
      <div class="container">
        <h1>TODO list</h1>
        <ul>
          <li>more pages</li>
          <li>add button animations</li>
          <li>add blogs</li>
          <li>fix hamburger menu (mobile)</li>
        </ul>
      </div>
    </div> -->
  </div>
</template>
