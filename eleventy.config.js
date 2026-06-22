// ponytail: minimal Eleventy foothold (ADR-0003). Input src/, output _site/.
// Assets are copied in by build.sh / the preview step, not passthrough-coped here,
// until the full page migration lands.
module.exports = function () {
  return { dir: { input: "src", includes: "_includes", output: "_site" } };
};
