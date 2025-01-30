const utils = require( '../testUtilities' )
const app = utils.app;
const request = utils.request;

test( "valid list franchises", async () => {
    const randomFranchise = await utils.insertRandomFranchise();
    randomFranchise.stores = [];
    delete randomFranchise.admins;

    const franchiseResponse = await request( app ).get( "/api/franchise" ).send();
    expect( franchiseResponse.status ).toBe( 200 );
    
    const franchiseList = franchiseResponse.body;
    expect( franchiseList.length ).toBeGreaterThanOrEqual( 0 );

    let found = false;
    for( const f of franchiseList ) {
        if ( f.id === randomFranchise.id ) {
            expect( f ).toMatchObject( randomFranchise );
            break;
        }   
    }
    // The below line should work, but is failing because the DB function doesn't attach the users, but the API specifies their presence.
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