import {test,expect } from '@playwright/test';
import fs from 'fs';
import path from 'path';


test("Get call",async({request})=>{

const id =1;
const response = await request.get(`https://restful-booker.herokuapp.com/booking/${id}`,{
    headers:{Accept:'application/json'}

});

    expect(response.status()).toBe(200);
    console.log(response.status())
    const body = await response.json();
    console.log(JSON.stringify(body,null,2))

    await expect(response).toBeOK();


})


test('post call',async({request})=>{

const response = await request.post("https://restful-booker.herokuapp.com/booking",{

headers:{'Content-Type':'application/json'},
data:{
 "firstname" : "Jimmy",
    "lastname" : "Brown",
    "totalprice" : 111,
    "depositpaid" : true,
    "bookingdates" : {
        "checkin" : "2018-01-01",
        "checkout" : "2019-01-01"
    },
    "additionalneeds" : "Breakfast"

}

    
});

const body = await response.json();
expect(body.booking.additionalneeds).toBe("Breakfast")

})


test('post call with request body from external json file',async({request})=>{

const requestBody = JSON.parse(fs.readFileSync(path.join(process.cwd(),'tests','testdata','booking.json'),'utf-8'));

const response = await request.post("https://restful-booker.herokuapp.com/booking",{
    headers:{'Content-Type':'application/json'},
    data: requestBody
});

expect(response.status()).toBe(200);
const body = await response.json();
expect(body.booking.firstname).toBe(requestBody.firstname);
expect(body.booking.totalprice).toBe(requestBody.totalprice);
expect(body.booking.additionalneeds).toBe(requestBody.additionalneeds);

})


test("PUT method",async({request})=>{
    const requestBody = JSON.parse(fs.readFileSync(path.join(process.cwd(),'tests','testdata','UpdateBooking.json'),'utf-8'))

// PUT needs a valid token, so get one from the auth endpoint first
const authResponse = await request.post("https://restful-booker.herokuapp.com/auth",{
    data:{username:'admin',password:'password123'}
});
expect(authResponse.status()).toBe(200);
const {token} = await authResponse.json();

const id=1
const response = await request.put(`https://restful-booker.herokuapp.com/booking/${id}`,{
headers:{Accept:'application/json','Content-Type':'application/json',Cookie:`token=${token}`},

data:requestBody


});

expect(response.status()).toBe(200);
const responseBody = await response.json();
console.log(responseBody.firstname)
expect(responseBody.firstname).toBe('JimL')


})