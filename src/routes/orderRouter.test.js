const utils = require( '../testUtilities' );

test( "valid add menu item", async () => {
    const addMenuResponse = await utils.addMenuItem( utils.makeRandomMenuItem() );
    console.log( JSON.stringify( addMenuResponse.body ) );
    expect( addMenuResponse.status ).toBe( 200 );
    const menu = addMenuResponse.body;
    expect( menu.length ).toBeGreaterThan( 0 );
});

// test( "valid list menu", async () => {
//     const addMenuResponse = await utils.addMenuItem( utils.makeRandomMenuItem() );
//     const menuItem = addMenuResponse.body[0];
//     console.log(JSON.stringify(addMenuResponse.body));

//     const menuResponse = await utils.getMenu();
//     expect( menuResponse.status ).toBe( 200 );
    
//     const menuList = menuResponse.body;
//     expect( menuList.length ).toBeGreaterThan( 0 );

//     const pizzaType = menuList[0];
//     expect( pizzaType ).toHaveProperty( "id" );
//     expect( pizzaType.title ).toBe( menuItem.title );
//     expect( pizzaType.image ).toBe( menuItem.image );
//     expect( pizzaType.price ).toBe( menuItem.price );
//     expect( pizzaType.description ).toBe( menuItem.description );
// });