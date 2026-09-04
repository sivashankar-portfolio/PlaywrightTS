import { Locator, Page } from "@playwright/test";
import { CustomLogger } from "../logger/customlogger.js";

export class LoginPage
{
    private readonly page: Page;
    private readonly usernameInput: Locator;
    private readonly passwordInput: Locator;
    private readonly loginBtn: Locator;
    logger = new CustomLogger();
    constructor(page:Page)
    {
        this.page=page;
        this.usernameInput=page.locator("#user-name");
        this.passwordInput=page.locator("#password");

        const loginBtnIdSubstring = "login-"; // known only at runtime
        // this.loginBtn=page.locator(`[id*="${loginBtnIdSubstring}"]`);
        this.loginBtn=page.locator(`#${loginBtnIdSubstring}button`);
    }

    async goto()
    {
        this.logger.info('Navigating to login page')
        await this.page.goto("https://www.saucedemo.com/");
    }

    async login(username: string, password: string)
    {
        await this.usernameInput.fill(username);
        await this.passwordInput.fill(password);
        await this.loginBtn.click();
    }
}