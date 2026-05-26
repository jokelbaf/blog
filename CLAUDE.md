# Blog

This is my personal blog built using Nuxt.

## Tech Stack

The technologies used are:
- Typescript
- Nuxt v4
- NuxtUI
- TailwindCSS
- Prisma + PostgreSQL (database)
- @nuxtjs/mdc for posts rendering
- UEditor from NuxtUI extended for custom features

## Design

A purple color scheme is used for the design. Design system is created around NuxtUI: simple yet beautiful, modern-looking components, borders and blur effects. It is recommended to use NuxtUI components whenever possible.

## Project Structure

! Might be outdated !
```
app
 ┣ assets
 ┃ ┗ css
 ┃ ┃ ┗ main.css
 ┣ components
 ┃ ┣ App
 ┃ ┃ ┣ Footer.vue
 ┃ ┃ ┗ Header.vue
 ┃ ┣ Home
 ┃ ┃ ┗ Hero.vue
 ┃ ┗ Post
 ┃ ┃ ┣ Editor
 ┃ ┃ ┃ ┣ CompletionExtension.ts
 ┃ ┃ ┃ ┣ Core.vue
 ┃ ┃ ┃ ┣ Editor.vue
 ┃ ┃ ┃ ┣ FileUploadExtension.ts
 ┃ ┃ ┃ ┣ FileUploadNode.vue
 ┃ ┃ ┃ ┣ LinkPopover.vue
 ┃ ┃ ┃ ┗ UseCompletion.ts
 ┃ ┃ ┣ Item.vue
 ┃ ┃ ┣ ItemsMarquee.vue
 ┃ ┃ ┗ ItemsPage.vue
 ┣ layouts
 ┃ ┣ blank.vue
 ┃ ┗ default.vue
 ┣ pages
 ┃ ┣ login
 ┃ ┃ ┗ callback.vue
 ┃ ┣ post
 ┃ ┃ ┗ new.vue
 ┃ ┣ index.vue
 ┃ ┗ posts.vue
 ┣ utils
 ┃ ┗ post.ts
 ┣ app.config.ts
 ┣ app.vue
 ┗ error.vue
 server
 ┣ api
 ┃ ┗ posts.get.ts
 ┣ routes
 ┃ ┗ auth
 ┃ ┃ ┗ github.get.ts
 ┗ utils
   ┗ db.ts
shared
 ┗ types
   ┣ post.ts
   ┗ auth.d.ts
```

## Code

Code quality matters: all code must be thought through, clean and simple. A professional Vue/Nuxt patterns must be used. No useless comments must be present in the project, but docstrings are a mandatory for all functions that reside in a separate `ts` files. Code must be entirely written in Typescript.
