# eleventy-plugin-ghost

[![npm](https://img.shields.io/npm/v/eleventy-plugin-ghost)](https://www.npmjs.com/package/eleventy-plugin-ghost)

Import your [Ghost](https://ghost.org) content directly into [Eleventy](https://github.com/11ty/eleventy) as global data.

_Note: This plugin currently uses a development version of Eleventy which includes [`addGlobalData()`](https://www.11ty.dev/docs/data-global-custom/), tread carefully_

[See the live demo](https://eleventy-plugin-ghost.netlify.app) and the [demo directory in the repo](https://github.com/daviddarnes/eleventy-plugin-ghost/tree/main/demo) to see it all in action.

- [Installation](#installation)
- [Usage](#usage)
- [Development](#development)

## Installation

1. Install plugin using npm:

   ```
   npm install eleventy-plugin-ghost
   ```

2. Add plugin to your `.eleventy.js` config, ensuring to add your Ghost url and Content API key. Check out the Ghost docs for [how to create a Content API key](http://www.ghost.org/docs/content-api/):

   ```js
   const pluginGhost = require("eleventy-plugin-ghost");

   require("dotenv").config();
   const { GHOST_URL, GHOST_KEY } = process.env;

   module.exports = (eleventyConfig) => {
     eleventyConfig.addPlugin(pluginGhost, {
       url: GHOST_URL,
       key: GHOST_KEY,
       version: "v3",
     });
   };
   ```

   The example above is using `dotenv` with a `.env` file to ensure credentials are **not** stored in the source code. Here's an example of the `.env` file:

   ```text
   GHOST_URL=https://demo.ghost.io
   GHOST_KEY=22444f78447824223cefc48062
   ```

3. Run your Eleventy project and use the global `ghost` data variable to access `posts`, `pages`, `tags` and `authors`.

## Usage

The plugin comes with a custom filter called `filterPosts`, this can be used to filter posts by attributes such as `authors`, `tags` and `internalTags`. For example, if I want to create tag pages for all my tags and show posts assigned to them I can iterate over the tags with [eleventy pagination](https://www.11ty.dev/docs/pagination/) and filter the posts by that tag:

```nunjucks
---
pagination:
  data: ghost.tags
  size: 1
  alias: tag
permalink: "/{{ tag.slug }}/"
---

{% for post in ghost.posts | filterPosts("tags", tag.slug) %}
  <li><a href="/{{ post.slug }}/">{{ post.title }}</a></li>
{% endfor %}
```

Plain text values also work:

```nunjucks
{% for post in ghost.posts | filterPosts("tags", "blog") %}
  <li><a href="/{{ post.slug }}/">{{ post.title }}</a></li>
{% endfor %}
```

As well as filtering out by a certain attribute by prefixing the value with `!`:

```nunjucks
{% for post in ghost.posts | filterPosts("tags", "!portfolio") %}
  <li><a href="/{{ post.slug }}/">{{ post.title }}</a></li>
{% endfor %}
```

To handle internal tags within Ghost better posts have `tags` populated with just public tags and `internalTags` populated with just internal tags. This allows for post filtering when a post has, or hasn't, been assigned with a certain internal tag:

```nunjucks
{% for post in ghost.posts | filterPosts("internalTags", "hash-internal-tag") %}
  <li><a href="/{{ post.slug }}/">{{ post.title }}</a></li>
{% endfor %}

<!-- or -->

{% for post in ghost.posts | filterPosts("internalTags", "!hash-internal-tag") %}
  <li><a href="/{{ post.slug }}/">{{ post.title }}</a></li>
{% endfor %}
```

Check out the demo directory of this project for more extensive examples.

## Development

1. Create a `.env` file inside of `demo` with the following credentials:

   ```text
   GHOST_URL=https://demo.ghost.io
   GHOST_KEY=22444f78447824223cefc48062
   ```

2. Amend the `.eleventy.js` file within `demo` so it points to the source code in the parent directory:

   ```js
   // const pluginGhost = require("../");
   const pluginGhost = require("eleventy-plugin-ghost");
   ```

3. Install the demo dependencies:

   ```text
   cd demo
   npm install
   ```

4. Run the demo locally:
   ```text
   npm run dev
   ```
