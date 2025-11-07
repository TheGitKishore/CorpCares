export class ServiceCategory {
  #id;
  #title;
  #description;

  constructor(id, title, description) {
    this.#id = id;
    this.#title = title;
    this.#description = description;
  }

  get id() { return this.#id; }
  get title() { return this.#title; }
  get description() { return this.#description; }

  static #categories = [
    new ServiceCategory(1, "Soup Kitchen", "Provide meals to those in need"),
    new ServiceCategory(2, "Home Cleaning", "Assist with household cleaning tasks"),
    new ServiceCategory(3, "Elderly Assistance", "Support elderly with daily activities"),
    new ServiceCategory(4, "Tutoring/Mentoring", "Educational support and mentoring"),
    new ServiceCategory(5, "Donation Logistics", "Help manage donations and distribution")
  ];

  static getAllCategories() {
    return this.#categories;
  }

  static getById(id) {
    return this.#categories.find(c => c.id === id) || null;
  }

  static getByTitle(title) {
    return this.#categories.find(c => c.title === title) || null;
  }
}