<script setup lang="ts">
import { computed } from 'vue'
import { useRouter, useRoute } from 'vue-router/auto'
import { useI18n } from 'vue-i18n'

import { LoginAction } from '~/components/login'
import { Button } from '~/components/ui/button'
import { useSsrData } from '~/composables/useSsrData'
import { useLocaleNavigation } from '~/composables/useLocaleNavigation'

defineOptions({
  name: 'LocaleIndexPage',
})

const { t } = useI18n()
const router = useRouter()
const route = useRoute()
const { push } = useLocaleNavigation(router, route)

const ssrData = useSsrData<{ visitors?: number; uptime?: string; responseTime?: string }>()

const heroMetrics = computed(() => [
  {
    label: t('marketing.metrics.visitors'),
    value: ssrData.value.visitors ? ssrData.value.visitors.toLocaleString() : '12k+',
  },
  {
    label: t('marketing.metrics.uptime'),
    value: ssrData.value.uptime ?? '99.99%',
  },
  {
    label: t('marketing.metrics.response'),
    value: ssrData.value.responseTime ?? '120ms',
  },
])

const features = computed(() => [
  {
    title: t('marketing.features.analytics.title'),
    description: t('marketing.features.analytics.description'),
  },
  {
    title: t('marketing.features.automation.title'),
    description: t('marketing.features.automation.description'),
  },
  {
    title: t('marketing.features.collaboration.title'),
    description: t('marketing.features.collaboration.description'),
  },
  {
    title: t('marketing.features.security.title'),
    description: t('marketing.features.security.description'),
  },
])

const plans = computed(() => [
  {
    id: 'starter',
    badge: t('marketing.pricing.starter.badge'),
    price: t('marketing.pricing.starter.price'),
    description: t('marketing.pricing.starter.description'),
    features: [
      t('marketing.pricing.starter.features.0'),
      t('marketing.pricing.starter.features.1'),
      t('marketing.pricing.starter.features.2'),
    ],
    highlighted: false,
  },
  {
    id: 'growth',
    badge: t('marketing.pricing.growth.badge'),
    price: t('marketing.pricing.growth.price'),
    description: t('marketing.pricing.growth.description'),
    features: [
      t('marketing.pricing.growth.features.0'),
      t('marketing.pricing.growth.features.1'),
      t('marketing.pricing.growth.features.2'),
    ],
    highlighted: true,
  },
])

const testimonials = computed(() => [
  {
    quote: t('marketing.testimonials.0.quote'),
    author: t('marketing.testimonials.0.author'),
    role: t('marketing.testimonials.0.role'),
  },
  {
    quote: t('marketing.testimonials.1.quote'),
    author: t('marketing.testimonials.1.author'),
    role: t('marketing.testimonials.1.role'),
  },
])

function handlePrimaryCtaAction() {
  push({ name: '/' })
}

function handleSecondaryCta() {
  window.open('https://github.com/antfu/vitesse-lite', '_blank', 'noopener')
}
</script>

<template>
  <div class="space-y-24">
    <section id="hero" class="grid gap-10 text-center md:grid-cols-[1.1fr_0.9fr] md:items-center md:text-left">
      <div class="space-y-6">
        <span class="inline-flex items-center rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
          {{ t('marketing.hero.badge') }}
        </span>
        <h1 class="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl md:text-5xl">
          {{ t('marketing.hero.title') }}
        </h1>
        <p class="text-lg text-muted-foreground md:max-w-lg">
          {{ t('marketing.hero.subtitle') }}
        </p>
        <div class="flex flex-wrap items-center justify-center gap-3 md:justify-start">
          <LoginAction @execute="handlePrimaryCtaAction">
            <Button size="lg" class="min-w-[180px]">
              {{ t('marketing.hero.primaryCta') }}
            </Button>
          </LoginAction>
          <Button variant="outline" size="lg" class="min-w-[180px]" @click="handleSecondaryCta">
            {{ t('marketing.hero.secondaryCta') }}
          </Button>
        </div>

        <dl class="grid gap-6 pt-6 text-sm text-muted-foreground sm:grid-cols-3">
          <div
            v-for="metric in heroMetrics"
            :key="metric.label"
            class="rounded-lg border border-border/70 bg-background/60 p-4 shadow-sm"
          >
            <dt>{{ metric.label }}</dt>
            <dd class="mt-2 text-2xl font-semibold text-foreground">{{ metric.value }}</dd>
          </div>
        </dl>
      </div>

      <div class="mx-auto flex max-w-md flex-col gap-4 rounded-2xl border border-border/60 bg-muted/30 p-6 shadow-md">
        <h2 class="text-lg font-semibold text-foreground">{{ t('marketing.hero.previewTitle') }}</h2>
        <p class="text-sm text-muted-foreground">{{ t('marketing.hero.previewDescription') }}</p>
        <div class="space-y-3 text-left text-sm">
          <div class="flex items-start gap-3 rounded-lg border border-border/60 bg-background/70 p-3">
            <span class="mt-0.5 inline-flex size-6 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">AI</span>
            <div>
              <p class="font-medium text-foreground">{{ t('marketing.hero.cards.ai.title') }}</p>
              <p class="text-xs text-muted-foreground">{{ t('marketing.hero.cards.ai.description') }}</p>
            </div>
          </div>
          <div class="flex items-start gap-3 rounded-lg border border-border/60 bg-background/70 p-3">
            <span class="mt-0.5 inline-flex size-6 items-center justify-center rounded-full bg-secondary/20 text-xs font-semibold text-secondary-foreground">API</span>
            <div>
              <p class="font-medium text-foreground">{{ t('marketing.hero.cards.api.title') }}</p>
              <p class="text-xs text-muted-foreground">{{ t('marketing.hero.cards.api.description') }}</p>
            </div>
          </div>
          <div class="flex items-start gap-3 rounded-lg border border-dashed border-border/50 bg-background/40 p-3">
            <span class="mt-0.5 inline-flex size-6 items-center justify-center rounded-full bg-amber-100 text-xs font-semibold text-amber-600">PLG</span>
            <div>
              <p class="font-medium text-foreground">{{ t('marketing.hero.cards.plg.title') }}</p>
              <p class="text-xs text-muted-foreground">{{ t('marketing.hero.cards.plg.description') }}</p>
            </div>
          </div>
        </div>
      </div>
    </section>

    <section id="features" class="space-y-12">
      <div class="text-center md:text-left">
        <p class="text-sm font-semibold uppercase tracking-wide text-primary">{{ t('marketing.features.label') }}</p>
        <h2 class="mt-2 text-2xl font-semibold text-foreground md:text-3xl">{{ t('marketing.features.title') }}</h2>
        <p class="mt-3 text-sm text-muted-foreground md:max-w-2xl">{{ t('marketing.features.subtitle') }}</p>
      </div>

      <div class="grid gap-6 md:grid-cols-2">
        <div
          v-for="feature in features"
          :key="feature.title"
          class="rounded-2xl border border-border/70 bg-background/70 p-6 shadow-sm"
        >
          <h3 class="text-lg font-semibold text-foreground">{{ feature.title }}</h3>
          <p class="mt-2 text-sm text-muted-foreground">{{ feature.description }}</p>
        </div>
      </div>
    </section>

    <section id="pricing" class="space-y-10">
      <div class="text-center">
        <p class="text-sm font-semibold uppercase tracking-wide text-primary">{{ t('marketing.pricing.label') }}</p>
        <h2 class="mt-2 text-2xl font-semibold text-foreground md:text-3xl">{{ t('marketing.pricing.title') }}</h2>
        <p class="mt-3 text-sm text-muted-foreground md:mx-auto md:max-w-2xl">{{ t('marketing.pricing.subtitle') }}</p>
      </div>

      <div class="grid gap-6 md:grid-cols-2">
        <article
          v-for="plan in plans"
          :key="plan.id"
          :class="[
            'rounded-2xl border p-8 shadow-sm transition-transform hover:-translate-y-1',
            plan.highlighted ? 'border-primary bg-primary/5 shadow-lg' : 'border-border/70 bg-background/80',
          ]"
        >
          <div class="flex items-center justify-between">
            <span class="text-sm font-semibold uppercase tracking-wide text-primary">{{ plan.badge }}</span>
            <span class="text-xl font-semibold text-foreground">{{ plan.price }}</span>
          </div>
          <p class="mt-3 text-sm text-muted-foreground">{{ plan.description }}</p>
          <ul class="mt-6 space-y-3 text-sm text-muted-foreground">
            <li v-for="item in plan.features" :key="item" class="flex items-center gap-2">
              <span class="inline-flex size-5 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">✓</span>
              <span>{{ item }}</span>
            </li>
          </ul>
          <Button class="mt-8 w-full" :variant="plan.highlighted ? 'default' : 'outline'" size="lg">
            {{ t('marketing.pricing.cta') }}
          </Button>
        </article>
      </div>
    </section>

    <section id="testimonials" class="space-y-8">
      <div class="text-center">
        <p class="text-sm font-semibold uppercase tracking-wide text-primary">{{ t('marketing.testimonials.label') }}</p>
        <h2 class="mt-2 text-2xl font-semibold text-foreground md:text-3xl">{{ t('marketing.testimonials.title') }}</h2>
      </div>

      <div class="grid gap-6 md:grid-cols-2">
        <figure
          v-for="testimonial in testimonials"
          :key="testimonial.author"
          class="h-full rounded-2xl border border-border/70 bg-background/80 p-6 shadow-sm"
        >
          <blockquote class="text-base text-muted-foreground">“{{ testimonial.quote }}”</blockquote>
          <figcaption class="mt-4 text-sm font-semibold text-foreground">
            {{ testimonial.author }}
            <span class="ml-2 text-xs font-normal text-muted-foreground">{{ testimonial.role }}</span>
          </figcaption>
        </figure>
      </div>
    </section>

    <section id="resources" class="rounded-3xl border border-border/70 bg-primary/5 p-10 text-center shadow-md md:text-left">
      <div class="flex flex-col items-center gap-6 md:flex-row md:justify-between">
        <div>
          <h2 class="text-2xl font-semibold text-foreground md:text-3xl">{{ t('marketing.resources.title') }}</h2>
          <p class="mt-3 max-w-xl text-sm text-muted-foreground">{{ t('marketing.resources.subtitle') }}</p>
        </div>
        <div class="flex flex-wrap items-center justify-center gap-3 md:justify-end">
          <Button size="lg" class="min-w-[160px]">{{ t('marketing.resources.primaryCta') }}</Button>
          <Button variant="outline" size="lg" class="min-w-[160px]" @click="handleSecondaryCta">
            {{ t('marketing.resources.secondaryCta') }}
          </Button>
        </div>
      </div>
    </section>
  </div>
</template>

<route lang="yaml">
meta:
  layout: home
</route>
