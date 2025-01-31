const utils = require( '../testUtilities' );

let admin;

beforeAll(async () => {
    admin = await utils.makeAdminUser();  
})

test( "valid add menu item", async () => {
    const menuItem = utils.makeRandomMenuItem();
    const addMenuResponse = await utils.addMenuItem( menuItem, admin );
    
    expect( addMenuResponse.status ).toBe( 200 );
    const menu = addMenuResponse.body;
    expect( menu.length ).toBeGreaterThan( 0 );

    let found = true;
    for( const m of menu ) {
        if( m.title === menuItem.title ) {
            found = true;
            break;
        }
    }

    expect( found ).toBeTruthy();
});

test( "valid list menu", async () => {
    const addMenuResponse = await utils.addMenuItem( utils.makeRandomMenuItem(), admin );
    const menuItem = addMenuResponse.body[0];

    const menuResponse = await utils.getMenu();
    expect( menuResponse.status ).toBe( 200 );
    
    const menuList = menuResponse.body;
    expect( menuList.length ).toBeGreaterThan( 0 );

    const pizzaType = menuList[0];
    expect( pizzaType ).toHaveProperty( "id" );
    expect( pizzaType.title ).toBe( menuItem.title );
    expect( pizzaType.image ).toBe( menuItem.image );
    expect( pizzaType.price ).toBe( menuItem.price );
    expect( pizzaType.description ).toBe( menuItem.description );
});