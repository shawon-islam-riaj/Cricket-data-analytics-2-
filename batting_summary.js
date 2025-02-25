const puppeteer = require("puppeteer");
const cheerio = require("cheerio");
const fs = require("fs"); // Add the fs module for file system operations

//------------ STAGE 1 ------------//

async function stage1() {
  try {
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();

    await page.setUserAgent("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/108.0.0.0 Safari/537.36");

    await page.goto("https://stats.espncricinfo.com/ci/engine/records/team/match_results.html?id=14450;type=tournament", {
      waitUntil: "domcontentloaded",
    });
    await page.waitForTimeout(2000);

    // Extract the HTML content after the page has fully loaded
    const htmlContent = await page.content();
    await browser.close();

    const $ = cheerio.load(htmlContent);

    const tableElement = $("#main-container > div.lg\\:ds-container.lg\\:ds-mx-auto.lg\\:ds-px-5.ds-pt-2.ds-mb-4 > div:nth-child(3) > div > div:nth-child(1) > div.ds-overflow-x-auto.ds-scrollbar-hide > table");

    if (tableElement.length === 0) {
      console.log("Table not found. Verify the CSS selector.");
      return;
    }

    let links = [];
   tableElement.find("tr").each((index, element) => {
         const tds = $(element).find("td");
         const rowURL = "https://www.espncricinfo.com" + $(tds[6]).find('a').attr('href');
         links.push(rowURL);
       });

     if (links.length > 0) {
          const firstLink = links[0];
          // Add a condition to check if the link is incorrect, and then remove it.
          // For example, if the link is 'https://www.espncricinfo.comundefined', it might be incorrect.
          if (firstLink.includes('undefined')) {
            links.shift(); // Remove the first link from the array
          }
        }
    return links;
  } catch (error) {
    console.error("Error occurred in Stage 1:", error);
  }
}

// Rest of the code for Stage 2, performStage1(), performStage2(), and main() remains the same
// ...






//------------ STAGE 2 ------------//

async function stage2(playerURL) {
  try {
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();

    await page.goto(playerURL, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(2000); // Add an additional delay to ensure content is fully loaded

    const htmlContent = await page.content();
    await browser.close();

    const $ = cheerio.load(htmlContent);
//    // Find the div containing the required information
//        const matchDetailsDiv = $("div.ds-flex.ds-flex-row.ds-w-full.ds-overflow-x-auto.ds-scrollbar-hide")
//          .filter((index, element) => $(element).find("span.ds-text-tight-xs").text() === "MATCH DETAILS");
//
//        // Check if the div is found
//        if (matchDetailsDiv.length === 0) {
//          console.log("MATCH DETAILS div not found. Verify the HTML structure.");
//          return;
//        }
//
//        // Get the parent div to access team names
//        const parentDiv = matchDetailsDiv.parent();
//
//        // Get the team names
//        const team1 = parentDiv.find("div:nth-child(1) > span > span.ds-text-tight-xs").text().trim();
//        const team2 = parentDiv.find("div:nth-child(2) > span > span.ds-text-tight-xs").text().trim();
//
//        // Create the matchInfo string
//        const matchInfo = `${team1} Vs ${team2}`;
//    console.log(matchInfo)
//    return

    // Find the table
       var tableElement = $("table.ds-w-full.ds-table.ds-table-xs.ds-table-auto.ci-scorecard-table");

       // Check if the table is found
       if (tableElement.length === 0) {
         console.log("Table not found. Verify the HTML structure.");
         return;
       }

       // Initialize an array to store the table data
       const tableData = [];

       // Traverse the table rows

    // Traverse the table rows
         var li=-1;
         var bi=1;
          tableElement.find("tr").each((index, element) => {
             const tds = $(element).find("td");


       if (tds.length === 8) {
               // Extract the data from each row
                    if (index-li ===2){
                        li=li+2;

                        }
                    else {
                        bi=1;
                        li=index;
                        }
                   // Extract the data from each row
                   const playerName = tds.eq(0).find('a').text().replace(" ",'').trim();
                   const dismissal = tds.eq(1).text();
                   const runs = tds.eq(2).find('strong').text();
                   const balls = tds.eq(3).text();
                   const fours = tds.eq(5).text();
                   const sixes = tds.eq(6).text();
                   const strikeRate = tds.eq(7).text();

                   // Push the row data to the battingSummary array
                   tableData.push({

                    battingPos: bi,
                     batsmanName: playerName,
                     dismissal,
                     runs,
                     balls,
                     fours,
                     sixes,
                     strikeRate,
               });
               bi=bi+1;
             }
           });


       // Print the extracted data
       console.log(tableData);



    return tableData;
  } catch (error) {
    console.error("Error occurred in Stage 2:", error);
  }
} // Add the missing closing brace for stage2 function

// Function to perform Stage 1 and get player links
async function performStage1() {
  const playerLinks = await stage1();
  return playerLinks;
}

// Function to perform Stage 2 for each player link
async function performStage2(links) {
  const bowlingSummaries = [];
  for (const link of links) {
    const bowlingSummary = await stage2(link);
    bowlingSummaries.push(...bowlingSummary);
  }
  return bowlingSummaries;
}

async function main() {
  try {
    // Perform Stage 1 to get player links
    const playerLinks = await performStage1();

    // Perform Stage 2 for each player link to get bowling summaries
    const bowlingSummaries = await performStage2(playerLinks);

    // Save the bowling summaries as a JSON file
    const bowlingSummaryJSON = JSON.stringify(bowlingSummaries, null, 2);
    fs.writeFile("batting_summary.json", bowlingSummaryJSON, (err) => {
      if (err) {
        console.error("Error while saving JSON file:", err);
      } else {
        console.log("batting summary data saved as JSON.");
      }
    });
  } catch (error) {
    console.error("Error occurred in main function:", error);
  }
}

// Call the main function to start the scraping process
main();
