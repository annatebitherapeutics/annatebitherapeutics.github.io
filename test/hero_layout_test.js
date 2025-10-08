const { chromium } = require("playwright");
const fs = require("fs");
const path = require("path");

async function run() {
  const siteIndex = "file://" + path.resolve(__dirname, "..", "_site", "index.html");
  const cssPath = path.resolve(__dirname, "..", "_site", "assets", "css", "styles_feeling_responsive.css");
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });

  try {
    await page.goto(siteIndex);
    if (fs.existsSync(cssPath)) {
      const css = await fs.promises.readFile(cssPath, "utf8");
      await page.addStyleTag({ content: css });
    }

    await page.waitForSelector("#hero .front-hero__inner", { timeout: 5000 });

    const metrics = await page.evaluate(() => {
      const inner = document.querySelector("#hero .front-hero__inner");
      const copy = document.querySelector("#hero .front-hero__copy");
      const visual = document.querySelector("#hero .front-hero__visual");
      const approachHeader = document.querySelector('#approach .front-section__header h2');

      const innerRect = inner.getBoundingClientRect();
      const copyRect = copy.getBoundingClientRect();
      const visualRect = visual ? visual.getBoundingClientRect() : null;
      const approachRect = approachHeader ? approachHeader.getBoundingClientRect() : null;

      const innerStyles = getComputedStyle(inner);
      const copyStyles = getComputedStyle(copy);
      const visualStyles = visual ? getComputedStyle(visual) : null;

      return {
        innerRect: { left: innerRect.left, width: innerRect.width },
        copyRect: { left: copyRect.left, width: copyRect.width },
        visualRect: visualRect ? { left: visualRect.left, width: visualRect.width } : null,
        approachRect: approachRect ? { left: approachRect.left } : null,
        styles: {
          innerDisplay: innerStyles.display,
          innerJustify: innerStyles.justifyContent,
          copyFloat: copyStyles.float,
          copyMarginLeft: copyStyles.marginLeft,
          visualFloat: visualStyles ? visualStyles.float : null,
          visualMarginLeft: visualStyles ? visualStyles.marginLeft : null,
        },
      };
    });

    console.log("Hero layout metrics:", JSON.stringify(metrics, null, 2));

    if (!metrics.approachRect) {
      throw new Error("Could not locate approach section header to compare gutters.");
    }

    const gutterDelta = Math.abs(metrics.innerRect.left - metrics.approachRect.left);
    if (gutterDelta > 2) {
      throw new Error(`Hero left gutter (${metrics.innerRect.left}) does not match approach header (${metrics.approachRect.left}).`);
    }

    if (metrics.styles.innerDisplay !== "flex") {
      throw new Error(`Expected .front-hero__inner display:flex, got ${metrics.styles.innerDisplay}`);
    }

    if (metrics.styles.innerJustify !== "space-between") {
      throw new Error(`Expected .front-hero__inner justify-content: space-between, got ${metrics.styles.innerJustify}`);
    }

    if (metrics.styles.copyFloat !== "none" || metrics.styles.copyMarginLeft === "auto") {
      throw new Error("Hero copy has unexpected float or auto margin.");
    }

    if (metrics.styles.visualFloat !== null && metrics.styles.visualFloat !== "none") {
      throw new Error("Hero visual has unexpected float.");
    }
  } finally {
    await browser.close();
  }
}

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
