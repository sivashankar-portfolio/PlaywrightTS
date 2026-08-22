import { expect, test } from '@playwright/test';
import path from 'path';


test('Download File',async({page})=>{

await page.goto("https://www.tutorialspoint.com/selenium/practice/upload-download.php");

const [downloadImage] = await Promise.all([

// Do not use await inside Promise.all 
     page.waitForEvent('download'),
     page.getByRole('link',{name:'Download'}).last().click()
])
//Verify the downloaded file name 
expect(downloadImage.suggestedFilename()).toContain("sampleFile");

// save the downloaded file to this path to use it further

await downloadImage.saveAs(path.join('test-results','downloads',downloadImage.suggestedFilename()));




})