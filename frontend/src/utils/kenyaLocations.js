// Kenya Counties and their Towns/Cities

export const KENYA_COUNTIES = [
  'Baringo', 'Bomet', 'Bungoma', 'Busia', 'Elgeyo-Marakwet', 'Embu', 'Garissa',
  'Homa Bay', 'Isiolo', 'Kajiado', 'Kakamega', 'Kericho', 'Kiambu', 'Kilifi',
  'Kirinyaga', 'Kisii', 'Kisumu', 'Kitui', 'Kwale', 'Laikipia', 'Lamu',
  'Machakos', 'Makueni', 'Mandera', 'Marsabit', 'Meru', 'Migori', 'Mombasa',
  "Murang'a", 'Nairobi', 'Nakuru', 'Nandi', 'Narok', 'Nyamira', 'Nyandarua',
  'Nyeri', 'Samburu', 'Siaya', 'Taita-Taveta', 'Tana River', 'Tharaka-Nithi',
  'Trans Nzoia', 'Turkana', 'Uasin Gishu', 'Vihiga', 'Wajir', 'West Pokot'
];

// County to Cities/Towns mapping
export const COUNTY_CITIES = {
  'Nairobi': ['Nairobi Central', 'Westlands', 'Dagoretti', 'Langata', 'Kibra', 'Roysambu', 'Kasarani', 'Ruaraka', 'Embakasi', 'Makadara', 'Kamukunji', 'Starehe', 'Mathare'],
  'Mombasa': ['Mombasa Island', 'Likoni', 'Changamwe', 'Jomvu', 'Kisauni', 'Nyali', 'Mvita'],
  'Kisumu': ['Kisumu Central', 'Kisumu East', 'Kisumu West', 'Seme', 'Nyando', 'Muhoroni'],
  'Nakuru': ['Nakuru Town', 'Naivasha', 'Gilgil', 'Molo', 'Njoro', 'Rongai', 'Subukia'],
  'Kiambu': ['Kiambu Town', 'Thika', 'Ruiru', 'Kikuyu', 'Limuru', 'Karuri', 'Juja', 'Gatundu', 'Githunguri'],
  'Uasin Gishu': ['Eldoret', 'Turbo', 'Moiben', 'Soy', 'Ainabkoi'],
  'Machakos': ['Machakos Town', 'Athi River', 'Kangundo', 'Matungulu', 'Kathiani', 'Mavoko'],
  'Kajiado': ['Kajiado Town', 'Ngong', 'Ongata Rongai', 'Kitengela', 'Loitokitok', 'Bissil'],
  'Kilifi': ['Kilifi Town', 'Malindi', 'Watamu', 'Gede', 'Kaloleni', 'Mariakani'],
  'Meru': ['Meru Town', 'Maua', 'Mikinduri', 'Timau', 'Nkubu', 'Chuka'],
  'Nyeri': ['Nyeri Town', 'Karatina', 'Othaya', 'Mukurweini', 'Tetu'],
  'Kakamega': ['Kakamega Town', 'Mumias', 'Butere', 'Khwisero', 'Shinyalu', 'Lugari'],
  'Bungoma': ['Bungoma Town', 'Webuye', 'Kimilili', 'Chwele', 'Sirisia'],
  'Kericho': ['Kericho Town', 'Litein', 'Londiani', 'Kipkelion', 'Sigowet'],
  'Kisii': ['Kisii Town', 'Ogembo', 'Keroka', 'Suneka', 'Nyamache'],
  'Laikipia': ['Nanyuki', 'Nyahururu', 'Rumuruti', 'Ngobit', 'Doldol'],
  'Embu': ['Embu Town', 'Siakago', 'Runyenjes', 'Mbeere'],
  'Kitui': ['Kitui Town', 'Mutomo', 'Mwingi', 'Kyuso'],
  'Garissa': ['Garissa Town', 'Dadaab', 'Modogashe', 'Masalani'],
  'Isiolo': ['Isiolo Town', 'Garbatulla', 'Merti', 'Kinna'],
  'Migori': ['Migori Town', 'Rongo', 'Awendo', 'Kehancha', 'Suna'],
  'Homa Bay': ['Homa Bay Town', 'Ndhiwa', 'Oyugis', 'Mbita', 'Kendu Bay'],
  "Murang'a": ["Murang'a Town", 'Kenol', 'Makuyu', 'Kandara', 'Kigumo'],
  'Trans Nzoia': ['Kitale', 'Kiminini', 'Endebess', 'Cherangany'],
  'Nandi': ['Kapsabet', 'Nandi Hills', 'Mosoriot', 'Kabiyet'],
  'Narok': ['Narok Town', 'Kilgoris', 'Ololulung\'a', 'Suswa'],
  'Vihiga': ['Vihiga Town', 'Mbale', 'Chavakali', 'Majengo', 'Luanda'],
  'Bomet': ['Bomet Town', 'Longisa', 'Sotik', 'Mulot'],
  'Baringo': ['Kabarnet', 'Marigat', 'Eldama Ravine', 'Mogotio'],
  'Elgeyo-Marakwet': ['Iten', 'Kapsowar', 'Tambach', 'Chepkorio'],
  'Kirinyaga': ['Kerugoya', 'Sagana', 'Baricho', 'Kutus', 'Kianyaga'],
  'Lamu': ['Lamu Town', 'Witu', 'Faza', 'Kiunga'],
  'Makueni': ['Wote', 'Makindu', 'Mtito Andei', 'Kibwezi', 'Emali'],
  'Mandera': ['Mandera Town', 'Rhamu', 'Elwak', 'Takaba'],
  'Marsabit': ['Marsabit Town', 'Moyale', 'Laisamis', 'North Horr'],
  'Nyamira': ['Nyamira Town', 'Keroka', 'Nyansiongo', 'Ekerenyo'],
  'Nyandarua': ['Ol Kalou', 'Ndaragwa', 'Engineer', 'Kinangop'],
  'Samburu': ['Maralal', 'Baragoi', 'Wamba', 'Archer\'s Post'],
  'Siaya': ['Siaya Town', 'Bondo', 'Yala', 'Ugunja', 'Ukwala'],
  'Taita-Taveta': ['Voi', 'Wundanyi', 'Mwatate', 'Taveta'],
  'Tana River': ['Hola', 'Garsen', 'Bura', 'Madogo'],
  'Tharaka-Nithi': ['Chuka', 'Kathwana', 'Marimanti', 'Chogoria'],
  'Turkana': ['Lodwar', 'Kakuma', 'Lokichoggio', 'Kalokol'],
  'Wajir': ['Wajir Town', 'Habaswein', 'Bute', 'Griftu'],
  'West Pokot': ['Kapenguria', 'Makutano', 'Chepareria', 'Sigor'],
  'Busia': ['Busia Town', 'Malaba', 'Bumala', 'Funyula'],
  'Kwale': ['Kwale Town', 'Ukunda', 'Msambweni', 'Kinango', 'Lunga Lunga']
};

// Helper functions for form select options
export const countyOptions = KENYA_COUNTIES.map(county => ({
  value: county,
  label: county
}));

export const getTownOptions = (selectedCounty) => {
  if (!selectedCounty || !COUNTY_CITIES[selectedCounty]) {
    return [];
  }
  
  return COUNTY_CITIES[selectedCounty].map(city => ({
    value: city,
    label: city
  }));
};

// For backwards compatibility - export all cities
export const KENYA_CITIES = Object.values(COUNTY_CITIES).flat();
