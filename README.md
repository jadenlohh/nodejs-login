# nodejs-login
A simple login page using nodejs and ejs. It is a very basic login system that uses `mongoDB` and `bcrypt` to validate users

## Login system
When a user tries to login using their email and password, it will verify againist `mongoDB` database to check if the user is registered.

If a user enters a wrong email or password, it show an invalid email or password error:

<img src="https://github.com/jadenlohh/images/blob/main/Screenshot%202021-05-25%20175139.png" width="50%" alt="Image of login error">

## Registration system
When a user tries to register for the first time, it will verify againist `mongoDB` database to check if the user is already registered using their email.

If a user is an existing user, it will show an error:

<img src="https://github.com/jadenlohh/images/blob/main/Screenshot%202021-05-25%20180207.png" width="45%" alt="Image of registration error">

Similarly, if the user enters a invalid password, it will show an error as well: 

<img src="https://github.com/jadenlohh/images/blob/main/Screenshot%202021-05-25%20180537.png" width="40%" alt="Image of registration error">

### Notice
Note that this login system does not support mobile so it will look different on mobile
