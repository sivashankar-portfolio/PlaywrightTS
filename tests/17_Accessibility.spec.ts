import { expect,test } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test('Basic of accessibility Testing - Should not have accessibility issues',async({page},testInfo)=>{


    await page.goto('http://127.0.0.1:8080/tests/playwright-accessibility-practice.html'); 

    const accessibilityScanResults = await new AxeBuilder({page}).analyze();

    testInfo.attach('accessibilityResults',{
      body:JSON.stringify(accessibilityScanResults,null,2),
      contentType:'application/json'
    })

    expect(accessibilityScanResults.violations).toEqual([]);
})

test('accessibility to specific part of a page',async({page})=>{


    await page.goto('https://playwright.dev/docs/accessibility-testing');
    const navSelector = "nav[aria-label='Main']";
    await page.locator(navSelector).waitFor();
    const accessibilityResults = await new AxeBuilder({ page }) 
    .include(navSelector).analyze();

    expect(accessibilityResults.violations).toEqual([])



})


test(`Verify withTags() feature for WCAG violations`,async({page})=>{

    await page.goto('');

    const accessibilityScanResults = await new AxeBuilder({page})
    .withTags(['wcag2a','wcag2aa','wcag21a','wcag21aa']).analyze();

    expect(accessibilityScanResults).toEqual([]);



})


test('should not have any accessibility violations outside of elements with known issues', async ({
  page,
}) => {
  await page.goto('https://your-site.com/page-with-known-issues');

  const accessibilityScanResults = await new AxeBuilder({ page })
      .exclude('#element-with-known-issue')
      .analyze();

  expect(accessibilityScanResults.violations).toEqual([]);
});


test('should not have any accessibility violations outside of rules with known issues', async ({
  page,
}) => {
  await page.goto('https://your-site.com/page-with-known-issues');

  const accessibilityScanResults = await new AxeBuilder({ page })
      .disableRules(['duplicate-id','color-contrast'])
      .analyze();

  expect(accessibilityScanResults.violations).toEqual([]);
});


test('Violations filter', async ({page}) => {
  await page.goto('https://your-site.com/page-with-known-issues');

  const accessibilityScanResults = await new AxeBuilder({ page })
      .analyze();


 const seriousViolations = accessibilityScanResults.violations.filter(v => v.impact === 'serious');
expect(seriousViolations).toEqual([]);
});