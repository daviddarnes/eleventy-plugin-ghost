const Cache = require("@11ty/eleventy-cache-assets");

// Get all post data
const getPosts = async ({ url, key, version = "v4" }) => {
  const data = await Cache(
    `${url}/ghost/api/${version}/content/posts/?key=${key}&limit=all&include=tags,authors`,
    { duration: "1m", type: "json" }
  );

  const updatedPosts = await data.posts.map((post) => {
    // Filter tags to just show public tags
    // Reassign internal tags to an internalTags key
    const publicTags = post.tags.filter((tag) => tag.visibility !== "internal");
    const internalTags = post.tags.filter(
      (tag) => tag.visibility === "internal"
    );

    return {
      ...post,
      tags: publicTags,
      internalTags: internalTags,
    };
  });

  return updatedPosts;
};

// Get all page data
const getPages = async ({ url, key, version = "v4" }) => {
  const data = await Cache(
    `${url}/ghost/api/${version}/content/pages/?key=${key}&limit=all`,
    { duration: "1m", type: "json" }
  );

  return data.pages;
};

// Get all tag data
const getTags = async ({ url, key, version = "v4" }) => {
  const data = await Cache(
    `${url}/ghost/api/${version}/content/tags/?key=${key}&limit=all&include=count.posts&filter=visibility:public`,
    { duration: "1m", type: "json" }
  );

  return data.tags;
};

// Get all author data
const getAuthors = async ({ url, key, version = "v4" }) => {
  const data = await Cache(
    `${url}/ghost/api/${version}/content/authors/?key=${key}&limit=all&include=count.posts`,
    { duration: "1m", type: "json" }
  );

  return data.authors;
};

// Get all settings data
const getSettings = async ({ url, key, version = "v4" }) => {
  const data = await Cache(
    `${url}/ghost/api/${version}/content/settings/?key=${key}`,
    {
      duration: "1m",
      type: "json",
    }
  );

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
  eleventyConfig.addGlobalData("ghost", async () => {
    if (!options.url || !options.key) {
      console.log("Invalid Ghost API key or URL");
    }

    return await getContent({
      url: options.url,
      key: options.key,
      verison: options.version,
    });
  });

  eleventyConfig.addFilter("filterPosts", (posts, key, value) => {
    // Check for exclamation before the second parameter…
    if (value.startsWith("!")) {
      // Snip off that exclamation
      const unprefixedValue = value.substring(1);

      // Filter posts that don't include this value
      return posts.filter((post) =>
        post[key].every((item) => item.slug !== unprefixedValue)
      );
    }

    // Filter posts that have the value
    return posts.filter((post) =>
      post[key].some((item) => item.slug === value)
    );
  });
};
