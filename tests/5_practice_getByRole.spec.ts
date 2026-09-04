import {test,expect} from '@playwright/test';
import { fileURLToPath } from 'url';
import path from 'path';
import fs from 'fs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

test.use({channel:'msedge'})
test('Practise getByRole',async ({page})=>{


    await page.goto("http://127.0.0.1:8080/playwright-locator-practice-simple_1.html");

   const country =  page.getByRole('combobox',{name:'Select Country'});

   await country.selectOption({value:'USA'});
   await expect(country).toHaveValue('USA');

   const multi_SelectSkills =  page.getByRole('listbox',{name:'Select Skills'});

   await multi_SelectSkills.selectOption(['JavaScript','Java']);
   await expect(multi_SelectSkills).toHaveValues(['JavaScript','Java']);

   await  page.getByRole('button',{name:'Submit Form'}).click();

   const time = Date.now();
   await page.screenshot({path:`test-results/screenshots/skills_${time}.png`,fullPage:true});

})


test('Practise handling popups, dialogs, downloads and uploads', async ({ page, context }) => {

  await page.goto("http://127.0.0.1:8080/tests/playwright-locator-practice-simple_1.html");

  // ------------------------------------------------------------------
  // 1) JS DIALOGS: alert / confirm / prompt
  //
  // Playwright auto-dismisses native dialogs (alert/confirm/prompt/
  // beforeunload) unless you register a page.on('dialog', ...) handler
  // BEFORE the action that triggers them. The handler fires the instant
  // the dialog opens, so it must be wired up first — you cannot "wait
  // and then react" the way you can with most other locators.
  //
  // dialog.type()    -> 'alert' | 'confirm' | 'prompt' | 'beforeunload'
  // dialog.message()  -> the text shown in the dialog
  // dialog.accept(text?) -> clicks OK (optionally typing `text` for a prompt)
  // dialog.dismiss()  -> clicks Cancel / closes the dialog
  // ------------------------------------------------------------------

  // --- alert(): only has an OK button, so just accept it ---
  page.once('dialog', async (dialog) => {
    expect(dialog.type()).toBe('alert');
    expect(dialog.message()).toBe('This is a simple alert message!');
    await dialog.accept();
  });
  await page.getByRole('button', { name: 'Show Alert' }).click();

  // --- confirm(): has OK/Cancel, accept() = OK (returns true to the page) ---
  page.once('dialog', async (dialog) => {
    expect(dialog.type()).toBe('confirm');
    await dialog.accept(); // dialog.dismiss() would simulate clicking Cancel
  });
  await page.getByRole('button', { name: 'Show Confirm' }).click();
  // The page script writes the JS return value into the card's message area,
  // so we can assert the dialog was actually accepted (confirm() returned true).
  await expect(page.getByText('Confirm result: true')).toBeVisible();

  // --- prompt(): accept(text) both clicks OK and fills the input ---
  page.once('dialog', async (dialog) => {
    expect(dialog.type()).toBe('prompt');
    await dialog.accept('Sivashankar');
  });
  await page.getByRole('button', { name: 'Show Prompt' }).click();
  await expect(page.getByText('Prompt result: Sivashankar')).toBeVisible();

  // ------------------------------------------------------------------
  // 2) NEW TAB / WINDOW POPUPS (target="_blank", window.open, etc.)
  //
  // A new tab is a brand-new Page object belonging to the same
  // BrowserContext. You must start listening for the context's 'page'
  // event BEFORE clicking, then Promise.all both the wait and the click
  // together so neither call can race ahead of the other.
  // ------------------------------------------------------------------
  const [newtab] = await Promise.all([
    context.waitForEvent('page'),                         // starts waiting first
    page.getByRole('link', { name: 'Open New Tab' }).click(), // triggers the popup
  ]);
  await newtab.waitForLoadState();
  expect(newtab.url()).toContain('playwright.dev');
  await newtab.close(); // clean up the extra tab so it doesn't leak into other tests

  // ------------------------------------------------------------------
  // 3) DOWNLOADS
  //
  // Clicking a download link/button fires the page's 'download' event
  // instead of navigating. Same Promise.all pattern as the popup above:
  // start waiting, then perform the click that triggers it.
  // ------------------------------------------------------------------
  const [download] = await Promise.all([
    page.waitForEvent('download'),
    page.getByRole('link', { name: 'Download Sample File' }).click(),
  ]);
  expect(download.suggestedFilename()).toBe('sample-download.txt');
  // Persist it wherever you want to inspect/verify the file afterwards.
  await download.saveAs(path.join('test-results', 'downloads', download.suggestedFilename()));

  // ------------------------------------------------------------------
  // 4) UPLOADS
  // ------------------------------------------------------------------
  const sampleFile = path.join(__dirname, 'fixtures', 'sample-upload.txt');
  console.log('DEBUG sampleFile:', sampleFile, fs.existsSync(sampleFile));

  // 4a) Direct <input type="file">: no dialog ever appears in automation —
  // just call setInputFiles() straight on the input's locator. This is the
  // preferred approach whenever the input element itself is reachable.
  const uploadLoc = page.getByLabel('Upload File');
  console.log('DEBUG count:', await uploadLoc.count());
  console.log('DEBUG tag:', await uploadLoc.first().evaluate(el => el.outerHTML));
  await uploadLoc.setInputFiles(sampleFile);
  console.log('DEBUG files:', await uploadLoc.evaluate(el => el.files.length));
  console.log('DEBUG msg html:', await page.evaluate(() => document.getElementById('fileUpload').closest('.card').querySelector('.msg').outerHTML));
  await expect(page.getByText('Selected file: sample-upload.txt').first()).toBeVisible();

  // 4b) Hidden <input type="file"> opened indirectly via a styled button
  // (e.g. input.click() called from JS, or a custom-styled "Upload" button).
  // Here the OS file-picker dialog would normally block automation, so
  // Playwright intercepts it as a 'filechooser' event instead — same
  // "start waiting, then click" pattern as the popup/download cases.
  const [chooser] = await Promise.all([
    page.waitForEvent('filechooser'),
    page.getByRole('button', { name: 'Choose File to Upload' }).click(),
  ]);
  await chooser.setFiles(sampleFile);
  await expect(page.getByText('Selected file: sample-upload.txt').last()).toBeVisible();

});


