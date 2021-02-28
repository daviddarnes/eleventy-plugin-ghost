const Cache = require("@11ty/eleventy-cache-assets");

// Get all post data
const getPosts = async ({ url, key, version }) => {
  const data = await Cache(
    `${url}/ghost/api/v3/content/posts/?key=${key}&limit=all&include=tags,authors`,
    { duration: "1m", type: "json" }
  );

  return data.posts;
};

// Get all page data
const getPages = async ({ url, key, version }) => {
  const data = await Cache(
    `${url}/ghost/api/v3/content/pages/?key=${key}&limit=all`,
    { duration: "1m", type: "json" }
  );

  return data.pages;
};

// Get all tag data
const getTags = async ({ url, key, version }) => {
  const data = await Cache(
    `${url}/ghost/api/v3/content/tags/?key=${key}&limit=all&include=count.posts`,
    { duration: "1m", type: "json" }
  );

  return data.tags;
};

// Get all author data
const getAuthors = async ({ url, key, version }) => {
  const data = await Cache(
    `${url}/ghost/api/v3/content/authors/?key=${key}&limit=all&include=count.posts`,
    { duration: "1m", type: "json" }
  );

  return data.authors;
};

// Get all settings data
const getSettings = async ({ url, key, version }) => {
  const data = await Cache(`${url}/ghost/api/v3/content/settings/?key=${key}`, {
    duration: "1m",
    type: "json",
  });

  return data.settings;
};

const getContent = async (params) => {
  return {
    posts: await getPosts(params),
    pages: await getPages(params),
    tags: await getTags(params),
    authors: await getAuthors(params),
    settings: await getSettings(params),
  };
};

module.exports = (
  eleventyConfig,
  options = {
    url,
    key,
    version,
  }
) => {
  eleventyConfig.addGlobalData(
    "ghost",
    async () =>
      await getContent({
        url: options.url,
        key: options.key,
        verison: options.version,
      })
  );

  eleventyConfig.addFilter("filterPosts", (posts, key, value) => {
    return posts.filter((post) =>
      post[key].some((item) => item.slug === value)
    );
  });
};
