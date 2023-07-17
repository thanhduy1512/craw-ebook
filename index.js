import puppeteer from "puppeteer";
import fs from "fs";
import json from "./resource.json" assert { type: "json" };

(async () => {
  const browser = await puppeteer.launch({ headless: false });
  const page = await browser.newPage();

  const data = json.data;

  const htmlContentStart = `<html><head><title>LEGENDARY MOONLIGHT SCULPTOR</title></head><body>`;
  const htmlContentEnd = `</body></html>`;
  let htmlContent = htmlContentStart;

  for (let i = 0; i < data.length; i++) {
    const chapterContent = await writeChapter(page, data[i]);
    htmlContent += chapterContent;
  }

  htmlContent += htmlContentEnd;

  fs.writeFile(
    `LEGENDARY_MOONLIGHT_SCULPTOR.html`,
    htmlContent,
    "utf8",
    (err) => {
      if (err) console.error(err);
      console.log("file created");
    }
  );

  await browser.close();
})();

const writeChapter = async (page, chapter) => {
  await page.goto(
    `https://trumtruyen.vn/legendary-moonlight-sculptor/${chapter}/`
  );

  // Set screen size
  await page.setViewport({ width: 2560, height: 1440 });

  await page.waitForSelector(".chapter-title");
  let chapTitleElement = await page.$(".chapter-title");
  let chapTitle = await page.evaluate((el) => el.textContent, chapTitleElement);
  let currentBook = chapTitle.split(" ").splice(0, 2).join(" ");

  await page.waitForSelector(".chapter-c");
  let chapContentElement = await page.$(".chapter-c");
  let chapContent = await page.evaluate(
    (el) => el.innerHTML,
    chapContentElement
  );

  const htmlContent = `<h1>${currentBook}</h1>
                <h2>${chapTitle}</h2>
                ${chapContent}`;
  return htmlContent;
};

const getResourceChapters = async (page) => {
  await page.click(".btn.btn-success.btn-chapter-nav.chapter_jump", 10);
  await page.waitForSelector(
    ".btn.btn-success.btn-chapter-nav.form-control.chapter_jump"
  );
  let selectElement = await page.$(
    ".btn.btn-success.btn-chapter-nav.form-control.chapter_jump"
  );
  const selectInnerHtml = await page.evaluate(() =>
    Array.from(
      document.querySelectorAll(
        ".btn.btn-success.btn-chapter-nav.form-control.chapter_jump option"
      )
    ).map((element) => element.value)
  );
  let dataResource = selectInnerHtml.slice(
    Math.ceil(selectInnerHtml.length / 2)
  );
  fs.writeFile("resource.json", JSON.stringify(dataResource), "utf8", (err) => {
    if (err) console.log(err);
    console.log("resource created");
  });
};
