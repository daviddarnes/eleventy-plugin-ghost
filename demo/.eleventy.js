// const pluginGhost = require("../"); // For local development

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
