// ponytail: minimal Eleventy config (ADR-0003). Input src/, output _site/.
// Passthrough-copy assets/ so `_site` (and `eleventy --serve`) is self-contained
// for local preview; the production build re-copies them via rsync anyway.
module.exports = function (eleventyConfig) {
  eleventyConfig.addPassthroughCopy('assets');
  eleventyConfig.addPassthroughCopy('data'); // pages fetch /data/*.json client-side
  return { dir: { input: 'src', includes: '_includes', output: '_site' } };
};
