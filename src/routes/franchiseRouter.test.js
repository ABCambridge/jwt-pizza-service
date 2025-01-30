const utils = require( '../testUtilities' )
const app = utils.app;
const request = utils.request;

test( "valid list franchises", async () => {
    const randomFranchise = await utils.insertRandomFranchise();
    const franchiseResponse = await request( app ).get( "/api/franchise" ).send();
    expect( franchiseResponse.status ).toBe( 200 );
    // test that body length is greater than zero
    // test that the list contains the new franchise
    // remove the franchise
});

test( "insert valid franchise", async () => {
    const testFranchise = utils.createRandomFranchiseObject();
    const newFranchiseResponse = await utils.insertFranchise( testFranchise );
    expect( newFranchiseResponse.status ).toBe( 200 );

    const createdFranchise = newFranchiseResponse.body;
    expect( createdFranchise ).toHaveProperty( 'id' );
    testFranchise.id = createdFranchise.id; // copy over the id so the objects should be equal
    expect( createdFranchise ).toMatchObject( testFranchise );
});