<template>
  <div class="min-h-screen bg-background text-foreground">
    <MarketingHeader />
    <ToastStack />
    <main class="mx-auto min-h-[calc(100vh-280px)] max-w-6xl px-4 py-12 sm:px-6">
      <RouterView />
    </main>
    <MarketingFooter />
  </div>
</template>
