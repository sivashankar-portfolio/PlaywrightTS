import { Page } from "@playwright/test";

type Device={
    width :number;
    height:number;
}

const devices :Record<string,Device> ={

 iPhoneX: { width: 375, height: 812 },
 iPhone14: { width: 390, height: 844 },
 iPhone14ProMax: { width: 430, height: 932 },
 Pixel5: { width: 393, height: 851 },
 GalaxyS21: { width: 360, height: 800 },
 iPad: { width: 810, height: 1080 },
 iPadPro: { width: 1024, height: 1366 },
 MacBookAir: { width: 1440, height: 900 },
 MacBookPro16: { width: 1728, height: 1117 },
 DesktopHD: { width: 1920, height: 1080 },
 QuadHD: { width: 2560, height: 1440 },
 UHD4K: { width: 3840, height: 2160 },

}

export async function setDevice(page:Page,deviceName:string):Promise<void>
{

 if (!devices[deviceName]) {
   throw new Error(
     `Device "${deviceName}" not found. Available devices:
      ${Object.keys(devices).join(", ")}`);

 }

 await page.setViewportSize(devices[deviceName]);
 console.log(`ViewPort set to ${deviceName} - `,devices[deviceName]);


}