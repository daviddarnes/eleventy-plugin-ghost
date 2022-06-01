const EleventyFetch = require("@11ty/eleventy-fetch");
const jwt = require("jsonwebtoken");

// Generate JWT
const generateJwt = ({ adminKey, version = "v4" }) => {
  const [id, secret] = adminKey.split(":");

  return jwt.sign({}, Buffer.from(secret, "hex"), {
    keyid: id,
    algorithm: "HS256",
    expiresIn: "5m",
    audience: `/${version}/admin/`,
  });
};

// Get all post data
const getPosts = async ({ url, key, adminKey, version = "v4" }) => {
  const data = await EleventyFetch(
    `${url}/ghost/api/${version}/${
      adminKey ? "admin" : "content"
    }/posts/?key=${key}&limit=all&include=tags,authors&formats=html`,
    {
      duration: "1m",
      type: "json",
      ...(adminKey && {
        fetchOptions: {
          headers: {
            Authorization: `Ghost ${generateJwt({ adminKey, version })}`,
          },
        },
      }),
    }
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
const getPages = async ({ url, key, adminKey, version = "v4" }) => {
  const data = await EleventyFetch(
    `${url}/ghost/api/${version}/${
      adminKey ? "admin" : "content"
    }/pages/?key=${key}&limit=all&include=tags,authors&formats=html`,
    {
      duration: "1m",
      type: "json",
      ...(adminKey && {
        fetchOptions: {
          headers: {
            Authorization: `Ghost ${generateJwt({ adminKey, version })}`,
          },
        },
      }),
    }
  );

  const updatedPages = await data.pages.map((page) => {
    // Filter tags to just show public tags
    // Reassign internal tags to an internalTags key
    const publicTags = page.tags.filter((tag) => tag.visibility !== "internal");
    const internalTags = page.tags.filter(
      (tag) => tag.visibility === "internal"
    );

    return {
      ...page,
      tags: publicTags,
      internalTags: internalTags,
    };
  });

  return updatedPages;
};

// Get all tag data
const getTags = async ({ url, key, adminKey, version = "v4" }) => {
  const data = await EleventyFetch(
    `${url}/ghost/api/${version}/${
      adminKey ? "admin" : "content"
    }/tags/?key=${key}&limit=all&include=count.posts&filter=visibility:public`,
    {
      duration: "1m",
      type: "json",
      ...(adminKey && {
        fetchOptions: {
          headers: {
            Authorization: `Ghost ${generateJwt({ adminKey, version })}`,
          },
        },
      }),
    }
  );

  return data.tags;
};

// Get all author data
const getAuthors = async ({ url, key, adminKey, version = "v4" }) => {
  const data = await EleventyFetch(
    `${url}/ghost/api/${version}/${adminKey ? "admin" : "content"}/${
      adminKey ? "users" : "authors"
    }/?key=${key}&limit=all&include=count.posts`,
    {
      duration: "1m",
      type: "json",
      ...(adminKey && {
        fetchOptions: {
          headers: {
            Authorization: `Ghost ${generateJwt({ adminKey, version })}`,
          },
        },
      }),
    }
  );

  return adminKey ? data.users : data.authors;
};

// Get all settings data
const getSettings = async ({ url, key, version = "v4" }) => {
  const data = await EleventyFetch(
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

module.exports = (eleventyConfig, options) => {
  eleventyConfig.addGlobalData("ghost", async () => {
    if (!options.url || !options.key) {
      console.log("Invalid Ghost API key or URL");
    }

    return await getContent(options);
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
