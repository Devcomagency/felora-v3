/**
 * @fileoverview Constantes géographiques pour la Suisse
 * Cantons et villes principales pour le système de blocage géographique
 */

export const SWISS_CANTONS = [
  { code: 'ZH', name: 'Zurich' },
  { code: 'BE', name: 'Berne' },
  { code: 'LU', name: 'Lucerne' },
  { code: 'UR', name: 'Uri' },
  { code: 'SZ', name: 'Schwyz' },
  { code: 'OW', name: 'Obwald' },
  { code: 'NW', name: 'Nidwald' },
  { code: 'GL', name: 'Glaris' },
  { code: 'ZG', name: 'Zoug' },
  { code: 'FR', name: 'Fribourg' },
  { code: 'SO', name: 'Soleure' },
  { code: 'BS', name: 'Bâle-Ville' },
  { code: 'BL', name: 'Bâle-Campagne' },
  { code: 'SH', name: 'Schaffhouse' },
  { code: 'AR', name: 'Appenzell Rhodes-Extérieures' },
  { code: 'AI', name: 'Appenzell Rhodes-Intérieures' },
  { code: 'SG', name: 'Saint-Gall' },
  { code: 'GR', name: 'Grisons' },
  { code: 'AG', name: 'Argovie' },
  { code: 'TG', name: 'Thurgovie' },
  { code: 'TI', name: 'Tessin' },
  { code: 'VD', name: 'Vaud' },
  { code: 'VS', name: 'Valais' },
  { code: 'NE', name: 'Neuchâtel' },
  { code: 'GE', name: 'Genève' },
  { code: 'JU', name: 'Jura' },
] as const

export const SWISS_MAJOR_CITIES = [
  { name: 'Zurich', canton: 'ZH', population: 400000 },
  { name: 'Genève', canton: 'GE', population: 200000 },
  { name: 'Bâle', canton: 'BS', population: 170000 },
  { name: 'Lausanne', canton: 'VD', population: 140000 },
  { name: 'Berne', canton: 'BE', population: 130000 },
  { name: 'Winterthour', canton: 'ZH', population: 110000 },
  { name: 'Lucerne', canton: 'LU', population: 80000 },
  { name: 'Saint-Gall', canton: 'SG', population: 75000 },
  { name: 'Lugano', canton: 'TI', population: 63000 },
  { name: 'Bienne', canton: 'BE', population: 55000 },
  { name: 'Thoune', canton: 'BE', population: 43000 },
  { name: 'Köniz', canton: 'BE', population: 42000 },
  { name: 'La Chaux-de-Fonds', canton: 'NE', population: 37000 },
  { name: 'Fribourg', canton: 'FR', population: 38000 },
  { name: 'Schaffhouse', canton: 'SH', population: 36000 },
  { name: 'Vernier', canton: 'GE', population: 35000 },
  { name: 'Sion', canton: 'VS', population: 34000 },
  { name: 'Neuchâtel', canton: 'NE', population: 33000 },
  { name: 'Yverdon-les-Bains', canton: 'VD', population: 30000 },
  { name: 'Montreux', canton: 'VD', population: 26000 },
] as const

export type SwissCanton = typeof SWISS_CANTONS[number]['code']
export type SwissCity = typeof SWISS_MAJOR_CITIES[number]['name']
