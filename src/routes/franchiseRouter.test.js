const utils = require( '../testUtilities' )
const app = utils.app;
const request = utils.request;

test( "valid list franchises", async () => {
    const randomFranchise = await utils.insertRandomFranchise();
    randomFranchise.stores = [];
    delete randomFranchise.admins;

    const franchiseResponse = await utils.getAllFranchises();
    expect( franchiseResponse.status ).toBe( 200 );
    
    const franchiseList = franchiseResponse.body;
    expect( franchiseList.length ).toBeGreaterThanOrEqual( 0 );

    checkForFranchiseInList( randomFranchise, franchiseList );
    
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

    createdFranchise.stores = []
    delete createdFranchise.admins;
    checkForFranchiseInList( createdFranchise, ( await utils.getAllFranchises() ).body );

    await utils.removeFranchise( createdFranchise.id );
});

test( "delete valid franchise", async () => {
    const randomFranchise = await utils.insertRandomFranchise();
    const token = utils.getTokenFromResponse( await utils.loginUser( utils.adminUser ) );
    const deleteResponse = await utils.deleteFranchise( token, randomFranchise.id );

    expect( deleteResponse.status ).toBe( 200 );
    
    await utils.logoutUser( token );
});

test( "create valid franchise store", async () => {
    const randomFranchise = await utils.insertRandomFranchise();
    const token = utils.getTokenFromResponse( await utils.loginUser( utils.adminUser ) );

    const data = {
        franchiseId: randomFranchise.id,
        name: "TestStore"
    }
    const storeResponse = await request( app ).post( `/api/franchise/${randomFranchise.id}/store` ).set( "Authorization", `Bearer ${token}` ).send( data );
    expect( storeResponse.status ).toBe( 200 );
    

    await utils.logoutUser( token );
});

function checkForFranchiseInList( franchise, franchiseList ) {
    let found = false;
    for( const f of franchiseList ) {
        if( f.id === franchise.id ) {
            found = true;
            expect( f ).toMatchObject( franchise );
            break;
        }
    }

    expect( found ).toBeTruthy();
}