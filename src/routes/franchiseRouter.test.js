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
    // TODO: the franchise objects in the list do not match the shape contract indicated by the API docs

    expect( checkForFranchiseInList( randomFranchise, franchiseList ) ).toBeTruthy();
    
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
    expect( checkForFranchiseInList( createdFranchise, ( await utils.getAllFranchises() ).body ) ).toBeTruthy();

    await utils.removeFranchise( createdFranchise.id );
});

test( "delete valid franchise", async () => {
    const randomFranchise = await utils.insertRandomFranchise();
    const token = utils.getTokenFromResponse( await utils.loginUser( utils.adminUser ) );
    const deleteResponse = await utils.deleteFranchise( token, randomFranchise.id );

    expect( deleteResponse.status ).toBe( 200 );

    expect( checkForFranchiseInList( randomFranchise, ( await utils.getAllFranchises() ).body ) ).toBeFalsy();
    
    await utils.logoutUser( token );
});

test( "create valid franchise store", async () => {
    const randomFranchise = await utils.insertRandomFranchise();
    const token = utils.getTokenFromResponse( await utils.loginUser( utils.adminUser ) );

    const newStore = {
        franchiseId: randomFranchise.id,
        name: utils.randomName()
    }
    const storeResponse = await utils.createStore( token, randomFranchise.id, newStore );
    expect( storeResponse.status ).toBe( 200 );
    const store = storeResponse.body;
    expect( store.name ).toBe( newStore.name );
    // TODO: the store object returned from the database does not match the shape contract indicated by the API docs

    await utils.deleteStore( token, randomFranchise.id, store.id );
    await utils.logoutUser( token );
    await utils.removeFranchise( randomFranchise.id );
});

test( "delete valid franchise store", async () => {
    const randomFranchise = await utils.insertRandomFranchise();
    const token = utils.getTokenFromResponse( await utils.loginUser( utils.adminUser ) );

    const newStore = {
        franchiseId: randomFranchise.id,
        name: utils.randomName()
    }
    const storeReponse = await utils.createStore( token, randomFranchise.id, newStore );
    const store = storeReponse.body;

    const deleteResponse = await utils.deleteStore( token, randomFranchise.id, store.id );
    expect( deleteResponse.status ).toBe( 200 );
    expect( deleteResponse.body.message ).toBe( "store deleted" );

    await utils.logoutUser( token );
    await utils.removeFranchise( randomFranchise.id );
});


function checkForFranchiseInList( franchise, franchiseList ) {
    let found = false;
    for( const f of franchiseList ) {
        if( f.id === franchise.id ) {
            found = true;
            break;
        }
    }

    return found;
}