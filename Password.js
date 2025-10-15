import bcrypt from 'bcrypt';

export class Password {

  #hash;

  constructor(rawPassword) {
    if (rawPassword !== undefined) {
      this.#hash = this.hashPassword(rawPassword);
    }
  }

  hashPassword(rawPassword) {
    if (typeof rawPassword !== 'string') {
      throw new TypeError("rawPassword must be a string");
    }
    const saltRounds = 10;
    return bcrypt.hashSync(rawPassword, saltRounds)
  }

  verify(inputPassword) {
    if (inputPassword == null) {
        throw new TypeError("Input Password cannot be null or undefined");
    }
    if (typeof inputPassword !== 'string') {
      throw new TypeError("inputPassword must be a string");
    }
    return bcrypt.compareSync(inputPassword, this.#hash);
  }

  get hash(){
    return this.#hash;
  }

}