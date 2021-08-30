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
       version: "v4",
     });
   };
   ```

   The example above is using `dotenv` with a `.env` file to ensure credentials are **not** stored in the source code. Here's an example of the `.env` file:

   ```text
   GHOST_URL=https://demo.ghost.io
   GHOST_KEY=22444f78447824223cefc48062
   ```

3. Run your Eleventy project and use the global `ghost` data variable to access `posts`, `pages`, `tags`, `authors` and `settings`.

The API will default to the latest version, which is `v4` presently. However passing `version` into the plugin options will set the version returned, as shown in the above code sample.

## Usage

After installing and running you'll be provided with a global `ghost` key as well as a `filtersPosts()` function. This gives you access to the following:

### API

- `ghost.posts`: An array of all posts in Ghost, including their tags and authors
- `ghost.pages`: An array of all pages in Ghost
- `ghost.tags`: An array of all tags in Ghost, including the number of posts within each tag but filtered to only contain public tags
- `ghost.authors`: An array of all authors in Ghost, including the number of posts within each author
- `ghost.settings`: All settings set in Ghost

All data is cached using [`@11ty/eleventy-cache-assets`](https://www.11ty.dev/docs/plugins/cache/) with a duration of 1 minute. This keeps the local builds fast while still inheriting newly applied content.

### Internal tags

When posts are retrieved all tags are applied, including [internal tags](https://ghost.org/docs/publishing/#internal-tag). Internal tags are very useful for grouping posts without exposing the tag in the front-end. To assist with this the plugin filters out internal tags from the `tags` key on posts and applies them to a new `internalTags` key. Internal tag slugs are prefixed with `hash-` to mirror the `#` applied in the UI to define them.

### Filtering posts

The plugin comes with a custom filter called `filterPosts`, this can be used to filter posts by attributes such as `authors`, `tags` and `internalTags` using the attributes slug. The following example will list posts that are tagged with "portfolio":

```nunjucks
{% for post in ghost.posts | filterPosts("tags", "portfolio") %}
  <li><a href="/{{ post.slug }}/">{{ post.title }}</a></li>
{% endfor %}
```

It's also possible to filter _out_ posts with a certain tag by prefixing the parameter with `!`:

```nunjucks
{% for post in ghost.posts | filterPosts("tags", "!blog") %}
  <li><a href="/{{ post.slug }}/">{{ post.title }}</a></li>
{% endfor %}
```

The filter works for `authors` as well as `internalTags`:

```nunjucks
{% for post in ghost.posts | filterPosts("internalTags", "!hash-internal-tag") %}
  <li><a href="/{{ post.slug }}/">{{ post.title }}</a></li>
{% endfor %}
```

```nunjucks
{% for post in ghost.posts | filterPosts("aurhors", "david") %}
  <li><a href="/{{ post.slug }}/">{{ post.title }}</a></li>
{% endfor %}
```

### Creating pages

Rendering pages for posts, pages, authors and tags can be done by making use of the [eleventy pagination](https://www.11ty.dev/docs/pagination/) feature. In the following example post pages are being created in a `post.njk` file:

```nunjucks
---
pagination:
  data: ghost.posts
  size: 1
  alias: post
permalink: "/{{ post.slug }}/"
---

<h1>{{ post.title }}</h1>
{{ post.html | safe }}
```

The same can be done for authors and tags in combination with the `filterPosts` function to list out posts by that author or tagged with that tag:

```nunjucks
---
pagination:
  data: ghost.tags
  size: 1
  alias: tag
permalink: "/{{ tag.slug }}/"
---

<h1>{{ tag.name }}</h1>
<ul>
  {% for post in ghost.posts | filterPosts("tags", tag.slug) %}
    <li><a href="/{{ post.slug }}/">{{ post.title }}</a></li>
  {% endfor %}
</ul>
```

A more advanced use case is if you want to render post pages but filter _out_ posts with a certain attribute. The below example makes use of [`gray-matter` in eleventy](https://www.11ty.dev/docs/data-frontmatter/#alternative-front-matter-formats) and checks if a post has an internal tag with the slug `hash-internal-tag` and prevents the post from rendering:

```nunjucks
---js
{
  pagination: {
    data: "ghost.posts",
    size: 1,
    alias: "post",
    before: function(data) {
      return data.filter(post => post.internalTags.every(tag => tag.slug !== "hash-internal-tag"));
    }
  },
  permalink: "/{{ post.slug }}/"
}
---

<h1>{{ post.title }}</h1>
{{ post.html | safe }}
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
