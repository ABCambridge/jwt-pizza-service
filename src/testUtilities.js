const request = require('supertest');
const app = require('./service');
const { Role, DB } = require( "./database/database.js" );

function makeAdminUser() {
  const admin = {
    name: randomName(),
    email: `${randomName()}@jwt.com`,
    password: "admin",
    roles: [{
      role: Role.Admin
    }]
  };

  DB.addUser( admin );
  return admin;
}

function expectValidJwt(potentialJwt) {
    expect(potentialJwt).toMatch(/^[a-zA-Z0-9\-_]*\.[a-zA-Z0-9\-_]*\.[a-zA-Z0-9\-_]*$/);
}

function randomName() {
    return Math.random().toString(36).substring(2, 12);
}

/**
 * Logs in a provided user.
 * @param {*} user The valid user object to log in
 * @returns The response from the service.
 */
async function loginUser( user ) {
  return await request( app ).put( '/api/auth' ).send( user );
}

/**
 * Extracts the auth token from the service response
 * @param {*} response 
 * @returns 
 */
function getTokenFromResponse( response ) {
  return response.body.token;
}

/**
 * Logs out the user with the provided auth token.
 * @param {*} authToken 
 * @returns The response from the service.
 */
async function logoutUser( authToken ) {
  return await request( app ).delete( "/api/auth" ).set( "Authorization", `Bearer ${authToken}` ).send();
}

async function updateUser( authToken, userId, userUpdates ) {
  return await request( app ).put( `/api/auth/${userId}` ).set( "Authorization", `Bearer ${authToken}`).send( userUpdates );
}

async function getAllFranchises() {
  return await request( app ).get( "/api/franchise" ).send();
}

function createRandomFranchiseObject( user ) {
  const franchise = {
      name: randomName(),
      admins: [{
          email: user.email
      },]
  }
  return franchise;
}

// todo: changes start here
async function insertFranchise( franchise, user ) {
  const token = getTokenFromResponse( await loginUser( user ) );
  const result = await request( app ).post( "/api/franchise" ).set( "Authorization", `Bearer ${token}`).send( franchise );
  await logoutUser( token );
  return result;
}

async function insertRandomFranchise( user ) {
  const franchise = createRandomFranchiseObject();
  const response = await insertFranchise( franchise, user );
  return response.body;
}

async function deleteFranchise( authToken, franchiseId ) {
  return await request( app ).delete( `/api/franchise/${franchiseId}` ).set( "Authorization", `Bearer ${authToken}`);
}

async function removeFranchise( franchiseId ,user ) {
  const token = getTokenFromResponse( await loginUser( user ) );
  const deleteResponse = deleteFranchise( token, franchiseId );
  await logoutUser( token );
  return deleteResponse.body;
}

async function createStore( authToken, franchiseId, newStore ) {
  return await request( app ).post( `/api/franchise/${franchiseId}/store` ).set( "Authorization", `Bearer ${authToken}` ).send( newStore );
}

async function deleteStore( authToken, franchiseId, storeId ) {
  return await request( app ).delete( `/api/franchise/${franchiseId}/store/${storeId}` ).set( "Authorization", `Bearer ${authToken}` ).send();
}

async function getMenu() {
  return await request( app ).get( "/api/order/menu" ).send();
}

function makeRandomMenuItem() {
  return {
    "title": randomName(),
    "description": "this is a test menu item",
    "image": "no-image",
    "price": .001,
  }
}

async function addMenuItem( item, user ) {
  const token = getTokenFromResponse( await loginUser ( user ) );
  const addItemResponse = await request( app ).put( "/api/order/menu" ).set( "Authorization", `Bearer ${token}`).send( item );
  await logoutUser( token );
  return addItemResponse;
}

module.exports = {
  app,
  request,
  makeAdminUser,
  expectValidJwt,
  randomName,
  loginUser,
  getTokenFromResponse,
  logoutUser,
  updateUser,
  createRandomFranchiseObject,
  insertFranchise,
  insertRandomFranchise,
  removeFranchise,
  deleteFranchise,
  getAllFranchises,
  createStore,
  deleteStore,
  getMenu,
  addMenuItem,
  makeRandomMenuItem
}