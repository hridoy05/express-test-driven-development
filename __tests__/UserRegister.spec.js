const request = require('supertest');
const app = require('../src/app');
const User = require('../src/user/User');
const sequelize = require('../src/config/database');

beforeAll(() => {
  return sequelize.sync();
});

beforeEach(() => {
  return User.destroy({ truncate: true });
});

const validUser = {
  username: 'user1',
  email: 'user1@mail.com',
  password: 'P4ssword',
}

const postUser = (user= validUser) => {
  return request(app).post('/api/1.0/users').send(user);
};

describe('User registration', () => {
  
  it('returns 200 ok when signup request is valid', async () => {
    const response = await postUser();
    expect(response.status).toBe(200);
  });

  it('returns success message when signup request is valid', async () => {
    const response = await postUser();
    expect(response.body.message).toBe('User created');
  });

  it('save the user to database', async () => {
    await postUser();
    const userList = await User.findAll();
    expect(userList.length).toBe(1);
  });

  it('save the username and email to database', async () => {
    await postUser();
    const userList = await User.findAll();
    const savedUser = userList[0];
    expect(savedUser.username).toBe('user1');
    expect(savedUser.email).toBe('user1@mail.com');
  });
  it('hashes the pasword in database', async () => {
    await postUser();
    const userList = await User.findAll();
    const savedUser = userList[0];
    expect(savedUser.password).not.toBe('P4ssword');
  });

  it('returns 400 when username is null', async()=> {
    const response = await postUser({
      username: null,
      email: 'user1@mail.com',
      password: 'P4ssword',
    });
    expect(response.status).toBe(400)
  })
  it('returns validationErrors field in resonse body when validation occurs', async()=> {
    const response = await postUser({
      username: null,
      email: 'user1@mail.com',
      password: 'P4ssword',
    });
    const body = response.body
    expect(body.validationErrors).not.toBeUndefined()
  })
  

  it('returns errors for both when username and email is null', async()=> {
    const response = await postUser({
      username: null,
      email: null,
      password: 'P4ssword',
    });
    const body = response.body
    expect(Object.keys(body.validationErrors)).toEqual(['username', 'email'])
  })
  it.each`
    field         |  value   |  expectedMessage
    ${'username'} | ${null}  |${'username cannot be null'}
    ${'username'} | ${'usr'}  |${'Must have min 4 and max 32 character'}
    ${'username'} | ${'a'.repeat(33)}  |${'Must have min 4 and max 32 character'}
    ${'email'}    | ${null}  |${'email cannot be null'}
    ${'email'}    | ${'mail.com'}  |${'email is not valid'}
    ${'email'}    | ${'user.mail.com'}  |${'email is not valid'}
    ${'email'}    | ${'user@mail'}  |${'email is not valid'}
    ${'password'} | ${null}  | ${'password cannot be null'}
    ${'password'} | ${'P4sw'}  | ${'password must be at least 6 character'}
    ${'password'} | ${'alllowecase'}  | ${'password must be at uppercase character,1 lowercase character and 1 number'}
    ${'password'} | ${'ALLUPPERCASE'}  | ${'password must be at uppercase character,1 lowercase character and 1 number'}
    ${'password'} | ${'1234567890'}    | ${'password must be at uppercase character,1 lowercase character and 1 number'}
    ${'password'} | ${'lowerandUPPER'} | ${'password must be at uppercase character,1 lowercase character and 1 number'}
    ${'password'} | ${'lower4nd5667'}  | ${'password must be at uppercase character,1 lowercase character and 1 number'}
    ${'password'} | ${'UPPER44444'}    | ${'password must be at uppercase character,1 lowercase character and 1 number'}
  `('returns $expectedMessage when $field is $value', async ({ field, expectedMessage,value }) => {
    const user = {
      username: 'user1',
      email: 'user1@mail.com',
      password: 'P4ssword',
    };
    user[field] = value;
    const response = await postUser(user);
    const body = response.body;
    expect(body.validationErrors[field]).toBe(expectedMessage);
  });

  // it('returns size validation error when username is less than 4 character',async ()=> {
  //   const user = {
  //     username: 'usr',
  //     email: 'user1@mail.com',
  //     password: 'P4ssword',
  //   };
  //   const response = await postUser(user);
  //   const body = response.body;
  //   expect(body.validationErrors.username).toBe('Must have min 4 and max 32 character');
  // })

});
