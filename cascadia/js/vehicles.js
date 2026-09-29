/**
 * vehicles.js — Cascadia Collection inventory data
 * ----------------------------------------------------------------
 * Edit this file to add, remove, or update vehicles.
 *
 * Each vehicle object supports:
 *   id          — unique slug (used in filters, modal, form dropdown)
 *   year        — model year (number)
 *   make        — e.g. "McLaren"
 *   model       — e.g. "765LT"
 *   trim        — e.g. "Spider RWD"
 *   price       — number (USD) OR null for "Price upon request"
 *   mileage     — miles as a number
 *   drivetrain  — RWD | AWD | FWD | 4WD
 *   engine      — e.g. "755 hp 4.0L Twin-Turbo V8"
 *   transmission— e.g. "7-Speed Automatic"
 *   body        — e.g. "Convertible", "Coupe", "Sedan", "SUV / Crossover"
 *   doors       — number
 *   fuel        — usually "Gasoline"
 *   stock       — stock number displayed on card
 *   vin         — full VIN
 *   img         — URL to hero image OR null (shows graceful placeholder)
 *   tag         — optional badge text ("Flagship", "Final Edition"...) or null
 *   description — long-form copy shown in modal
 *   category    — array of filter slugs: marque + body style
 *                 e.g. ['mclaren', 'convertible']
 *   featured    — boolean — featured cards span full row
 */

const VEHICLES = [
  {
    id: 'mclaren-765lt',
    year: 2022,
    make: 'McLaren',
    model: '765LT',
    trim: 'Spider RWD',
    price: 649888,
    mileage: 5505,
    drivetrain: 'RWD',
    engine: '755 hp 4.0L Twin-Turbo V8',
    transmission: '7-Speed Automatic',
    body: 'Convertible',
    doors: 2,
    fuel: 'Gasoline',
    stock: '02',
    vin: 'SBM14SCA1NW765464',
    img: null,
    tag: 'Flagship',
    description:
      "One of 765 examples globally, the 765LT Spider is the most extreme open-air McLaren of its generation. " +
      "This Longtail pairs a race-bred carbon monocell with a 755-hp twin-turbo V8 and a drop-top for the kind of " +
      "days the Cascades occasionally offer. Low miles, impeccable specification, and documented service.",
    category: ['mclaren', 'convertible'],
  },
  {
    id: 'aventador-ultimae',
    year: 2022,
    make: 'Lamborghini',
    model: 'Aventador',
    trim: 'LP 780-4 Ultimae Coupe AWD',
    price: null,
    mileage: 348,
    drivetrain: 'AWD',
    engine: '769 hp 6.5L V12',
    transmission: '7-Speed Automatic',
    body: 'Coupe',
    doors: 2,
    fuel: 'Gasoline',
    stock: '04',
    vin: 'ZHWUU8ZD2NLA11401',
    img: 'assets/images/aventador.jpg',
    tag: 'Final Edition',
    description:
      "The final naturally-aspirated Aventador. The Ultimae is the closing chapter of the V12 lineage that began " +
      "with the Countach — a 6.5-liter symphony in its most refined state of tune. 348 miles. Virtually untouched. " +
      "A rare opportunity to own a last-of-breed halo car in effectively as-new condition.",
    category: ['lamborghini', 'coupe'],
  },
  {
    id: 'urus-performante',
    year: 2023,
    make: 'Lamborghini',
    model: 'Urus',
    trim: 'Performante AWD',
    price: null,
    mileage: 9100,
    drivetrain: 'AWD',
    engine: '657 hp 4.0L Twin-Turbo V8',
    transmission: '8-Speed Automatic',
    body: 'SUV / Crossover',
    doors: 4,
    fuel: 'Gasoline',
    stock: '09',
    vin: 'ZPBUC3ZL6PLA26773',
    img: 'assets/images/urus23.jpg',
    tag: null,
    description:
      "The Urus Performante is the Nürburgring-tuned sharpening of an already serious SUV: lower, lighter, angrier. " +
      "Carbon roof, carbon fenders, reworked aero, and a V8 retuned to 657 horsepower. Versatile enough for everyday, " +
      "quick enough to surprise supercars on a back road.",
    category: ['lamborghini', 'suv'],
  },
  {
    id: 'urus-2019',
    year: 2019,
    make: 'Lamborghini',
    model: 'Urus',
    trim: '4WD',
    price: null,
    mileage: 15840,
    drivetrain: 'AWD',
    engine: '641 hp 4.0L Twin-Turbo V8',
    transmission: '8-Speed Automatic',
    body: 'SUV / Crossover',
    doors: 4,
    fuel: 'Gasoline',
    stock: '07',
    vin: 'ZPBUA1ZL8KLA01019',
    img: null,
    tag: null,
    description:
      "A well-preserved first-generation Urus — the super-SUV that redefined the category. " +
      "641 horsepower, all-wheel drive, and seating for four adults who will never complain about a long drive again.",
    category: ['lamborghini', 'suv'],
  },
  {
    id: 'ferrari-f8',
    year: 2022,
    make: 'Ferrari',
    model: 'F8',
    trim: 'Spider RWD',
    price: null,
    mileage: 4982,
    drivetrain: 'RWD',
    engine: '710 hp 3.9L Twin-Turbo V8',
    transmission: '7-Speed Dual Clutch',
    body: 'Convertible',
    doors: 2,
    fuel: 'Gasoline',
    stock: '03',
    vin: 'ZFF93LMA4N0283773',
    img: null,
    tag: null,
    description:
      "The F8 Spider is the final open-top V8 Ferrari of the mid-engine, rear-drive lineage that began with the 308. " +
      "710 horsepower from the award-winning twin-turbo 3.9L, a retractable hardtop, and that unmistakable Ferrari " +
      "voice — undiluted by hybrids or turbos beyond what the engineers chose.",
    category: ['ferrari', 'convertible'],
  },
  {
    id: 'flying-spur',
    year: 2023,
    make: 'Bentley',
    model: 'Flying Spur',
    trim: 'Speed AWD',
    price: null,
    mileage: 9323,
    drivetrain: 'AWD',
    engine: '626 hp 6.0L W12',
    transmission: '8-Speed Dual Clutch',
    body: 'Sedan',
    doors: 4,
    fuel: 'Gasoline',
    stock: '05',
    vin: 'SCBBB6ZG5PC006300',
    img: null,
    tag: 'W12',
    description:
      "The Flying Spur Speed is the Crewe grand tourer at its most persuasive — a 626-hp twelve-cylinder sedan that " +
      "will close the distance between Seattle and Sun Valley without breaking rhythm. Among the last W12s Bentley " +
      "will ever build.",
    category: ['bentley', 'sedan'],
  },
  {
    id: 'bentayga',
    year: 2018,
    make: 'Bentley',
    model: 'Bentayga',
    trim: 'W12 Signature Edition AWD',
    price: null,
    mileage: 39782,
    drivetrain: 'AWD',
    engine: '600 hp 6.0L W12',
    transmission: '8-Speed Automatic',
    body: 'SUV / Crossover',
    doors: 4,
    fuel: 'Gasoline',
    stock: '08',
    vin: 'SJAAC2ZV7JC017580',
    img: null, // no photos from source — graceful placeholder will render
    tag: 'Signature',
    description:
      "A Signature Edition Bentayga W12 — the original twelve-cylinder flagship SUV from Crewe. " +
      "Hand-finished cabin, quilted leather, and the effortless torque of a 600-hp W12. Photography in progress.",
    category: ['bentley', 'suv'],
  },
];

if (typeof window !== 'undefined') window.VEHICLES = VEHICLES;
if (typeof module !== 'undefined' && module.exports) module.exports = VEHICLES;
