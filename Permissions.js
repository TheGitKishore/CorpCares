export class Permissions {

  #viewRequests;
  #createRequests;
  #chooseRequests;
  #updateRequests;
  #deleteRequests;
  #viewUserProfile;
  #createUserProfile;
  #updateUserProfile;
  #deleteUserProfile;
  #viewUserAccount;
  #createUserAccount;
  #updateUserAccount;
  #deleteUserAccount;
  #suspendUserAccount;

  constructor() {
    this.#viewRequests = false;
    this.#createRequests = false;
    this.#chooseRequests = false;
    this.#updateRequests = false;
    this.#deleteRequests = false;
    this.#viewUserProfile = false;
    this.#createUserProfile = false;
    this.#updateUserProfile = false;
    this.#deleteUserProfile = false;
    this.#viewUserAccount = false;
    this.#createUserAccount = false;
    this.#updateUserAccount = false;
    this.#deleteUserAccount = false;
    this.#suspendUserAccount = false;
  }

  get viewRequests() {
    return this.#viewRequests;
  }

  set viewRequests(value) {
    this.#validateBoolean(value, 'viewRequests');
    this.#viewRequests = value;
  }

  get createRequests() {
    return this.#createRequests;
  }

  set createRequests(value) {
    this.#validateBoolean(value, 'createRequests');
    this.#createRequests = value;
  }

  get chooseRequests() {
    return this.#chooseRequests;
  }

  set chooseRequests(value) {
    this.#validateBoolean(value, 'chooseRequests');
    this.#chooseRequests = value;
  }

  get updateRequests() {
    return this.#updateRequests;
  }

  set updateRequests(value) {
    this.#validateBoolean(value, 'updateRequests');
    this.#updateRequests = value;
  }

  get deleteRequests() {
    return this.#deleteRequests;
  }

  set deleteRequests(value) {
    this.#validateBoolean(value, 'deleteRequests');
    this.#deleteRequests = value;
  }

  get viewUserProfile() {
    return this.#viewUserProfile;
  }

  set viewUserProfile(value) {
    this.#validateBoolean(value, 'viewUserProfile');
    this.#viewUserProfile = value;
  }

  get createUserProfile() {
    return this.#createUserProfile;
  }

  set createUserProfile(value) {
    this.#validateBoolean(value, 'createUserProfile');
    this.#createUserProfile = value;
  }

  get updateUserProfile() {
    return this.#updateUserProfile;
  }

  set updateUserProfile(value) {
    this.#validateBoolean(value, 'updateUserProfile');
    this.#updateUserProfile = value;
  }

  get deleteUserProfile() {
    return this.#deleteUserProfile;
  }

  set deleteUserProfile(value) {
    this.#validateBoolean(value, 'deleteUserProfile');
    this.#deleteUserProfile = value;
  }

  get viewUserAccount() {
    return this.#viewUserAccount;
  }

  set viewUserAccount(value) {
    this.#validateBoolean(value, 'viewUserAccount');
    this.#viewUserAccount = value;
  }

  get createUserAccount() {
    return this.#createUserAccount;
  }

  set createUserAccount(value) {
    this.#validateBoolean(value, 'createUserAccount');
    this.#createUserAccount = value;
  }

  get updateUserAccount() {
    return this.#updateUserAccount;
  }

  set updateUserAccount(value) {
    this.#validateBoolean(value, 'updateUserAccount');
    this.#updateUserAccount = value;
  }

  get deleteUserAccount() {
    return this.#deleteUserAccount;
  }

  set deleteUserAccount(value) {
    this.#validateBoolean(value, 'deleteUserAccount');
    this.#deleteUserAccount = value;
  }

  get suspendUserAccount() {
    return this.#suspendUserAccount;
  }

  set suspendUserAccount(value) {
    this.#validateBoolean(value, 'suspendUserAccount');
    this.#suspendUserAccount = value;
  }

  #validateBoolean(value, fieldName) {
    if (typeof value !== 'boolean') {
      throw new TypeError(`${fieldName} must be a boolean`);
    }
  }
  
}