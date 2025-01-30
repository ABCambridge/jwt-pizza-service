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
            found = true;
            expect( f ).toMatchObject( randomFranchise );
            break;
        }   
    }
    expect( found ).toBeTruthy();
    
    await utils.removeFranchise( randomFranchise.id )
});

test( "insert valid franchise", async () => {
    const testFranchise = utils.createRandomFranchiseObject();
    const newFranchiseResponse = await utils.insertFranchise( testFranchise );
    expect( newFranchiseResponse.status ).toBe( 200 );

    const createdFranchise = newFranchiseResponse.body;
    expect( createdFranchise ).toHaveProperty( 'id' );
    testFranchise.id = createdFranchise.id; // copy over the id so the objects should be equal
    expect( createdFranchise ).toMatchObject( testFranchise );

    await utils.removeFranchise( createdFranchise.id );
});