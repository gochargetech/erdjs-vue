import { createWebHistory, createRouter } from "vue-router";

import { HomePage } from "./../views/HomePage";
import { LoginPage } from "./../views/LoginPage";
import { ProfilePage } from "./../views/ProfilePage";

const routes = [
  {
    path: "/",
    component: HomePage,
    name: "home",
  },
  {
    path: "/login",
    component: LoginPage,
    name: "login",
  },
  {
    path: "/profile",
    component: ProfilePage,
    name: "profile",
    meta: {
      requiresAuth: true,
    },
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

router.beforeEach((to, from, next) => {
  const requiresAuth = to.matched.some((record) => record.meta.requiresAuth);
  if (requiresAuth && !isLoggedIn()) {
    next({
      path: "/login",
      query: { to: to.fullPath },
    });
  }
  next();
});

const isLoggedIn = () => {
  // todo: check if user logged in
  return false;
};

export default router;
