const request = require('supertest');
const app = require('../service');

const adminUser = {
    email: "a@jwt.com",
    password: "admin"
}

test( "valid list franchises", async () => {
    const franchiseResponse = await request( app ).get( "/api/franchise" ).send();
    expect( franchiseResponse.status ).toBe( 200 );
    console.log( franchiseResponse.body );
});

function createRandomFranchise() {
    
}