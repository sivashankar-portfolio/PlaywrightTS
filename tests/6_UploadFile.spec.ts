import {test,expect} from '@playwright/test';
import { fileURLToPath } from 'url';
import path from 'path';


test('Upload File Test',async ({page})=>{

await page.goto(`http://127.0.0.1:5500/tests/playwright-locator-practice-simple_1.html`);

const [chooser] = await Promise.all([
    page.waitForEvent('filechooser'),
    page.getByRole('button',{name :'Choose File to Upload'}).click()

])

const filepath = path.dirname(fileURLToPath(import.meta.url));
await chooser.setFiles(path.join(filepath, 'upload', 'sample-upload.txt'));
await expect(page.getByText(`✔ Selected file: sample-upload.txt`)).toBeVisible();

});

test('Upload File Test using import.meta.url',async ({page})=>{

await page.goto(`http://127.0.0.1:5500/tests/playwright-locator-practice-simple_1.html`);

const [chooser] = await Promise.all([
    page.waitForEvent('filechooser'),
    page.getByRole('button',{name :'Choose File to Upload'}).click()

])
const dirpath = path.dirname(fileURLToPath(import.meta.url));
const filename = 'sample-upload.txt';
await chooser.setFiles(path.join(dirpath, 'upload', filename));
await expect(page.getByText(`file: ${filename}`)).toBeVisible();

});


