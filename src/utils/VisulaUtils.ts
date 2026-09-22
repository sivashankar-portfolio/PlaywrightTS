import { Page,Locator,expect    }    from "@playwright/test";
import { setDevice } from "./DeviceUtils.js";

export class VisualUtil
{

static async compareFullPage(page:Page,snapShotName:string)
{
    expect(await page.screenshot({fullPage:true})).toMatchSnapshot(`${snapShotName}.png`);
}

static async compareElement(locator:Locator,snapShotName:string)
{
    expect(await locator.screenshot()).toMatchSnapshot(`${snapShotName}.png`);
}

static async compareResponsive(page:Page,snapShotName:string,deviceName:string)
{
    setDevice(page,deviceName);
    expect(await page.screenshot()).toMatchSnapshot(`${snapShotName}-${width}x${height}.png`);
}

}