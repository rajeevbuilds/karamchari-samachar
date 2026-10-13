// City classification for House Rent Allowance and the list of cities that get
// the higher rates of Transport Allowance (TPTA cities).
//
// Sources, both read from the orders themselves:
//   HRA: Annexure to MoF, Dept. of Expenditure OM No. 2/5/2017-E.II(B) dated
//        07.07.2017 (reproduced as the annexure to MoD letter No. 3(1)/2015-D(Q&C)
//        dated 11.10.2017). Every city or town not listed is class Z.
//   TA:  Annexure to MoF, Dept. of Expenditure OM No. 21/5/2017-E.II(B) dated
//        07.07.2017 (cities eligible for the higher rates, Census-2011 basis).
// If a later order moves a city between classes, change it here.

export type HraClass = 'X' | 'Y' | 'Z';

export type City = {
  name: string; // as shown to the employee
  state: string;
  hra: Exclude<HraClass, 'Z'>;
  tpta: boolean; // higher rate of Transport Allowance
  note?: string;
  aliases?: string[];
};

const X = (name: string, state: string, tpta: boolean, aliases: string[] = []): City => ({ name, state, hra: 'X', tpta, aliases });
const Y = (name: string, state: string, tpta = false, aliases: string[] = [], note?: string): City => ({ name, state, hra: 'Y', tpta, aliases, note });

// Posted here, HRA is paid at Delhi (X) or Chandigarh/Y rates under special
// orders that "shall continue till further orders" (MoD letter, para 6; the
// Finance Ministry list marks Faridabad, Gurgaon, Ghaziabad and Noida with *).
const SPECIAL = 'Special order: HRA at Delhi (X-class) rates for employees posted here.';

export const CITIES: City[] = [
  // X class
  X('Delhi', 'Delhi', true, ['New Delhi']),
  X('Greater Mumbai', 'Maharashtra', true, ['Mumbai', 'Bombay']),
  X('Kolkata', 'West Bengal', true, ['Calcutta']),
  X('Chennai', 'Tamil Nadu', true, ['Madras']),
  X('Hyderabad', 'Telangana', true, ['Secunderabad']),
  X('Bengaluru', 'Karnataka', true, ['Bangalore']),
  X('Ahmedabad', 'Gujarat', true),
  X('Pune', 'Maharashtra', true),
  // Special orders: Delhi (X) rates
  { name: 'Faridabad', state: 'Haryana', hra: 'X', tpta: false, note: SPECIAL },
  { name: 'Gurgaon', state: 'Haryana', hra: 'X', tpta: false, aliases: ['Gurugram'], note: SPECIAL },
  { name: 'Ghaziabad', state: 'Uttar Pradesh', hra: 'X', tpta: true, note: SPECIAL },
  { name: 'Noida', state: 'Uttar Pradesh', hra: 'X', tpta: false, aliases: ['Greater Noida'], note: SPECIAL },
  // Y class
  Y('Vijayawada', 'Andhra Pradesh'),
  Y('Warangal', 'Telangana'),
  Y('Greater Visakhapatnam', 'Andhra Pradesh', false, ['Visakhapatnam', 'Vizag']),
  Y('Guntur', 'Andhra Pradesh'),
  Y('Nellore', 'Andhra Pradesh'),
  Y('Guwahati', 'Assam'),
  Y('Patna', 'Bihar', true),
  Y('Chandigarh', 'Chandigarh'),
  Y('Panchkula', 'Haryana', false, [], 'Special order: HRA at par with Chandigarh (Y-class).'),
  Y('S.A.S. Nagar (Mohali)', 'Punjab', false, ['Mohali', 'SAS Nagar'], 'Special order: HRA at par with Chandigarh (Y-class).'),
  Y('Durg-Bhilai Nagar', 'Chhattisgarh', false, ['Bhilai', 'Durg']),
  Y('Raipur', 'Chhattisgarh'),
  Y('Rajkot', 'Gujarat'),
  Y('Jamnagar', 'Gujarat'),
  Y('Bhavnagar', 'Gujarat'),
  Y('Vadodara', 'Gujarat', false, ['Baroda']),
  Y('Surat', 'Gujarat', true),
  Y('Srinagar', 'Jammu & Kashmir'),
  Y('Jammu', 'Jammu & Kashmir'),
  Y('Jamshedpur', 'Jharkhand'),
  Y('Dhanbad', 'Jharkhand'),
  Y('Ranchi', 'Jharkhand'),
  Y('Bokaro Steel City', 'Jharkhand', false, ['Bokaro']),
  Y('Belgaum', 'Karnataka', false, ['Belagavi']),
  Y('Hubli-Dharwad', 'Karnataka', false, ['Hubli', 'Hubballi', 'Dharwad']),
  Y('Mangalore', 'Karnataka', false, ['Mangaluru']),
  Y('Mysore', 'Karnataka', false, ['Mysuru']),
  Y('Gulbarga', 'Karnataka', false, ['Kalaburagi']),
  Y('Kozhikode', 'Kerala', true, ['Calicut']),
  Y('Kochi', 'Kerala', true, ['Cochin', 'Ernakulam']),
  Y('Thiruvananthapuram', 'Kerala', false, ['Trivandrum']),
  Y('Thrissur', 'Kerala', false, ['Trichur']),
  Y('Malappuram', 'Kerala'),
  Y('Kannur', 'Kerala', false, ['Cannanore']),
  Y('Kollam', 'Kerala', false, ['Quilon']),
  Y('Gwalior', 'Madhya Pradesh'),
  Y('Indore', 'Madhya Pradesh', true),
  Y('Bhopal', 'Madhya Pradesh'),
  Y('Jabalpur', 'Madhya Pradesh'),
  Y('Ujjain', 'Madhya Pradesh'),
  Y('Amravati', 'Maharashtra'),
  Y('Nagpur', 'Maharashtra', true),
  Y('Aurangabad', 'Maharashtra', false, ['Chhatrapati Sambhajinagar']),
  Y('Nashik', 'Maharashtra'),
  Y('Bhiwandi', 'Maharashtra'),
  Y('Solapur', 'Maharashtra'),
  Y('Kolhapur', 'Maharashtra'),
  Y('Vasai-Virar City', 'Maharashtra', false, ['Vasai', 'Virar']),
  Y('Malegaon', 'Maharashtra'),
  Y('Nanded-Waghala', 'Maharashtra', false, ['Nanded']),
  Y('Sangli', 'Maharashtra'),
  Y('Cuttack', 'Odisha'),
  Y('Bhubaneswar', 'Odisha'),
  Y('Raurkela', 'Odisha', false, ['Rourkela']),
  Y('Puducherry', 'Puducherry', false, ['Pondicherry']),
  Y('Amritsar', 'Punjab'),
  Y('Jalandhar', 'Punjab'),
  Y('Jalandhar Cantt', 'Punjab', false, [], 'Special order: HRA at Y-class rates.'),
  Y('Ludhiana', 'Punjab'),
  Y('Bikaner', 'Rajasthan'),
  Y('Jaipur', 'Rajasthan', true),
  Y('Jodhpur', 'Rajasthan'),
  Y('Kota', 'Rajasthan'),
  Y('Ajmer', 'Rajasthan'),
  Y('Salem', 'Tamil Nadu'),
  Y('Tiruppur', 'Tamil Nadu'),
  Y('Coimbatore', 'Tamil Nadu', true),
  Y('Tiruchirappalli', 'Tamil Nadu', false, ['Trichy', 'Tiruchi']),
  Y('Madurai', 'Tamil Nadu'),
  Y('Erode', 'Tamil Nadu'),
  Y('Moradabad', 'Uttar Pradesh'),
  Y('Meerut', 'Uttar Pradesh'),
  Y('Aligarh', 'Uttar Pradesh'),
  Y('Agra', 'Uttar Pradesh'),
  Y('Bareilly', 'Uttar Pradesh'),
  Y('Lucknow', 'Uttar Pradesh', true),
  Y('Kanpur', 'Uttar Pradesh', true),
  Y('Allahabad (Prayagraj)', 'Uttar Pradesh', false, ['Allahabad', 'Prayagraj']),
  Y('Gorakhpur', 'Uttar Pradesh'),
  Y('Varanasi', 'Uttar Pradesh', false, ['Benares', 'Banaras']),
  Y('Saharanpur', 'Uttar Pradesh'),
  Y('Firozabad', 'Uttar Pradesh'),
  Y('Jhansi', 'Uttar Pradesh'),
  Y('Dehradun', 'Uttarakhand'),
  Y('Asansol', 'West Bengal'),
  Y('Siliguri', 'West Bengal'),
  Y('Durgapur', 'West Bengal'),
  Y('Shillong', 'Meghalaya', false, [], 'Special order: HRA at Y-class rates.'),
  Y('Goa', 'Goa', false, ['Panaji', 'Panjim', 'Margao', 'Vasco da Gama'], 'Special order: HRA at Y-class rates.'),
  Y('Port Blair', 'Andaman & Nicobar Islands', false, [], 'Special order: HRA at Y-class rates.'),
];

// The Transport Allowance annexure lists these 19 cities; each must be in CITIES above.
export const TPTA_CITY_COUNT = 19;

const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();

const INDEX = new Map<string, City>();
for (const c of CITIES) {
  INDEX.set(norm(c.name), c);
  for (const a of c.aliases ?? []) INDEX.set(norm(a), c);
}

// Exact match on a city's name or one of its common names; null when the text
// is not in the X or Y lists (so the place is class Z).
export function findCity(text: string): City | null {
  const key = norm(text);
  if (!key) return null;
  return INDEX.get(key) ?? null;
}

// Names offered in the type-ahead list.
export const CITY_NAMES: string[] = CITIES.map((c) => c.name).sort((a, b) => a.localeCompare(b));
