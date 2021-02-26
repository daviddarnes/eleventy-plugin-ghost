const GhostContentAPI = require("@tryghost/content-api");

// Get all post data
const getPosts = async (api) => {
  const data = await api.posts.browse({
    include: "tags,authors",
    limit: "all",
  });

  return data;
};

// Get all page data
const getPages = async (api) => {
  const data = await api.pages.browse({
    limit: "all",
  });

  return data;
};

// Get all tag data
const getTags = async (api) => {
  const data = await api.tags.browse({
    include: "count.posts",
    limit: "all",
  });

  return data;
};

// Get all author data
const getAuthors = async (api) => {
  const data = await api.authors.browse({
    include: "count.posts",
    limit: "all",
  });

  return data;
};

// Get all settings data
const getSettings = async (api) => {
  const data = await api.settings.browse();

  return data;
};

const getContent = async (api) => {
  return {
    posts: await getPosts(api),
    pages: await getPages(api),
    tags: await getTags(api),
    authors: await getAuthors(api),
    settings: await getSettings(api),
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
  const api = new GhostContentAPI({
    url: options.url,
    key: options.key,
    version: options.version,
  });

  eleventyConfig.addGlobalData("ghost", async () => await getContent(api));

  eleventyConfig.addFilter("filterPosts", (posts, key, value) => {
    return posts.filter((post) =>
      post[key].some((item) => item.slug === value)
    );
  });
};
