const puppeteer = require("puppeteer");
const cheerio = require("cheerio");
const fs = require("fs"); // Add the fs module for file system operations

async function performScraping() {
  try {
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();

    await page.setUserAgent("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/108.0.0.0 Safari/537.36");

    await page.goto("https://stats.espncricinfo.com/ci/engine/records/team/match_results.html?id=14450;type=tournament", {
      waitUntil: "domcontentloaded",
    });

    // Wait for an additional 2 seconds to ensure content is fully loaded (you can adjust the delay as needed)
    await page.waitForTimeout(2000);

    // Extract the HTML content after the page has fully loaded
    const htmlContent = await page.content();

    await browser.close();

    const $ = cheerio.load(htmlContent);

    // Use the CSS selector to select the table element
    const tableElement = $("#main-container > div.lg\\:ds-container.lg\\:ds-mx-auto.lg\\:ds-px-5.ds-pt-2.ds-mb-4 > div:nth-child(3) > div > div:nth-child(1) > div.ds-overflow-x-auto.ds-scrollbar-hide > table");

    // Check if the tableElement exists
    if (tableElement.length === 0) {
      console.log("Table not found. Verify the CSS selector.");
      return;
    }

    // Create an array to store the scraped data
    let matchSummary = [];

    // Traverse the table rows
    tableElement.find("tr").each((index, element) => {
      const tds = $(element).find("td");

      // Extract data from each cell (td) and add it to the matchSummary array
      matchSummary.push({
        'team1': $(tds[0]).text(),
        'team2': $(tds[1]).text(),
        'winner': $(tds[2]).text(),
        'margin': $(tds[3]).text(),
        'ground': $(tds[4]).text(),
        'matchDate': $(tds[5]).text(),
        'scorecard': $(tds[6]).text(),
      });
    });

    console.log(matchSummary);

    // Convert matchSummary array to JSON string
    const matchSummaryJSON = JSON.stringify(matchSummary, null, 2);

    // Save the JSON data to a file
    fs.writeFile("match_summary.json", matchSummaryJSON, (err) => {
      if (err) {
        console.error("Error while saving JSON file:", err);
      } else {
        console.log("Match summary data saved as JSON.");
      }
    });
  } catch (error) {
    console.error("Error occurred:", error);
  }
}

performScraping();
