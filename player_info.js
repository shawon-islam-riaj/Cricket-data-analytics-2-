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



//------------ STAGE 2 ------------//


async function stage2(playerURL) {
  try {
    // ... (Your existing stage2 code remains the same)

    const browser = await puppeteer.launch({ headless: true });
        const page = await browser.newPage();

        await page.goto(playerURL, { waitUntil: 'domcontentloaded' });
        await page.waitForTimeout(2000); // Add an additional delay to ensure content is fully loaded

        const htmlContent = await page.content();
        await browser.close();

        const $ = cheerio.load(htmlContent);
    const playerLinks = [];
//
     var tableElement = $("table.ds-w-full.ds-table.ds-table-xs.ds-table-auto.ci-scorecard-table");

           // Check if the table is found
           if (tableElement.length === 0) {
             console.log("Table not found. Verify the HTML structure.");
             return;
           }

    tableElement.find("tr").each((index, element) => {
      const tds = $(element).find("td");
      if (tds.length === 8) {
        const playerName = tds.eq(0).find('a').text().replace(" ", '').trim();
        const link = "https://www.espncricinfo.com" + tds.eq(0).find('a').attr('href').trim();

        playerLinks.push({
          'playerName': playerName,
          'link': link
        });
      }
    });
    const tableElementb = $("table.ds-w-full.ds-table.ds-table-xs.ds-table-auto");

           // Check if the table is found
           if (tableElementb.length === 0) {
             console.log("Table not found. Verify the HTML structure.");
             return;
           }


           // Traverse the table rows

        // Traverse the table rows
              tableElementb.find("tr").each((indexb, elementb) => {
                 const tdsb = $(elementb).find("td");

           if (tdsb.length === 11) {
                   // Extract the data from each row
                   const playerName = tdsb.eq(0).find('a').text().replace(" ",'').trim();
                   const link = "https://www.espncricinfo.com" + tdsb.eq(0).find('a').attr('href').trim();


                   // Push the row data to the tableData array
                   playerLinks.push({
                             playerName,
                             link
                   });
                 }
               });


           // Print the extracted data





    return playerLinks;
  } catch (error) {
    console.error("Error occurred in Stage 2:", error);
  }
}
async function stage3(playerURL) {
             // ... (Your existing stage2 code remains the same)
             console.log(playerURL)
         url=playerURL.link
         name=playerURL.playerName
         console.log(url,name)
         try {
             const browser = await puppeteer.launch({ headless: true });
             // ... (Rest of your stage3 code)
             // (Remove the existing console.log(url, name) line as we added a better log above)

           } catch (error) {
             console.error("Error occurred in Stage 3:", error);
           }

         const browser = await puppeteer.launch({ headless: true });
             const page = await browser.newPage();

             await page.goto(url, { waitUntil: 'domcontentloaded' });
             await page.waitForTimeout(2000); // Add an additional delay to ensure content is fully loaded

             const htmlContent = await page.content();
             await browser.close();

             const $ = cheerio.load(htmlContent);
            const playersData = [];


    const playerInfoDiv = $('div.ds-grid.lg\\:ds-grid-cols-3.ds-grid-cols-2.ds-gap-4.ds-mb-8');
    const fullName = playerInfoDiv.find('p.ds-text-tight-m.ds-font-regular.ds-uppercase.ds-text-typo-mid3:contains("Full Name")').siblings('span').text().trim();
    const bornDate = playerInfoDiv.find('p.ds-text-tight-m.ds-font-regular.ds-uppercase.ds-text-typo-mid3:contains("Born")').siblings('span').text().trim();
    const age = playerInfoDiv.find('p.ds-text-tight-m.ds-font-regular.ds-uppercase.ds-text-typo-mid3:contains("Age")').siblings('span').text().trim();
    const battingStyle = playerInfoDiv.find('p.ds-text-tight-m.ds-font-regular.ds-uppercase.ds-text-typo-mid3:contains("Batting Style")').siblings('span').text().trim();
    const bowlingStyle = playerInfoDiv.find('p.ds-text-tight-m.ds-font-regular.ds-uppercase.ds-text-typo-mid3:contains("Bowling Style")').siblings('span').text().trim();
    const playingRole = playerInfoDiv.find('p.ds-text-tight-m.ds-font-regular.ds-uppercase.ds-text-typo-mid3:contains("Playing Role")').siblings('span').text().trim();
 const teamName = $('div.ds-grid.lg\\:ds-grid-cols-3.ds-grid-cols-2.ds-gap-y-4')
      .find('a')
      .first()
      .find('span.ds-text-title-s.ds-font-bold.ds-text-typo.ds-underline')
      .text()
      .trim();
//            .filter(function(index){
//                return $(this).text() === 'Batting Style';
//                console.log($(this).text())
//            });
//
//            const bowlingStyle = $('div.ds-grid > div > span.ds-text-title-s.ds-font-bold.ds-text-typo > p').filter(function(index){
//                return $(this).text() === 'Bowling Style';
//            });
//
//            const playingRole = $('div.ds-grid > div > span.ds-text-title-s.ds-font-bold.ds-text-typo > p').filter(function(index){
//                return $(this).text() ==='Playing Role';
//            });
            return {
                "name": name,
                 "team": teamName,
                "battingStyle": battingStyle,
                "bowlingStyle": bowlingStyle,
                "playingRole": playingRole,


            };

            }









// Function to perform Stage 1 and get player links
async function performStage1() {
  const MatchLinks = await stage1();
  return MatchLinks;
}

// Function to perform Stage 2 for each player link
async function performStage2(links) {
  const playerLinks = []; // Rename the array variable to playerLinks
  for (const link of links) {
    const pl = await stage2(link); // Rename the loop variable to pl
    playerLinks.push(...pl); // Use playerLinks array
  }
  return playerLinks;
}

async function performStage3(links) {
  console.log("avse");
  const playerData = []; // Rename the array variable to playerData
  for (const link of links) {
    console.log(link);
    const pd = await stage3(link); // Rename the loop variable to pd
    playerData.push(...pd); // Use playerData array
  }
  return playerData;
}


async function main() {
  try {
     //Perform Stage 1 to get player links
    const MatchLinks = await performStage1();

    // Perform Stage 2 for each player link to get bowling summaries
    const PlayerLinks = await performStage2(MatchLinks);


    const PlayerData= await stage3(PlayerLinks);
    console.log(PlayerData)

     //Save the bowling summaries as a JSON file
    const playerinfoJSON = JSON.stringify(PlayerData, null, 2);
    fs.writeFile("player_info.json", bowlingSummaryJSON, (err) => {
      if (err) {
        console.error("Error while saving JSON file:", err);
      } else {
        console.log("player info data saved as JSON.");
      }
    });
  } catch (error) {
    console.error("Error occurred in main function:", error);
  }
}

// Call the main function to start the scraping process
main();