import { Password } from './Password.js';
import { UserProfile } from './UserProfile.js';

export class UserAccount {

  static #nextId = 1;

  #id;
  #username;
  #name;
  #passwordHash;
  #email;
  #profile;
  #dateCreated;
  #isActive;

  constructor(username, name, passwordHash, email, profile) {

    this.#id = UserAccount.#nextId++;
    this.#username = username;
    this.#name = name;

    if (!(passwordHash instanceof Password)) {
      throw new TypeError("Expected passwordHash to be an instance of Password");
    }
    this.#passwordHash = passwordHash;
    
    this.#email = email;
    this.#profile = profile;
    this.#dateCreated = new Date();
    this.#isActive = true;
  }

  get id() {
    return this.#id;
  }

  get username() {
    return this.#username;
  }

  set username(value) {
    this.#username = value;
  }

  
  get name() {
    return this.#name;
  }

  set name(value) {
    this.#name = value;
  }

  get email() {
    return this.#email;
  }

  set email(value) {
    this.#email = value;
  }

  get profile() {
    return this.#profile;
  }

  set profile(value) {
    if (!(value instanceof UserProfile)) {
      throw new TypeError("Expected profile to be a instance of UserProfile");
    }
    this.#profile = value;
  }

  get dateCreated() {
    return this.#dateCreated;
  }

  set dateCreated(value) {
    if (!(value instanceof Date)) {
      throw new TypeError("Expected value to be a Date object");
    }
    this.#dateCreated = value;
  }

  get isActive() {
    return this.#isActive;
  }

  set isActive(value) {
    if (typeof value !== 'boolean') {
      throw new TypeError("isActive must be a boolean");
    }
    this.#isActive = value;
  }

  //verifyPassword(inputPassword) {
    //if (!(this.#passwordHash instanceof Password)) {
      //throw new TypeError("Password hash must be a Password instance");
    //}
    //return this.#passwordHash.verify(inputPassword);
  //}

  toString() {
    return `[UserAccount: ${this.#username}]`;
  }

  equals(other) {
    return other instanceof UserAccount && other.id === this.#id;
  }
}