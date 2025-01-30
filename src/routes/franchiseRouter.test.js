const utils = require( '../testUtilities' )
const app = utils.app;
const request = utils.request;

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