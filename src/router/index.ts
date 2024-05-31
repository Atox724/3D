import { createRouter, createWebHistory } from "vue-router";

export default createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: "/",
      redirect: "/engg"
    },
    {
      path: "/engg",
      redirect: "/engg/replay",
      children: [
        {
          path: "real",
          name: "EnggReal",
          component: () => import("@/pages/engg/real.vue")
        },
        {
          path: "replay",
          name: "EnggReplay",
          component: () => import("@/pages/engg/replay.vue")
        }
      ]
    },
    {
      path: "/pro",
      redirect: "/pro/replay",
      children: [
        {
          path: "real",
          name: "ProReal",
          component: () => import("@/pages/pro/real.vue")
        },
        {
          path: "replay",
          name: "ProReplay",
          component: () => import("@/pages/pro/replay.vue")
        }
      ]
    }
  ]
});
