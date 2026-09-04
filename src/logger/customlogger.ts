 export class CustomLogger {


 private timestamp(): string {
   return new Date().toISOString();
 }


 info(message: string, ...args: any[]) {
   console.log(`[${this.timestamp()}] INFO: ${message}`, ...args);
 }


 error(message: string, ...args: any[]) {
   console.error(`[${this.timestamp()}] ERROR: ${message}`, ...args);
 }


 warn(message: string, ...args: any[]) {
   console.warn(`[${this.timestamp()}] WARN: ${message}`, ...args);
 }

}
