import {test,expect} from'@playwright/test'
import path from 'path';


test('Verify textbox fields',async ({page},testInfo)=>{

await page.goto("http://127.0.0.1:8080/tests/playwright-interactions-practice.html");

await page.getByPlaceholder("Enter your name",{exact:true}).fill("Sivashankar");

 const txt_ShortBio = page.getByLabel('Short Bio');
 

await txt_ShortBio.fill('SDET learning Playwright.');

const buffer = await txt_ShortBio.screenshot();

await testInfo.attach('Element screenshot ',{
    body:buffer,
    contentType:'image/png'
});

await page.waitForTimeout(5000);

})

const bookingDates = [
    { label: 'past date', value: '2020-01-15' },
    { label: 'present date', value: '2026-08-24' },
    { label: 'future date', value: '2030-12-31' },
];

for (const { label, value } of bookingDates) {

    test(`Select Booking Date via click (not fill) - ${label} (${value})`, async ({ page }) => {

        await page.goto("http://127.0.0.1:8080/tests/playwright-interactions-practice.html");

        await page.getByRole('tab', { name: /Files, Dates & Scroll/ }).click();

        const bookingDate = page.getByLabel('Booking Date');
        await bookingDate.scrollIntoViewIfNeeded();
        const box = await bookingDate.boundingBox();
        if (!box) throw new Error('Booking Date input is not visible');

        const [year, month, day] = value.split('-');

        // Native date input has no clickable calendar cells, so click() only focuses it -
        // clicking near the left edge lands on the first ("dd") segment (this browser renders
        // dd-mm-yyyy), then typing the digits (segments auto-advance) fills the value - no fill().
        await bookingDate.click({ position: { x: 8, y: box.height / 2 } });
        await page.keyboard.type(`${day}${month}${year}`);

        await expect(bookingDate).toHaveValue(value);

    });

}



test('Verify dropdown actions @dropdown',async({page})=>{


    await page.goto('http://127.0.0.1:8080/tests/playwright-interactions-practice.html');

    const countryDropDown = page.locator('#sel-country');
    await countryDropDown.scrollIntoViewIfNeeded();

    await countryDropDown.selectOption('UAE');
    await page.waitForTimeout(5000);
    console.log(await countryDropDown.inputValue());

    await expect(countryDropDown).toHaveValue("UAE");

    
})


test(`Verify Keyboard action`,async({page})=>{

await  page.goto('http://127.0.0.1:8080/tests/playwright-interactions-practice.html');

//click on the tab Keyboard , 

// if you are passing substring as name for then use regex else playwright cannot locate it

await page.getByRole('tab',{name:/Keyboard/}).click();

// Enter text on Query textbox

const querySearchBox = page.locator('#kb-search');

await querySearchBox.pressSequentially("Hello");

await querySearchBox.press('Enter');




})


test('Upload file using path.resolve()',async({page})=>{

    await page.goto('http://127.0.0.1:8080/tests/playwright-interactions-practice.html');

    await page.getByRole('tab',{name:/Files/}).click();

    await page.setInputFiles(`//input[@id='file-direct']`,path.resolve("./tests/upload/sample-upload.txt"));

    await page.waitForTimeout(4000);
})

